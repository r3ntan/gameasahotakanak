/* AudioManager — semua suara dibuat prosedural via WebAudio, tanpa file eksternal. */
(function () {
  'use strict';

  function AudioManager() {
    this.ctx = null;
    this.musicOn = true;
    this.sfxOn = true;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  AudioManager.prototype.ensure = function () {
    if (!this.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { this.ctx = new AC(); } catch (e) { this.ctx = null; } }
    }
    if (this.ctx && this.ctx.state === 'suspended') { this.ctx.resume(); }
    return this.ctx;
  };

  AudioManager.prototype.setMusic = function (on) {
    this.musicOn = !!on;
    if (on) this.startMusic(); else this.stopMusic();
  };
  AudioManager.prototype.setSfx = function (on) { this.sfxOn = !!on; };

  AudioManager.prototype.tone = function (freq, dur, type, vol, when, slideTo) {
    if (!this.sfxOn && type !== 'music') return;
    var ctx = this.ensure();
    if (!ctx) return;
    dur = dur || 0.2; type = type || 'sine'; vol = vol == null ? 0.22 : vol;
    var t = ctx.currentTime + (when || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  };

  AudioManager.prototype.click = function () { this.tone(600, 0.08, 'triangle', 0.18); };
  AudioManager.prototype.pop = function () { this.tone(400, 0.12, 'square', 0.12, 0, 900); };
  AudioManager.prototype.correct = function () {
    this.tone(523, 0.15, 'sine', 0.25); this.tone(659, 0.15, 'sine', 0.25, 0.12);
    this.tone(784, 0.3, 'sine', 0.25, 0.24);
  };
  AudioManager.prototype.wrong = function () {
    this.tone(220, 0.25, 'sawtooth', 0.12, 0, 160);
    this.tone(180, 0.3, 'sawtooth', 0.1, 0.15, 120);
  };
  AudioManager.prototype.star = function () {
    var self = this;
    [880, 1046, 1318, 1568].forEach(function (f, i) { self.tone(f, 0.2, 'sine', 0.2, i * 0.09); });
  };
  AudioManager.prototype.celebrate = function () {
    var self = this;
    [523, 587, 659, 784, 880, 1046].forEach(function (f, i) { self.tone(f, 0.22, 'triangle', 0.2, i * 0.11); });
    self.tone(2093, 0.5, 'sine', 0.12, 0.7);
  };

  // Suara hewan (sintesis sederhana, ramah anak)
  AudioManager.prototype.animal = function (kind) {
    var self = this;
    function seq(notes, type, vol) {
      notes.forEach(function (n, i) { self.tone(n[0], n[1], type || 'sine', vol || 0.25, i * n[1] * 0.9, n[2]); });
    }
    switch (kind) {
      case 'kucing': seq([[700, 0.18, 500], [750, 0.22, 480]], 'sine'); break;      // meong
      case 'anjing': seq([[300, 0.1], [0.001, 0.05], [280, 0.12]], 'square', 0.15); break; // guk
      case 'sapi': seq([[160, 0.4, 120], [140, 0.4, 100]], 'sawtooth', 0.14); break; // moo
      case 'ayam': seq([[900, 0.1, 1200], [1100, 0.12, 800], [950, 0.15, 1300]], 'square', 0.12); break;
      case 'singa': seq([[110, 0.5, 80], [130, 0.5, 90]], 'sawtooth', 0.2); break;
      case 'gajah': seq([[220, 0.5, 110], [180, 0.5, 90]], 'sawtooth', 0.18); break;
      case 'bebek': seq([[400, 0.12, 300], [420, 0.12, 310]], 'square', 0.15); break;
      case 'kambing': seq([[500, 0.15, 650], [520, 0.15, 660], [540, 0.2, 680]], 'sawtooth', 0.12); break;
      default: seq([[523, 0.2], [659, 0.2]], 'sine');
    }
  };

  // Musik latar: loop ceria pentatonik, lembut
  AudioManager.prototype.startMusic = function () {
    var self = this;
    if (this.musicTimer || !this.musicOn) return;
    var melody = [523, 587, 659, 784, 880, 784, 659, 587, 523, 0, 659, 784];
    this.musicStep = 0;
    function tick() {
      if (!self.musicOn) return;
      var ctx = self.ensure();
      if (ctx && self.musicOn) {
        var f = melody[self.musicStep % melody.length];
        if (f && self.musicOn) {
          try {
            var t = ctx.currentTime;
            var o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'triangle'; o.frequency.value = f;
            var vol = 0.045;
            // hormati pengaturan musik: gunakan gain kecil
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(vol, t + 0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
            o.connect(g); g.connect(ctx.destination);
            o.start(t); o.stop(t + 0.5);
          } catch (e) {}
        }
      }
      self.musicStep++;
    }
    tick();
    this.musicTimer = setInterval(tick, 450);
  };
  AudioManager.prototype.stopMusic = function () {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  };

  window.AudioMan = new AudioManager();
})();
