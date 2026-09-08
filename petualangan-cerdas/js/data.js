/* Data konten edukasi: area, hewan, warna, bentuk, huruf, prestasi */
(function () {
  'use strict';

  window.AREAS = [
    { id: 'hutan', name: 'Hutan Angka', icon: '🌲', art: '🦁', color: '#4caf6d',
      desc: 'Berhitung & angka', game: 'count', need: null },
    { id: 'desa', name: 'Desa Huruf', icon: '🏠', art: '📚', color: '#ff9f43',
      desc: 'Huruf & kata', game: 'letter', need: { area: 'hutan', count: 2 } },
    { id: 'taman', name: 'Taman Warna', icon: '🌈', art: '🌷', color: '#ff8fb2',
      desc: 'Warna benda', game: 'color', need: { area: 'desa', count: 2 } },
    { id: 'bentuk', name: 'Dunia Bentuk', icon: '🔺', art: '⭐', color: '#9b7ede',
      desc: 'Bentuk seru', game: 'shape', need: { area: 'taman', count: 2 } },
    { id: 'hewan', name: 'Rumah Hewan', icon: '🐶', art: '🐘', color: '#4aa8e0',
      desc: 'Hewan & suara', game: 'animal', need: { area: 'bentuk', count: 2 } },
    { id: 'kota', name: 'Kota Cerdas', icon: '🏙️', art: '🚀', color: '#e85a4d',
      desc: 'Tantangan campur', game: 'math', need: { area: 'hewan', count: 2 } }
  ];

  window.ANIMALS = [
    { name: 'Kucing', emoji: '🐱', sound: 'kucing' },
    { name: 'Anjing', emoji: '🐶', sound: 'anjing' },
    { name: 'Sapi', emoji: '🐄', sound: 'sapi' },
    { name: 'Ayam', emoji: '🐔', sound: 'ayam' },
    { name: 'Singa', emoji: '🦁', sound: 'singa' },
    { name: 'Gajah', emoji: '🐘', sound: 'gajah' },
    { name: 'Bebek', emoji: '🦆', sound: 'bebek' },
    { name: 'Kambing', emoji: '🐐', sound: 'kambing' }
  ];

  window.COLORS = [
    { name: 'MERAH', css: '#e74c3c' }, { name: 'BIRU', css: '#3498db' },
    { name: 'KUNING', css: '#f1c40f' }, { name: 'HIJAU', css: '#2ecc71' },
    { name: 'UNGU', css: '#9b59b6' }, { name: 'ORANYE', css: '#e67e22' },
    { name: 'PINK', css: '#fd79a8' }, { name: 'COKELAT', css: '#8d5a2b' }
  ];

  window.SHAPES = [
    { name: 'Lingkaran', emoji: '⭕' }, { name: 'Persegi', emoji: '🟥' },
    { name: 'Segitiga', emoji: '🔺' }, { name: 'Bintang', emoji: '⭐' },
    { name: 'Hati', emoji: '❤️' }, { name: 'Persegi Panjang', emoji: '🟧' }
  ];

  window.LETTERS = [
    { letter: 'A', word: 'Apel', emoji: '🍎' }, { letter: 'B', word: 'Bola', emoji: '⚽' },
    { letter: 'K', word: 'Kucing', emoji: '🐱' }, { letter: 'S', word: 'Sapi', emoji: '🐄' },
    { letter: 'M', word: 'Mangga', emoji: '🥭' }, { letter: 'P', word: 'Pisang', emoji: '🍌' },
    { letter: 'G', word: 'Gajah', emoji: '🐘' }, { letter: 'I', word: 'Ikan', emoji: '🐟' },
    { letter: 'B', word: 'Bebek', emoji: '🦆' }, { letter: 'A', word: 'Ayam', emoji: '🐔' },
    { letter: 'S', word: 'Semangka', emoji: '🍉' }, { letter: 'J', word: 'Jeruk', emoji: '🍊' }
  ];

  window.COUNT_ITEMS = ['🍎', '⭐', '🐱', '⚽', '🌷', '🐟', '🍊', '🦋', '🚗', '🎈'];

  window.PRAISE = ['Hebat sekali! 🎉', 'Kamu pintar! 🌟', 'Bagus! 👍', 'Luar biasa! 🚀',
    'Keren! 😍', 'Betul! 🎊', 'Pintar sekali! 💖'];
  window.ENCOURAGE = ['Ayo coba lagi! 💪', 'Hampir benar! 😊', 'Tidak apa-apa, coba lagi! 🌈',
    'Kamu pasti bisa! ⭐'];

  window.ACHIEVEMENTS = [
    { id: 'jago-hitung', name: 'Jago Berhitung', desc: 'Main di Hutan Angka 3x', emoji: '🔢' },
    { id: 'sahabat-huruf', name: 'Sahabat Huruf', desc: 'Main di Desa Huruf 3x', emoji: '📚' },
    { id: 'master-warna', name: 'Master Warna', desc: 'Main di Taman Warna 3x', emoji: '🎨' },
    { id: 'ahli-bentuk', name: 'Ahli Bentuk', desc: 'Main di Dunia Bentuk 3x', emoji: '🔺' },
    { id: 'pecinta-hewan', name: 'Pecinta Hewan', desc: 'Main di Rumah Hewan 3x', emoji: '🐾' },
    { id: 'bintang-10', name: 'Pengumpul Bintang', desc: 'Kumpulkan 10 bintang', emoji: '⭐' },
    { id: 'koin-50', name: 'Tukang Koin', desc: 'Kumpulkan 50 koin', emoji: '🪙' },
    { id: 'sempurna', name: 'Nilai Sempurna', desc: 'Jawab 5 benar dalam 1 permainan', emoji: '💯' },
    { id: 'petualang', name: 'Petualang Hebat', desc: 'Buka Kota Cerdas', emoji: '🚀' }
  ];

  window.BADGES = [
    { id: 'badge-kucing', name: 'Kucing', emoji: '🐱' }, { id: 'badge-anjing', name: 'Anjing', emoji: '🐶' },
    { id: 'badge-singa', name: 'Singa', emoji: '🦁' }, { id: 'badge-gajah', name: 'Gajah', emoji: '🐘' },
    { id: 'badge-bintang', name: 'Bintang', emoji: '⭐' }, { id: 'badge-pelangi', name: 'Pelangi', emoji: '🌈' },
    { id: 'badge-roket', name: 'Roket', emoji: '🚀' }, { id: 'badge-mahkota', name: 'Mahkota', emoji: '👑' }
  ];

  window.isUnlocked = function (areaId) {
    var area = window.AREAS.find(function (a) { return a.id === areaId; });
    if (!area || !area.need) return true;
    var c = window.SaveSys.data.completed[area.need.area] || 0;
    return c >= area.need.count;
  };

  window.shuffle = function (arr) {
    arr = arr.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  };
  window.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  window.rand = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
})();
