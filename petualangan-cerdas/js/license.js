/* License — gerbang key 1-perangkat. Aktivasi online sekali, verifikasi tiap dibuka. */
(function () {
  'use strict';
  var LS_KEY = 'pc_license_key';
  var LS_DEV = 'pc_device_id';
  var LS_TS = 'pc_verified_ts';
  var GRACE_MS = 7 * 24 * 3600 * 1000; // toleransi offline 7 hari setelah verifikasi sukses

  function getDeviceId() {
    try {
      var id = localStorage.getItem(LS_DEV);
      if (!id) {
        id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
          : 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(LS_DEV, id);
      }
      return id;
    } catch (e) { return 'dev-nostore'; }
  }

  function fingerprint() {
    return new Promise(function (resolve) {
      try {
        var c = document.createElement('canvas');
        c.width = 200; c.height = 30;
        var x = c.getContext('2d');
        x.textBaseline = 'top'; x.font = '14px sans-serif';
        x.fillText('kiko' + navigator.userAgent, 2, 2);
        var raw = c.toDataURL() + '|' + navigator.userAgent + '|' + screen.width + 'x' + screen.height +
          '|' + (Intl.DateTimeFormat().resolvedOptions().timeZone || '') + '|' + navigator.language;
        if (window.crypto && crypto.subtle) {
          crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)).then(function (buf) {
            resolve(Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('').slice(0, 64));
          }).catch(function () { resolve('fp-' + raw.length); });
        } else resolve('fp-' + raw.length);
      } catch (e) { resolve('fp-err'); }
    });
  }

  function api(path, body, timeoutMs) {
    if (window.location.protocol === 'file:') {
      return Promise.reject({ dev: true }); // buka file langsung: lewati lisensi (mode dev)
    }
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, timeoutMs || 10000);
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal
    }).then(function (r) { clearTimeout(t); return r.json().catch(function () { return { ok: false }; }); })
      .catch(function (e) { clearTimeout(t); if (e && e.dev) throw e; throw { net: true }; });
  }

  function stored() {
    try { return { key: localStorage.getItem(LS_KEY) || '', dev: getDeviceId() }; }
    catch (e) { return { key: '', dev: 'dev-nostore' }; }
  }
  function markVerified() { try { localStorage.setItem(LS_TS, String(Date.now())); } catch (e) {} }
  function graceOk() {
    try {
      var ts = parseInt(localStorage.getItem(LS_TS) || '0', 10);
      return ts && (Date.now() - ts) < GRACE_MS;
    } catch (e) { return false; }
  }

  window.License = {
    getDeviceId: getDeviceId,
    maskedKey: function () {
      var k = stored().key;
      return k ? k.slice(0, 6) + '…' + k.slice(-4) : '-';
    },
    check: function () {
      var s = stored();
      if (!s.key) return Promise.resolve(false);
      return api('/api/verify', { key: s.key, deviceId: s.dev }).then(function (r) {
        if (r && r.ok) { markVerified(); return true; }
        return false;
      }).catch(function (e) {
        if (e && e.dev) return 'dev';       // mode file:// 
        if (e && e.net && graceOk()) return 'offline'; // offline dalam masa tenggang
        return false;
      });
    },
    activate: function (key) {
      var dev = getDeviceId();
      return fingerprint().then(function (fp) {
        return api('/api/activate', { key: key, deviceId: dev, fp: fp });
      }).then(function (r) {
        if (r && r.ok) {
          try {
            localStorage.setItem(LS_KEY, key.trim().toUpperCase());
            markVerified();
          } catch (e) {}
        }
        return r;
      });
    },
    boot: function (done) {
      function enter(mode) {
        var note = document.getElementById('license-note');
        if (mode === 'offline' && note) note.textContent = '📶 Mode offline (verifikasi terakhir masih berlaku).';
        done();
      }
      this.check().then(function (st) {
        if (st === true || st === 'offline' || st === 'dev') { enter(st); return; }
        // tampilkan gerbang key
        document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
        document.getElementById('screen-license').classList.add('active');
        document.getElementById('topbar').classList.add('hidden');
        document.getElementById('btn-activate').onclick = function () {
          var inp = document.getElementById('input-key');
          var err = document.getElementById('license-err');
          var key = (inp.value || '').trim().toUpperCase();
          if (!key) { err.textContent = 'Tulis dulu kode lisensinya ya! 🔑'; return; }
          err.textContent = 'Memeriksa... ⏳';
          window.AudioMan.ensure();
          window.License.activate(key).then(function (r) {
            if (r && r.ok) { window.AudioMan.star(); enter(true); }
            else { window.AudioMan.wrong(); err.textContent = (r && r.message) || 'Kode tidak berlaku. Coba lagi!'; }
          }).catch(function (e) {
            if (e && e.dev) { enter('dev'); return; }
            window.AudioMan.wrong();
            err.textContent = '📶 Butuh internet untuk aktivasi pertama.';
          });
        };
      });
    }
  };
})();
