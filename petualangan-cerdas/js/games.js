/* Mesin 6 mini-game — tiap sesi 5 ronde, tap/drag, cocok untuk usia 4-8 */
(function () {
  'use strict';
  var ROUNDS = 5;

  function el(tag, cls, html) {
    var d = document.createElement(tag || 'div');
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }
  function setPrompt(t) { document.getElementById('game-prompt').textContent = t; }
  function setMood(m) {
    var mc = document.getElementById('game-mascot');
    window.Mascot.setMood(mc, m === 'good' ? 'happy' : m);
  }
  function dots(i) {
    var box = document.getElementById('game-round-dots');
    box.innerHTML = '';
    for (var r = 0; r < ROUNDS; r++) {
      var d = el('div', 'dot' + (r < i ? ' done' : r === i ? ' current' : ''));
      box.appendChild(d);
    }
  }
  function lockAll(root) {
    root.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
  }
  function answerButtons(root, options, correctIdx, onFirst) {
    var row = el('div', 'choice-row');
    var done = false;
    options.forEach(function (opt, i) {
      var b = el('button', 'choice', String(opt));
      b.addEventListener('click', function () {
        if (done) return; done = true;
        var ok = (i === correctIdx);
        b.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) row.children[correctIdx].classList.add('correct');
        lockAll(row);
        onFirst(ok);
      });
      row.appendChild(b);
    });
    root.appendChild(row);
  }

  /* ---------- GAME 1: berhitung ---------- */
  function roundCount(root, roundIdx, onAnswer) {
    var max = roundIdx < 2 ? 5 : roundIdx < 4 ? 8 : 10;
    var n = window.rand(1, max);
    var item = window.pick(window.COUNT_ITEMS);
    var name = { '🍎': 'apel', '⭐': 'bintang', '🐱': 'kucing', '⚽': 'bola', '🌷': 'bunga', '🐟': 'ikan', '🍊': 'jeruk', '🦋': 'kupu-kupu', '🚗': 'mobil', '🎈': 'balon' }[item] || 'benda';
    setPrompt('Berapa jumlah ' + name + '? Yuk hitung! 🔢');
    var stage = el('div', 'count-stage');
    for (var i = 0; i < n; i++) {
      var s = el('span', '', item);
      s.style.animationDelay = (i * 0.06) + 's';
      stage.appendChild(s);
    }
    root.appendChild(stage);
    var opts = {};
    opts[n] = true;
    while (Object.keys(opts).length < 3) opts[window.rand(1, Math.max(max, n + 2))] = true;
    var arr = Object.keys(opts).map(Number).sort(function () { return Math.random() - 0.5; });
    answerButtons(root, arr, arr.indexOf(n), onAnswer);
  }

  /* ---------- GAME 2: huruf ---------- */
  function roundLetter(root, roundIdx, onAnswer) {
    var item = window.pick(window.LETTERS);
    setPrompt('Huruf "' + item.letter + '" — benda apa yang berawalan ' + item.letter + '? 🔤');
    var big = el('div', 'big-letter', item.letter);
    root.appendChild(big);
    var others = window.shuffle(window.LETTERS.filter(function (l) { return l.word !== item.word; })).slice(0, 2);
    var choices = window.shuffle([item].concat(others));
    var row = el('div', 'choice-row');
    var done = false;
    choices.forEach(function (c) {
      var b = el('button', 'object-pick', c.emoji + '<small>' + c.word + '</small>');
      b.addEventListener('click', function () {
        if (done) return; done = true;
        var ok = (c.word === item.word);
        b.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) {
          Array.prototype.forEach.call(row.children, function (ch) {
            if (ch.textContent.indexOf(item.word) > -1) ch.classList.add('correct');
          });
        }
        lockAll(row);
        onAnswer(ok);
      });
      row.appendChild(b);
    });
    root.appendChild(row);
  }

  /* ---------- GAME 3: warna ---------- */
  var COLOR_EMOJI = ['🍎', '⚽', '🎈', '🌷', '🚗', '🐟', '🍊', '⭐', '🐸', '🧸'];
  function roundColor(root, roundIdx, onAnswer) {
    var nChoices = roundIdx < 2 ? 3 : 4;
    var target = window.pick(window.COLORS);
    setPrompt('Cari warna ' + target.name + '! 🎨');
    var intro = el('div', '', '<span class="color-word" style="background:' + target.css + ';font-size:26px">' + target.name + '</span>');
    intro.style.textAlign = 'center'; intro.style.margin = '6px 0';
    root.appendChild(intro);
    var others = window.shuffle(window.COLORS.filter(function (c) { return c.name !== target.name; })).slice(0, nChoices - 1);
    var choices = window.shuffle([target].concat(others));
    var row = el('div', 'choice-row');
    var done = false;
    choices.forEach(function (c, i) {
      var b = el('button', 'object-pick', '');
      var dot = el('div', '', '<div style="width:54px;height:54px;border-radius:50%;background:' + c.css + ';margin:0 auto;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.2)"></div><small>' + c.name.toLowerCase() + '</small>');
      b.appendChild(dot);
      b.addEventListener('click', function () {
        if (done) return; done = true;
        var ok = (c.name === target.name);
        b.classList.add(ok ? 'correct' : 'wrong');
        lockAll(row);
        onAnswer(ok);
      });
      row.appendChild(b);
    });
    root.appendChild(row);
  }

  /* ---------- GAME 4: bentuk (drag & drop sungguhan) ---------- */
  function roundShape(root, roundIdx, onAnswer) {
    setPrompt('Seret bentuk ke tempat yang sama! 🧩');
    var nPairs = roundIdx < 2 ? 2 : 3;
    var shapes = window.shuffle(window.SHAPES).slice(0, nPairs);
    var zonesBox = el('div', 'drop-row');
    var tokensBox = el('div', 'drag-row');
    tokensBox.style.marginTop = '16px';
    var remaining = nPairs, mistakes = 0, finished = false;
    var zoneOf = {};
    shapes.forEach(function (s) {
      var z = el('div', 'shape-zone', '<span style="font-size:46px;opacity:.45">' + s.emoji + '</span><span>' + s.name + '</span>');
      z.dataset.shape = s.name;
      zonesBox.appendChild(z);
      zoneOf[s.name] = z;
    });
    window.shuffle(shapes).forEach(function (s) {
      var t = el('div', 'shape-token', s.emoji);
      t.dataset.shape = s.name;
      t.title = s.name;
      tokensBox.appendChild(t);
      makeDraggable(t, zonesBox, function (shapeName, zoneEl) {
        if (finished) return;
        if (zoneEl && zoneEl.dataset.shape === shapeName && !zoneEl.classList.contains('filled')) {
          zoneEl.classList.add('filled');
          zoneEl.firstChild.style.opacity = '1';
          t.remove();
          window.AudioMan.pop();
          remaining--;
          if (remaining === 0) {
            finished = true;
            onAnswer(mistakes === 0);
          }
        } else if (zoneEl) {
          mistakes++;
          window.AudioMan.wrong();
          t.classList.add('wrong');
          setTimeout(function () { t.classList.remove('wrong'); }, 400);
          setPrompt(window.Mascot.encourage());
        }
      });
    });
    root.appendChild(zonesBox);
    root.appendChild(el('div', '', '<p style="text-align:center;color:var(--muted);font-weight:800">👆 Tahan & seret ke kotak yang cocok</p>'));
    root.appendChild(tokensBox);
  }

  function makeDraggable(token, zonesBox, onDrop) {
    var startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;
    token.style.position = 'relative';
    token.addEventListener('pointerdown', function (e) {
      dragging = true;
      token.classList.add('dragging');
      startX = e.clientX - dx; startY = e.clientY - dy;
      try { token.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    token.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dx = e.clientX - startX; dy = e.clientY - startY;
      token.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.1)';
      token.style.zIndex = '10';
    });
    function end(e) {
      if (!dragging) return;
      dragging = false;
      token.classList.remove('dragging');
      var zone = zoneUnder(token, zonesBox);
      token.style.transform = '';
      token.style.zIndex = '';
      dx = 0; dy = 0;
      onDrop(token.dataset.shape, zone);
    }
    token.addEventListener('pointerup', end);
    token.addEventListener('pointercancel', end);
  }
  function zoneUnder(token, zonesBox) {
    var r = token.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var found = null;
    zonesBox.querySelectorAll('.shape-zone').forEach(function (z) {
      var zr = z.getBoundingClientRect();
      if (cx >= zr.left && cx <= zr.right && cy >= zr.top && cy <= zr.bottom) found = z;
    });
    return found;
  }

  /* ---------- GAME 5: suara hewan ---------- */
  var currentAnimalSound = null;
  function roundAnimal(root, roundIdx, onAnswer) {
    var nChoices = roundIdx < 2 ? 3 : 4;
    var pool = window.shuffle(window.ANIMALS);
    var target = pool[0];
    var choices = window.shuffle(pool.slice(0, nChoices));
    if (choices.indexOf(target) === -1) { choices[0] = target; }
    currentAnimalSound = target.sound;
    setPrompt('Dengarkan suaranya... hewan apa itu? 🔊🐾');
    var listenBtn = el('button', 'btn c-green big', '🔊 Putar Suara');
    listenBtn.style.display = 'block'; listenBtn.style.margin = '6px auto';
    listenBtn.addEventListener('click', function () { window.AudioMan.animal(target.sound); });
    root.appendChild(listenBtn);
    var row = el('div', 'choice-row');
    var done = false;
    choices.forEach(function (a) {
      var b = el('button', 'animal-btn', a.emoji + '<small>' + a.name + '</small>');
      b.addEventListener('click', function () {
        if (done) return; done = true;
        var ok = (a.name === target.name);
        b.classList.add(ok ? 'correct' : 'wrong');
        if (ok) { window.AudioMan.animal(a.sound); }
        lockAll(row);
        onAnswer(ok);
      });
      row.appendChild(b);
    });
    root.appendChild(row);
    document.getElementById('btn-repeat-sound').classList.remove('hidden');
    setTimeout(function () { try { window.AudioMan.animal(target.sound); } catch (e) {} }, 500);
  }

  /* ---------- GAME 6: matematika ---------- */
  function roundMath(root, roundIdx, onAnswer) {
    var plus = Math.random() < 0.6;
    var a, b, ans;
    if (roundIdx < 2) { a = window.rand(1, 5); b = window.rand(1, 5); }
    else if (roundIdx < 4) { a = window.rand(2, 8); b = window.rand(1, 6); }
    else { a = window.rand(3, 9); b = window.rand(2, 9); }
    if (!plus && b > a) { var t = a; a = b; b = t; }
    ans = plus ? a + b : a - b;
    var item = window.pick(['🍎', '⭐', '⚽', '🐟', '🌷']);
    setPrompt(plus ? 'Berapa ' + a + ' + ' + b + '? ➕' : 'Berapa ' + a + ' − ' + b + '? ➖');
    var vis = el('div', 'math-visual', item.repeat(Math.min(a, 10)) + (plus ? ' ➕ ' + item.repeat(Math.min(b, 10)) : ''));
    root.appendChild(vis);
    root.appendChild(el('div', 'math-eq', a + (plus ? ' + ' : ' − ') + b + ' = ?'));
    var opts = {};
    opts[ans] = true;
    while (Object.keys(opts).length < 3) {
      var v = ans + window.rand(-3, 3);
      if (v >= 0 && v !== ans) opts[v] = true;
    }
    var arr = window.shuffle(Object.keys(opts).map(Number));
    answerButtons(root, arr, arr.indexOf(ans), onAnswer);
  }

  /* Campuran untuk Kota Cerdas */
  function roundMixed(root, roundIdx, onAnswer) {
    var r = Math.random();
    if (r < 0.45) return roundMath(root, roundIdx, onAnswer);
    if (r < 0.65) return roundCount(root, roundIdx, onAnswer);
    if (r < 0.85) return roundColor(root, roundIdx, onAnswer);
    return roundAnimal(root, roundIdx, onAnswer);
  }

  var PLAYERS = { count: roundCount, letter: roundLetter, color: roundColor, shape: roundShape, animal: roundAnimal, math: roundMath, mixed: roundMixed };

  window.Games = {
    ROUNDS: ROUNDS,
    replayAnimal: function () { if (currentAnimalSound) window.AudioMan.animal(currentAnimalSound); },
    start: function (gameId, onDone) {
      var root = document.getElementById('game-area');
      var score = 0, idx = 0, correct = 0;
      document.getElementById('btn-repeat-sound').classList.add('hidden');
      function updateScore() { document.getElementById('game-score').textContent = '⭐ ' + score; }
      updateScore();
      function next() {
        if (idx >= ROUNDS) { onDone({ correct: correct, total: ROUNDS, score: score }); return; }
        dots(idx);
        root.innerHTML = '';
        document.getElementById('btn-repeat-sound').classList.add('hidden');
        setMood('idle');
        var fn = PLAYERS[gameId] || roundCount;
        fn(root, idx, function (ok) {
          window.SaveSys.data.totalAnswers++;
          if (ok) {
            window.SaveSys.data.correctAnswers++;
            correct++; score += 10;
            window.AudioMan.correct();
            setMood('happy');
            setPrompt(window.Mascot.praise());
          } else {
            window.AudioMan.wrong();
            setMood('sad');
            setPrompt(window.Mascot.encourage());
          }
          updateScore();
          dots(idx);
          idx++;
          setTimeout(next, ok ? 1100 : 1500);
        });
      }
      next();
    }
  };
})();
