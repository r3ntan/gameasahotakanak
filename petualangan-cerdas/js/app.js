/* App — navigasi, peta, progres, hadiah, parent mode, pengaturan */
(function () {
  'use strict';
  var S = window.SaveSys;
  var currentArea = null;
  var sessionStart = Date.now();

  function $(id) { return document.getElementById(id); }
  function show(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    $('screen-' + id).classList.add('active');
    $('topbar').classList.toggle('hidden', id === 'onboarding');
    window.scrollTo(0, 0);
  }
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.add('hidden'); }, 2200);
  }
  function clickSfx() { try { window.AudioMan.click(); } catch (e) {} }

  /* ---------- profil ---------- */
  function renderProfile() {
    var d = S.data;
    $('profile-name').textContent = d.name || 'Teman';
    $('profile-level').textContent = 'Level ' + d.level + ' • ' + d.plays + ' main';
    $('xp-fill').style.width = Math.round(S.xpProgress() * 100) + '%';
    $('val-stars').textContent = d.stars;
    $('val-coins').textContent = d.coins;
    $('settings-name').textContent = d.name || '-';
    try { $('settings-license').textContent = window.License.maskedKey(); } catch (e) {}
    $('toggle-music').classList.toggle('on', !!d.settings.music);
    $('toggle-sfx').classList.toggle('on', !!d.settings.sfx);
  }

  /* ---------- peta ---------- */
  function renderMap() {
    var box = $('island-map');
    box.innerHTML = '';
    var totalStars = 0;
    window.AREAS.forEach(function (a, i) {
      var open = window.isUnlocked(a.id);
      var card = document.createElement('button');
      card.className = 'area-card' + (open ? '' : ' locked');
      card.style.borderColor = a.color;
      var stars = S.data.areaStars[a.id] || 0;
      totalStars += stars;
      var lockHtml = open ? '<span class="sparkle" style="top:8px;left:10px">✨</span>'
        : '<span class="area-lock">🔒</span>';
      card.innerHTML = lockHtml +
        '<div class="art">' + (open ? a.art : '🔒') + '</div>' +
        '<div class="area-name">' + a.icon + ' ' + a.name + '</div>' +
        '<div class="area-desc">' + a.desc + '</div>' +
        '<div class="area-stars">' + (open ? ('⭐'.repeat(Math.min(stars, 5)) || '— main yuk! —') : 'Selesaikan area sebelumnya') + '</div>' +
        (!open && a.need ? '<div class="area-desc">Butuh ' + a.need.count + 'x main ' +
          areaName(a.need.area) + ' (' + (S.data.completed[a.need.area] || 0) + '/' + a.need.count + ')</div>' : '');
      if (open) {
        card.addEventListener('click', function () { clickSfx(); startArea(a.id); });
      } else {
        card.addEventListener('click', function () {
          window.AudioMan.wrong();
          toast('🔒 Main di ' + areaName(a.need.area) + ' dulu ya!');
        });
      }
      // animasi art tertunda acak
      card.querySelector('.art').style.animationDelay = (i * 0.3) + 's';
      box.appendChild(card);
    });
    var done = Object.values(S.data.completed).reduce(function (x, y) { return x + y; }, 0);
    $('map-progress-label').textContent = '⭐ ' + totalStars + ' • 🎮 ' + done + ' permainan';
  }
  function areaName(id) {
    var a = window.AREAS.find(function (x) { return x.id === id; });
    return a ? a.name : id;
  }

  /* ---------- mulai area ---------- */
  function startArea(areaId) {
    currentArea = areaId;
    var a = window.AREAS.find(function (x) { return x.id === areaId; });
    // unlock audio (harus dari gesture)
    try { window.AudioMan.ensure(); } catch (e) {}
    show('game');
    window.Games.start(a.id === 'kota' ? 'mixed' : a.game, function (res) { finishGame(areaId, res); });
  }

  function starsFor(correct, total) {
    if (correct === 5) return 3;
    if (correct >= 4) return 2;
    if (correct >= 2) return 1;
    return 1;
  }

  function finishGame(areaId, res) {
    var stars = starsFor(res.correct, res.total);
    var coins = res.correct * 5 + stars * 3;
    var xp = res.correct * 10 + stars * 5;
    var leveled = S.addXp(xp);
    S.data.stars += stars;
    S.data.coins += coins;
    S.data.plays++;
    S.data.completed[areaId] = (S.data.completed[areaId] || 0) + 1;
    S.data.areaStars[areaId] = Math.min(5, (S.data.areaStars[areaId] || 0) + (res.correct >= 4 ? 1 : 0) + (stars >= 2 ? 0 : 0) + (res.correct === 5 ? 1 : 0));
    if (res.correct > S.data.bestScore) S.data.bestScore = res.correct;
    // lencana acak tiap permainan sempurna / bagus
    var newBadges = [];
    if (res.correct === 5) {
      var locked = window.BADGES.filter(function (b) { return S.data.badges.indexOf(b.id) === -1; });
      if (locked.length) {
        var b = locked[Math.floor(Math.random() * locked.length)];
        S.data.badges.push(b.id);
        newBadges.push(b);
      }
    }
    S.save();
    checkAchievements();
    S.save();
    renderProfile();
    // modal hadiah
    var titles = ['Hebat Sekali! 🎉', 'Kamu Pintar! 🌟', 'Luar Biasa! 🚀', 'Keren Banget! 😍'];
    $('reward-title').textContent = res.correct === 5 ? titles[Math.floor(Math.random() * titles.length)] : (res.correct >= 3 ? 'Bagus! 👍' : 'Ayo Coba Lagi! 💪');
    $('reward-msg').textContent = S.data.name + ', kamu menjawab ' + res.correct + ' dari ' + res.total + ' dengan benar!' + (leveled ? ' 🎊 NAIK LEVEL ' + S.data.level + '!' : '');
    $('reward-gains').innerHTML = '<span class="gain">⭐ +' + stars + '</span><span class="gain">🪙 +' + coins + '</span><span class="gain">✨ +' + xp + ' XP</span>';
    $('reward-badges').innerHTML = newBadges.length ? '<p>🎁 Lencana baru: ' + newBadges.map(function (b) { return b.emoji + ' ' + b.name; }).join(', ') + '</p>' : '';
    $('modal-overlay').classList.remove('hidden');
    $('reward-modal').classList.remove('hidden');
    if (res.correct >= 3) window.AudioMan.celebrate(); else window.AudioMan.star();
    // cek area baru terbuka
    setTimeout(function () {
      var newly = window.AREAS.filter(function (a) { return window.isUnlocked(a.id); })
        .filter(function (a) { return (S.data.completed[a.id] || 0) === 0; });
      if (newly.length && res.correct >= 2) toast('🗺️ Area baru terbuka: ' + newly[0].icon + ' ' + newly[0].name + '!');
    }, 600);
  }

  /* ---------- prestasi ---------- */
  function checkAchievements() {
    var d = S.data;
    function give(id) {
      if (d.achievements.indexOf(id) === -1) {
        d.achievements.push(id);
        var a = window.ACHIEVEMENTS.find(function (x) { return x.id === id; });
        if (a) setTimeout(function () { toast('🏆 Prestasi: ' + a.emoji + ' ' + a.name + '!'); window.AudioMan.celebrate(); }, 1200);
      }
    }
    if ((d.completed.hutan || 0) >= 3) give('jago-hitung');
    if ((d.completed.desa || 0) >= 3) give('sahabat-huruf');
    if ((d.completed.taman || 0) >= 3) give('master-warna');
    if ((d.completed.bentuk || 0) >= 3) give('ahli-bentuk');
    if ((d.completed.hewan || 0) >= 3) give('pecinta-hewan');
    if (d.stars >= 10) give('bintang-10');
    if (d.coins >= 50) give('koin-50');
    if (d.bestScore >= 5) give('sempurna');
    if (window.isUnlocked('kota')) give('petualang');
  }
  function renderAchievements() {
    var box = $('ach-list');
    box.innerHTML = '';
    window.ACHIEVEMENTS.forEach(function (a) {
      var got = S.data.achievements.indexOf(a.id) !== -1;
      var d = document.createElement('div');
      d.className = 'ach' + (got ? '' : ' locked');
      d.innerHTML = '<div class="em">' + (got ? a.emoji : '🔒') + '</div><div><b>' + a.name + '</b><small>' + a.desc + (got ? ' • ✅' : '') + '</small></div>';
      box.appendChild(d);
    });
  }
  function renderCollection() {
    var box = $('badge-grid');
    box.innerHTML = '';
    window.BADGES.forEach(function (b) {
      var got = S.data.badges.indexOf(b.id) !== -1;
      var d = document.createElement('div');
      d.className = 'badge' + (got ? '' : ' locked');
      d.innerHTML = '<div class="em">' + (got ? b.emoji : '❔') + '</div><small>' + b.name + '</small>';
      box.appendChild(d);
    });
  }

  /* ---------- parent mode ---------- */
  var parentQ = null;
  function openParent() {
    show('parent');
    $('parent-dashboard').classList.add('hidden');
    $('parent-gate').classList.remove('hidden');
    var a = 5 + Math.floor(Math.random() * 10), b = 3 + Math.floor(Math.random() * 8);
    parentQ = { a: a, b: b, ans: a + b };
    $('parent-question').textContent = a + ' + ' + b + ' = ?';
    var opts = window.shuffle([parentQ.ans, parentQ.ans + 1, parentQ.ans - 1, parentQ.ans + 3]);
    var box = $('parent-answers');
    box.innerHTML = '';
    opts.forEach(function (v) {
      var btn = document.createElement('button');
      btn.className = 'choice'; btn.textContent = v;
      btn.addEventListener('click', function () {
        if (v === parentQ.ans) {
          clickSfx();
          $('parent-gate').classList.add('hidden');
          $('parent-dashboard').classList.remove('hidden');
          renderParentDash();
        } else { window.AudioMan.wrong(); toast('Jawaban kurang tepat.'); }
      });
      box.appendChild(btn);
    });
  }
  function renderParentDash() {
    var d = S.data;
    $('parent-child-name').textContent = '— ' + (d.name || 'Anak');
    var mins = Math.round((d.playTimeSec || 0) / 60);
    var stats = [
      ['🎮', d.plays, 'Permainan'], ['⭐', d.stars, 'Bintang'], ['🪙', d.coins, 'Koin'],
      ['🎯', S.accuracy() + '%', 'Akurasi'], ['📊', 'Lv ' + d.level, d.xp + ' XP'], ['⏱️', mins + ' mnt', 'Waktu main']
    ];
    $('parent-stats').innerHTML = stats.map(function (s) {
      return '<div class="stat"><b>' + s[0] + ' ' + s[1] + '</b><small>' + s[2] + '</small></div>';
    }).join('');
    $('parent-areas').innerHTML = window.AREAS.map(function (a) {
      return '<div class="parea"><span>' + a.icon + ' ' + a.name + '</span><span>' + (d.completed[a.id] || 0) + 'x main</span></div>';
    }).join('');
  }

  /* ---------- onboarding ---------- */
  function initOnboarding() {
    document.querySelectorAll('[data-onboard]').forEach(function (b) {
      b.addEventListener('click', function () {
        clickSfx();
        $('onboard-step-1').classList.add('hidden');
        $('onboard-step-2').classList.remove('hidden');
        setTimeout(function () { $('input-name').focus(); }, 100);
      });
    });
    $('btn-save-name').addEventListener('click', function () {
      var v = $('input-name').value.trim().slice(0, 14) || 'Teman Hebat';
      S.data.name = v; S.data.onboarded = true; S.save();
      $('onboard-greet').innerHTML = 'Senang bertemu denganmu, <b>' + v + '</b>! 🥰';
      $('onboard-step-2').classList.add('hidden');
      $('onboard-step-3').classList.remove('hidden');
      window.AudioMan.celebrate();
      renderProfile();
    });
    $('input-name').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') $('btn-save-name').click();
    });
    $('btn-enter-game').addEventListener('click', function () {
      clickSfx(); renderMap(); show('menu');
      $('menu-speech').textContent = 'Halo ' + S.data.name + '! Pilih petualanganmu! 🎉';
    });
  }

  /* ---------- wiring ---------- */
  function initNav() {
    document.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () {
        clickSfx();
        var t = b.getAttribute('data-nav');
        if (t === 'map') renderMap();
        if (t === 'achievements') renderAchievements();
        if (t === 'collection') renderCollection();
        show(t);
      });
    });
    $('btn-home').addEventListener('click', function () { clickSfx(); show('menu'); });
    $('profile-chip').addEventListener('click', function () { clickSfx(); show('menu'); });
    $('btn-quit-game').addEventListener('click', function () { clickSfx(); renderMap(); show('map'); });
    $('btn-repeat-sound').addEventListener('click', function () { window.Games.replayAnimal(); });
    $('btn-reward-ok').addEventListener('click', function () {
      clickSfx();
      $('modal-overlay').classList.add('hidden');
      $('reward-modal').classList.add('hidden');
      renderMap(); show('map');
    });
    $('btn-parent-top').addEventListener('click', function () { clickSfx(); openParent(); });
    $('btn-open-parent').addEventListener('click', function () { clickSfx(); openParent(); });
    $('btn-close-parent').addEventListener('click', function () { clickSfx(); show('settings'); });
    $('toggle-music').addEventListener('click', function () {
      S.data.settings.music = !S.data.settings.music; S.save();
      window.AudioMan.setMusic(S.data.settings.music);
      renderProfile(); clickSfx();
    });
    $('toggle-sfx').addEventListener('click', function () {
      S.data.settings.sfx = !S.data.settings.sfx; S.save();
      window.AudioMan.setSfx(S.data.settings.sfx);
      renderProfile(); clickSfx();
    });
    $('btn-change-name').addEventListener('click', function () {
      clickSfx();
      var v = prompt('Tulis nama baru:', S.data.name || '');
      if (v && v.trim()) { S.data.name = v.trim().slice(0, 14); S.save(); renderProfile(); toast('Nama diganti jadi ' + S.data.name + '! 😊'); }
    });
    $('btn-reset-save').addEventListener('click', function () {
      if (confirm('Hapus semua simpanan? Progres akan hilang.')) {
        var name = S.data.name;
        S.reset(); S.save(); renderProfile(); renderMap();
        toast('Simpanan dihapus.');
        if (!S.data.onboarded) { S.data.name = name; }
      }
    });
    // audio unlock pada interaksi pertama
    document.addEventListener('pointerdown', function once() {
      try {
        window.AudioMan.ensure();
        window.AudioMan.setMusic(S.data.settings.music);
        window.AudioMan.setSfx(S.data.settings.sfx);
      } catch (e) {}
    }, { once: true });
  }

  function init() {
    S.load();
    window.AudioMan.musicOn = S.data.settings.music !== false;
    window.AudioMan.sfxOn = S.data.settings.sfx !== false;
    initOnboarding();
    initNav();
    renderProfile();
    // timer waktu main
    setInterval(function () { S.data.playTimeSec = (S.data.playTimeSec || 0) + 5; S.save(); }, 5000);
    // gerbang lisensi dulu, baru masuk game
    window.License.boot(function () {
      renderProfile();
      if (S.data.onboarded && S.data.name) {
        renderMap(); show('menu');
        $('menu-speech').textContent = 'Halo lagi, ' + S.data.name + '! Ayo main! 🎈';
      } else {
        show('onboarding');
      }
    });
    setInterval(function () {
      if ($('screen-menu').classList.contains('active') && Math.random() < 0.4) {
        $('menu-speech').textContent = window.Mascot.idleSay();
      }
    }, 8000);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
