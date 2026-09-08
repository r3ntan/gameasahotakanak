/* SaveSystem — simpan progres ke localStorage */
(function () {
  'use strict';
  var KEY = 'petualanganCerdas_save_v1';

  function defaults() {
    return {
      name: '', level: 1, xp: 0, stars: 0, coins: 0,
      plays: 0, correctAnswers: 0, totalAnswers: 0,
      completed: { hutan: 0, desa: 0, taman: 0, bentuk: 0, hewan: 0, kota: 0 },
      areaStars: { hutan: 0, desa: 0, taman: 0, bentuk: 0, hewan: 0, kota: 0 },
      badges: [], achievements: [],
      playTimeSec: 0, bestScore: 0,
      settings: { music: true, sfx: true },
      onboarded: false, createdAt: Date.now()
    };
  }

  var Save = {
    data: defaults(),
    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          this.data = Object.assign(defaults(), parsed);
          this.data.settings = Object.assign({ music: true, sfx: true }, parsed.settings || {});
          this.data.completed = Object.assign(defaults().completed, parsed.completed || {});
          this.data.areaStars = Object.assign(defaults().areaStars, parsed.areaStars || {});
        }
      } catch (e) { this.data = defaults(); }
      return this.data;
    },
    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {}
    },
    reset: function () {
      var s = this.data.settings;
      this.data = defaults();
      this.data.settings = s;
      this.save();
    },
    addXp: function (n) {
      this.data.xp += n;
      var newLevel = Math.floor(this.data.xp / 100) + 1;
      var leveled = newLevel > this.data.level;
      this.data.level = newLevel;
      return leveled;
    },
    xpProgress: function () { return (this.data.xp % 100) / 100; },
    recordAnswers: function (correct, total) {
      this.data.correctAnswers += correct;
      this.data.totalAnswers += total;
    },
    accuracy: function () {
      if (!this.data.totalAnswers) return 100;
      return Math.round((this.data.correctAnswers / this.data.totalAnswers) * 100);
    }
  };

  window.SaveSys = Save;
})();
