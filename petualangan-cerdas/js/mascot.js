/* Mascot Kiko — ekspresi & pesan penyemangat */
(function () {
  'use strict';
  var PHRASE = {
    happy: ['Hebat sekali! 🎉', 'Kamu pintar! 🌟', 'Bagus! 👍', 'Luar biasa! 🚀', 'Betul! 🎊'],
    sad: ['Ayo coba lagi! 💪', 'Hampir benar! 😊', 'Tidak apa-apa! 🌈', 'Kamu pasti bisa! ⭐'],
    idle: ['Ayo kita belajar sambil bermain! 🎈', 'Pilih petualanganmu! 🗺️', 'Aku Kiko, teman belajarmu! 🐣']
  };
  function setMood(el, mood) {
    if (!el) return;
    el.classList.remove('mood-happy', 'mood-sad');
    if (mood === 'happy' || mood === 'celebrate') el.classList.add('mood-happy');
    if (mood === 'sad') el.classList.add('mood-sad');
    if (mood === 'celebrate') el.classList.add('celebrate'); else el.classList.remove('celebrate');
  }
  function speak(text) {
    var els = [document.getElementById('game-prompt'), document.getElementById('menu-speech')];
    var g = document.getElementById('game-prompt');
    if (g && !document.getElementById('screen-game').classList.contains('active')) { /* menu only */ }
    return text;
  }
  window.Mascot = {
    setMood: setMood, speak: speak,
    praise: function () { return window.pick(PHRASE.happy); },
    encourage: function () { return window.pick(PHRASE.sad); },
    idleSay: function () { return window.pick(PHRASE.idle); }
  };
})();
