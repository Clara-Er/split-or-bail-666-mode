/* ══════════════════════════════════════════
   SPLIT OR BAIL — javascript.js
   Equal + Fair Split | Horror Easter Egg
══════════════════════════════════════════ */

// ─── STATE ───────────────────────────────
const state = {
  mode: 'equal',     // 'equal' | 'fair'
  bill: 0,
  people: 2,
  tip: 10,
  fairTip: 10,
  fairPersons: [],   // [{ id, name, items: [{ desc, amount }] }]
};

let personIdCounter = 0;
let fairPersonElCounter = 0;

// ─── DOM ─────────────────────────────────
const $ = id => document.getElementById(id);

// ─── FORMAT ──────────────────────────────
const fmt = n => `₹${Number(n).toFixed(2)}`;

// ─── MODE TOGGLE ─────────────────────────
$('modeEqualBtn').addEventListener('click', () => setMode('equal'));
$('modeFairBtn').addEventListener('click',  () => setMode('fair'));

function setMode(m) {
  state.mode = m;
  $('modeEqualBtn').classList.toggle('active', m === 'equal');
  $('modeFairBtn').classList.toggle('active',  m === 'fair');
  $('modeDesc').textContent = m === 'equal'
    ? 'Everyone pays the same amount.'
    : 'Each person pays only for what they ordered + their proportional tip.';
  $('equalSection').classList.toggle('hidden', m !== 'equal');
  $('fairSection').classList.toggle('hidden',  m !== 'fair');
  $('equalResult').classList.toggle('hidden',  m !== 'equal');
  $('fairResult').classList.toggle('hidden',   m !== 'fair');
  if (m === 'fair') calculateFair();
  else calculateEqual();
}

// ══════════════════════════════════════════
// EQUAL SPLIT
// ══════════════════════════════════════════

function calculateEqual() {
  const sub = state.bill;
  const tip = sub * (state.tip / 100);
  const tot = sub + tip;
  const pp  = state.people > 0 ? tot / state.people : 0;

  $('resSubtotal').textContent  = fmt(sub);
  $('resTip').textContent       = fmt(tip);
  $('resTotal').textContent     = fmt(tot);
  $('resPerPerson').textContent = fmt(pp);

  $('resPerPerson').style.transform = 'scale(1.08)';
  setTimeout(() => ($('resPerPerson').style.transform = ''), 200);

  // Named breakdown
  const breakdown = $('personBreakdown');
  breakdown.innerHTML = '';
  $('namesList').querySelectorAll('input').forEach(inp => {
    const row = document.createElement('div');
    row.className = 'pb-row';
    row.innerHTML = `<span>${inp.value.trim() || 'Someone'}</span><span>${fmt(pp)}</span>`;
    breakdown.appendChild(row);
  });
}

$('billAmount').addEventListener('input', () => {
  state.bill = parseFloat($('billAmount').value) || 0;
  calculateEqual();
  if ($('billAmount').value === '666') triggerHorror();
});

$('decreasePeople').addEventListener('click', () => {
  if (state.people > 1) { state.people--; $('peopleCount').textContent = state.people; calculateEqual(); }
});
$('increasePeople').addEventListener('click', () => {
  if (state.people < 20) { state.people++; $('peopleCount').textContent = state.people; calculateEqual(); }
});

document.querySelectorAll('#equalTipChips .tip-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#equalTipChips .tip-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.tip = parseInt(chip.dataset.tip);
    $('customTip').value = '';
    calculateEqual();
  });
});
$('customTip').addEventListener('input', () => {
  const v = parseFloat($('customTip').value);
  if (!isNaN(v) && v >= 0) {
    document.querySelectorAll('#equalTipChips .tip-chip').forEach(c => c.classList.remove('active'));
    state.tip = v;
    calculateEqual();
  }
});

$('addNameBtn').addEventListener('click', () => {
  if ($('namesList').querySelectorAll('.name-row').length >= state.people) return;
  const row = document.createElement('div');
  row.className = 'name-row';
  row.innerHTML = `<input type="text" placeholder="Name" maxlength="20"/><button class="remove-btn">✕</button>`;
  row.querySelector('.remove-btn').addEventListener('click', () => { row.remove(); calculateEqual(); });
  row.querySelector('input').addEventListener('input', calculateEqual);
  $('namesList').appendChild(row);
});

// ══════════════════════════════════════════
// FAIR SPLIT
// ══════════════════════════════════════════

document.querySelectorAll('#fairTipChips .tip-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#fairTipChips .tip-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.fairTip = parseInt(chip.dataset.tip);
    $('fairCustomTip').value = '';
    calculateFair();
  });
});
$('fairCustomTip').addEventListener('input', () => {
  const v = parseFloat($('fairCustomTip').value);
  if (!isNaN(v) && v >= 0) {
    document.querySelectorAll('#fairTipChips .tip-chip').forEach(c => c.classList.remove('active'));
    state.fairTip = v;
    calculateFair();
  }
});

$('addFairPersonBtn').addEventListener('click', () => addFairPerson());

function addFairPerson(name = '') {
  const id = ++personIdCounter;
  state.fairPersons.push({ id, name, items: [] });
  renderFairPerson(id);
  calculateFair();
}

function renderFairPerson(id) {
  const person = state.fairPersons.find(p => p.id === id);
  if (!person) return;

  const card = document.createElement('div');
  card.className = 'fair-person-card';
  card.dataset.personId = id;

  card.innerHTML = `
    <div class="fair-person-header">
      <input type="text" placeholder="Person's name" value="${person.name}" maxlength="24" class="person-name-input"/>
      <button class="remove-btn" title="Remove person">✕</button>
    </div>
    <div class="fair-items-list"></div>
    <button class="add-item-btn">+ Add item</button>
    <div class="fair-person-subtotal">Items total: <span>₹0.00</span></div>
  `;

  // Name input
  card.querySelector('.person-name-input').addEventListener('input', e => {
    person.name = e.target.value;
    calculateFair();
  });

  // Remove person
  card.querySelector('.fair-person-header .remove-btn').addEventListener('click', () => {
    state.fairPersons = state.fairPersons.filter(p => p.id !== id);
    card.remove();
    calculateFair();
  });

  // Add item
  card.querySelector('.add-item-btn').addEventListener('click', () => {
    addFairItem(card, person);
  });

  $('fairPersonList').appendChild(card);

  // Add one empty item by default
  addFairItem(card, person);
}

function addFairItem(card, person) {
  const itemId = ++fairPersonElCounter;
  const item   = { id: itemId, desc: '', amount: 0 };
  person.items.push(item);

  const row = document.createElement('div');
  row.className = 'fair-item-row';
  row.dataset.itemId = itemId;
  row.innerHTML = `
    <input type="text" placeholder="Item (e.g. Biryani)" maxlength="30" class="item-desc"/>
    <input type="number" placeholder="₹0.00" min="0" step="0.01" class="item-amount"/>
    <button class="remove-btn" title="Remove item">✕</button>
  `;

  row.querySelector('.item-desc').addEventListener('input', e => {
    item.desc = e.target.value;
    calculateFair();
  });

  row.querySelector('.item-amount').addEventListener('input', e => {
    item.amount = parseFloat(e.target.value) || 0;
    updatePersonSubtotal(card, person);
    calculateFair();
    // horror trigger on 666 in fair mode too
    if (e.target.value === '666') triggerHorror();
  });

  row.querySelector('.remove-btn').addEventListener('click', () => {
    person.items = person.items.filter(i => i.id !== itemId);
    row.remove();
    updatePersonSubtotal(card, person);
    calculateFair();
  });

  card.querySelector('.fair-items-list').appendChild(row);
}

function updatePersonSubtotal(card, person) {
  const total = person.items.reduce((s, i) => s + i.amount, 0);
  card.querySelector('.fair-person-subtotal span').textContent = fmt(total);
}

function calculateFair() {
  const persons   = state.fairPersons;
  const tipRate   = state.fairTip / 100;
  const tableTotal = persons.reduce((s, p) => s + p.items.reduce((ss, i) => ss + i.amount, 0), 0);

  $('fairTableTotal').textContent = fmt(tableTotal);

  const list = $('fairResultList');
  list.innerHTML = '';

  let grandTotal = 0;

  persons.forEach(p => {
    const itemsTotal = p.items.reduce((s, i) => s + i.amount, 0);
    const tipShare   = tableTotal > 0 ? itemsTotal * tipRate : 0;
    const personTotal = itemsTotal + tipShare;
    grandTotal += personTotal;

    const card = document.createElement('div');
    card.className = 'fair-result-card';

    let itemRowsHTML = p.items
      .filter(i => i.amount > 0 || i.desc)
      .map(i => `
        <div class="frc-row">
          <span>${i.desc || 'Item'}</span>
          <span>${fmt(i.amount)}</span>
        </div>
      `).join('');

    card.innerHTML = `
      <div class="frc-header">
        <span class="frc-name">${p.name || 'Person'}</span>
        <span class="frc-total">${fmt(personTotal)}</span>
      </div>
      <div class="frc-breakdown">
        ${itemRowsHTML}
        ${tipShare > 0 ? `<div class="frc-row frc-tip"><span>Tip (${state.fairTip}% of ₹${itemsTotal.toFixed(2)})</span><span>+ ${fmt(tipShare)}</span></div>` : ''}
      </div>
    `;
    list.appendChild(card);
  });

  if (persons.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);font-family:var(--font-mono);font-size:.85rem;padding:16px 0">Add people and their items above.</div>';
  }

  $('fairGrandTotal').textContent = fmt(grandTotal);
}

// ── COPY (works for both modes) ──────────
$('copyBtn').addEventListener('click', () => {
  let text = '💸 SPLIT OR BAIL\n\n';

  if (state.mode === 'equal') {
    const sub = state.bill;
    const tip = sub * (state.tip / 100);
    const tot = sub + tip;
    const pp  = state.people > 0 ? tot / state.people : 0;
    text += `Subtotal: ${fmt(sub)}\nTip (${state.tip}%): ${fmt(tip)}\nTotal: ${fmt(tot)}\n`;
    text += `👥 ${state.people} people → ${fmt(pp)} each\n`;
    $('namesList').querySelectorAll('input').forEach(inp => {
      text += `  ${inp.value.trim() || 'Someone'}: ${fmt(pp)}\n`;
    });
  } else {
    text += '🧾 Fair Split (each pays for what they ordered)\n\n';
    let grandTotal = 0;
    state.fairPersons.forEach(p => {
      const itemsTotal = p.items.reduce((s, i) => s + i.amount, 0);
      const tableTotal = state.fairPersons.reduce((s, per) => s + per.items.reduce((ss, i) => ss + i.amount, 0), 0);
      const tipShare   = tableTotal > 0 ? itemsTotal * (state.fairTip / 100) : 0;
      const total      = itemsTotal + tipShare;
      grandTotal += total;
      text += `${p.name || 'Person'}: ${fmt(total)}\n`;
      p.items.filter(i => i.amount > 0).forEach(i => {
        text += `  - ${i.desc || 'Item'}: ${fmt(i.amount)}\n`;
      });
      if (tipShare > 0) text += `  - Tip: ${fmt(tipShare)}\n`;
      text += '\n';
    });
    text += `Grand Total: ${fmt(grandTotal)}\n`;
  }

  navigator.clipboard.writeText(text).then(() => {
    const t = $('copyToast');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  });
});

// ── RESET ───────────────────────────────
$('resetBtn').addEventListener('click', () => {
  $('billAmount').value = '';
  $('customTip').value  = '';
  $('fairCustomTip').value = '';
  state.bill    = 0;
  state.people  = 2;
  state.tip     = 10;
  state.fairTip = 10;
  state.fairPersons = [];
  personIdCounter = 0;
  $('peopleCount').textContent = 2;
  $('namesList').innerHTML = '';
  $('fairPersonList').innerHTML = '';
  document.querySelectorAll('.tip-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.tip === '10');
  });
  calculateEqual();
  calculateFair();
});

// INIT
calculateEqual();


/* ══════════════════════════════════════════
   HORROR MODE — MonkeyType Typing Game
══════════════════════════════════════════ */

// ─── ROUND SENTENCES (10 rounds, escalating difficulty) ─────────────
const HORROR_ROUNDS = [
  // Round 1 — short, chill
  { text: "pay what you owe", time: 8 },
  // Round 2
  { text: "I have been at this table before.", time: 9 },
  // Round 3
  { text: "The bill was ₹666. That was not a coincidence.", time: 11 },
  // Round 4 — punctuation enters
  { text: "Don't stop typing. Don't look behind you. Keep going.", time: 13 },
  // Round 5 — numbers
  { text: "You owe me ₹333.00. Pay it. Now. Not later.", time: 13 },
  // Round 6 — longer
  { text: "Everyone who has typed that number has eventually met me.", time: 14 },
  // Round 7 — mixed
  { text: "The chair behind you just shifted. 3 inches. I counted.", time: 15 },
  // Round 8 — long + punctuation
  { text: "I have been splitting bills since 1887. You are not special.", time: 15 },
  // Round 9 — brutal
  { text: "One of you is lying about what they ordered. I know who. Do you?", time: 16 },
  // Round 10 — hardest
  { text: "You cannot escape the debt. ₹666 was just the beginning — I always collect.", time: 17 },
];

const ENTITY_INTROS = [
  "Prove you're worth my time.",
  "I've been waiting. Type.",
  "The debt grows with every second.",
  "Show me your hands can keep up.",
  "Faster this time. I'm getting closer.",
  "You've survived this far. Surprising.",
  "My patience runs thin. As does yours.",
  "I can feel you hesitating. Don't.",
  "Almost there. Almost mine.",
  "Last chance. Make it count.",
];

// ─── HORROR STATE ────────────────────────
let hG = {
  active: false,
  round: 0,         // 0-indexed
  lives: 3,
  proximity: 5,     // 5–95
  roundErrors: 0,   // errors this round (max 3 before life lost)
  totalErrors: 0,
  totalChars: 0,
  roundStartTime: 0,
  wpmSamples: [],
  timerInterval: null,
  timerLeft: 0,
  gameOver: false,
  audioCtx: null,
  oscillator: null,
  gainNode: null,
};

// ─── TRIGGER ─────────────────────────────
function triggerHorror() {
  if (hG.active) return;

  document.body.classList.add('shaking');
  setTimeout(() => document.body.classList.remove('shaking'), 600);

  setTimeout(() => {
    $('app').classList.add('hidden');
    const ha = $('horrorApp');
    ha.classList.remove('hidden');
    ha.classList.add('entering');
    setTimeout(() => ha.classList.remove('entering'), 1100);

    hG = { ...hG, active: true, round: 0, lives: 3, proximity: 5,
            roundErrors: 0, totalErrors: 0, totalChars: 0,
            wpmSamples: [], gameOver: false };

    $('winScreen').classList.add('hidden');
    $('horrorCard').classList.remove('hidden');

    updateHUD();
    updateProximity(5);
    startAmbientSound();
    $('vignetteLayer').classList.add('danger');

    setTimeout(() => startRound(), 900);
  }, 700);
}

// ─── ROUND LOGIC ─────────────────────────
function startRound() {
  if (hG.gameOver || hG.round >= 10) return;

  const rd = HORROR_ROUNDS[hG.round];
  hG.roundErrors = 0;
  hG.roundStartTime = Date.now();

  // Entity intro message
  const intro = ENTITY_INTROS[hG.round] || "Type.";
  $('entityMsgText').textContent = intro;

  // Render target chars
  renderTarget(rd.text);

  // Reset input
  const inp = $('tzInput');
  inp.value = '';
  inp.disabled = false;
  inp.focus();

  // Reset mistake pips
  renderMistakePips(0);

  updateHUD();

  // Start timer
  startRoundTimer(rd.time);
}

function renderTarget(text) {
  const el = $('tzTarget');
  el.innerHTML = '';
  for (const ch of text) {
    const span = document.createElement('span');
    span.textContent = ch;
    span.className = 'tc';
    el.appendChild(span);
  }
}

function renderMistakePips(count) {
  const pips = $('mistakePips').querySelectorAll('.mp');
  pips.forEach((p, i) => {
    p.classList.remove('active');
    if (i < count) p.classList.add('active');
  });
}

// ─── TYPING INPUT ────────────────────────
$('tzInput').addEventListener('input', handleTyping);

function handleTyping(e) {
  if (!hG.active || hG.gameOver) return;

  const inp = $('tzInput');
  const typed = inp.value;
  const target = HORROR_ROUNDS[hG.round].text;
  const spans = $('tzTarget').querySelectorAll('.tc');

  let errors = 0;

  for (let i = 0; i < spans.length; i++) {
    const s = spans[i];
    if (i >= typed.length) {
      s.className = 'tc'; // untyped
    } else if (typed[i] === target[i]) {
      s.className = 'tc correct';
    } else {
      s.className = 'tc wrong';
      errors++;
    }
  }

  hG.totalChars = Math.max(hG.totalChars, typed.length);

  // Track round errors (wrong chars typed)
  if (errors > hG.roundErrors) {
    const newErrs = errors - hG.roundErrors;
    hG.roundErrors = errors;
    hG.totalErrors += newErrs;
    renderMistakePips(Math.min(errors, 3));

    // Flicker on error
    $('tzTarget').classList.add('error-flash');
    setTimeout(() => $('tzTarget').classList.remove('error-flash'), 200);

    // Push entity closer on errors
    hG.proximity = Math.min(hG.proximity + 6, 95);
    updateProximity(hG.proximity);

    if (errors >= 3) {
      loseLife();
      return;
    }
  }

  // Live WPM
  const elapsed = (Date.now() - hG.roundStartTime) / 60000;
  if (elapsed > 0.05) {
    const wpm = Math.round((typed.length / 5) / elapsed);
    $('hudWpm').textContent = wpm;
    // Good speed = entity retreats
    if (wpm > 40 && hG.proximity > 5) {
      hG.proximity = Math.max(hG.proximity - 1, 5);
      updateProximity(hG.proximity);
    }
  }

  // Accuracy
  const acc = hG.totalChars > 0
    ? Math.round(((hG.totalChars - hG.totalErrors) / hG.totalChars) * 100)
    : 100;
  $('hudAcc').textContent = acc + '%';

  // Check completion — typed full length and all correct
  if (typed.length >= target.length && errors === 0) {
    roundComplete();
  }
}

// ─── ROUND TIMER ─────────────────────────
function startRoundTimer(seconds) {
  clearInterval(hG.timerInterval);
  hG.timerLeft = seconds;
  $('tzTimerFill').style.width = '0%';
  $('tzTimerFill').style.background = 'var(--horror-red)';
  $('tzTimerText').textContent = seconds + 's';

  hG.timerInterval = setInterval(() => {
    if (hG.gameOver) { clearInterval(hG.timerInterval); return; }
    hG.timerLeft -= 0.1;
    const pct = Math.max(0, 100 - (hG.timerLeft / HORROR_ROUNDS[hG.round].time) * 100);
    $('tzTimerFill').style.width = pct + '%';
    $('tzTimerText').textContent = Math.max(0, hG.timerLeft).toFixed(1) + 's';

    if (pct > 70) $('tzTimerFill').style.background = '#ff2200';

    if (hG.timerLeft <= 0) {
      clearInterval(hG.timerInterval);
      loseLife();
    }
  }, 100);
}

// ─── LIFE / GAME OVER ────────────────────
function loseLife() {
  if (hG.gameOver) return;
  clearInterval(hG.timerInterval);
  $('tzInput').disabled = true;
  hG.lives = Math.max(0, hG.lives - 1);

  // Push entity forward hard
  hG.proximity = Math.min(hG.proximity + 22, 95);
  updateProximity(hG.proximity);

  updateHUD();

  if (hG.lives <= 0) {
    triggerGameOver();
  } else {
    // Shake, warn, then next round same or retry
    $('horrorCard').classList.add('shaking');
    setTimeout(() => $('horrorCard').classList.remove('shaking'), 600);
    $('entityMsgText').textContent = ["You almost made it.", "Slower hands, slower fate.", "One less chance. Keep going."][hG.lives - 1] || "Keep going.";
    setTimeout(() => { hG.round++; if (hG.round < 10) startRound(); else triggerWin(); }, 1800);
  }
}

function triggerGameOver() {
  hG.gameOver = true;
  hG.active = false;
  clearInterval(hG.timerInterval);

  // Jumpscare
  playScreech();
  const js = $('jumpscare');
  js.classList.remove('hidden');
  document.body.classList.add('shaking');

  setTimeout(() => {
    js.classList.add('hidden');
    document.body.classList.remove('shaking');
    $('corruptionLayer').classList.add('active');
    $('entityMsgText').textContent = "I'll see you at the next dinner.";
    $('tzInput').disabled = true;
    // Show restart option after 2s
    setTimeout(() => {
      $('entityMsgText').textContent = "Game Over. But I never truly leave. [ ESC to bail ]";
      $('corruptionLayer').classList.remove('active');
    }, 2500);
  }, 1800);
}

function roundComplete() {
  clearInterval(hG.timerInterval);
  $('tzInput').disabled = true;

  // WPM for this round
  const elapsed = (Date.now() - hG.roundStartTime) / 60000;
  const wpm = Math.round((HORROR_ROUNDS[hG.round].text.length / 5) / elapsed);
  hG.wpmSamples.push(wpm);

  // Entity retreats on success
  hG.proximity = Math.max(hG.proximity - 15, 5);
  updateProximity(hG.proximity);

  const msgs = [
    "...adequate.", "Acceptable. Barely.", "You survived this round.",
    "Faster than expected.", "I retreat. For now.", "Not bad. Not safe either.",
    "Speed noted. Don't get comfortable.", "You live another round.",
    "Almost impressive.", "The entity steps back."
  ];
  $('entityMsgText').textContent = msgs[hG.round] || "Continue.";

  hG.round++;
  setTimeout(() => {
    if (hG.round >= 10) triggerWin();
    else startRound();
  }, 1600);
}

// ─── WIN ─────────────────────────────────
function triggerWin() {
  hG.active = false;
  clearInterval(hG.timerInterval);
  stopAmbientSound();

  $('horrorCard').classList.add('hidden');
  const ws = $('winScreen');
  ws.classList.remove('hidden');

  const avgWpm = hG.wpmSamples.length
    ? Math.round(hG.wpmSamples.reduce((a,b) => a+b, 0) / hG.wpmSamples.length)
    : 0;
  const acc = hG.totalChars > 0
    ? Math.round(((hG.totalChars - hG.totalErrors) / hG.totalChars) * 100)
    : 100;

  $('winStats').innerHTML = `
    <div class="ws-row"><span>Rounds survived</span><strong>10 / 10</strong></div>
    <div class="ws-row"><span>Lives remaining</span><strong>${'🕯'.repeat(hG.lives)}${'⬛'.repeat(3 - hG.lives)}</strong></div>
    <div class="ws-row"><span>Average WPM</span><strong>${avgWpm}</strong></div>
    <div class="ws-row"><span>Accuracy</span><strong>${acc}%</strong></div>
    <div class="ws-row"><span>Total errors</span><strong>${hG.totalErrors}</strong></div>
  `;

  $('winExitBtn').addEventListener('click', escapeHorror, { once: true });
}

// ─── HUD ─────────────────────────────────
function updateHUD() {
  $('hudRound').textContent = `${hG.round + 1} / 10`;
  const candles = ['🕯','🕯','🕯'];
  for (let i = hG.lives; i < 3; i++) candles[i] = '🪦';
  $('hudLives').textContent = candles.join('');
}

// ─── PROXIMITY ───────────────────────────
function updateProximity(val) {
  const leftPct = 4 + (val / 100) * 76;
  $('entityMarker').style.left = leftPct + '%';
  $('proxDesc').textContent = proxDesc(val);
}

function proxDesc(v) {
  if (v < 20) return "Safe distance maintained.";
  if (v < 35) return "Keep responding. Don't slow down.";
  if (v < 50) return "Type. Don't stop typing.";
  if (v < 65) return "Do not look behind you.";
  if (v < 80) return "It can read what you're typing.";
  return "Too late to run.";
}

// ─── AUDIO ───────────────────────────────
function startAmbientSound() {
  try {
    hG.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = hG.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(38, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    hG.oscillator = osc; hG.gainNode = gain;
  } catch(e) {}
}

function playScreech() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    src.connect(gain); gain.connect(ctx.destination);
    src.start();
  } catch(e) {}
}

function stopAmbientSound() {
  if (hG.gainNode && hG.audioCtx) {
    hG.gainNode.gain.linearRampToValueAtTime(0, hG.audioCtx.currentTime + 0.5);
    setTimeout(() => { if (hG.audioCtx) { hG.audioCtx.close(); hG.audioCtx = null; } }, 600);
  }
}

// ─── ESCAPE ──────────────────────────────
$('escapeBtn').addEventListener('click', escapeHorror);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('horrorApp').classList.contains('hidden')) escapeHorror();
});

function escapeHorror() {
  clearInterval(hG.timerInterval);
  hG.active = false; hG.gameOver = false;
  stopAmbientSound();
  const ha = $('horrorApp');
  ha.style.filter = 'brightness(5) contrast(4)';
  setTimeout(() => { ha.style.filter = 'brightness(0)'; }, 150);
  setTimeout(() => {
    ha.style.filter = '';
    ha.classList.add('hidden');
    $('app').classList.remove('hidden');
    $('vignetteLayer').classList.remove('danger','critical');
    $('corruptionLayer').classList.remove('active');
    $('billAmount').value = '';
    state.bill = 0;
    calculateEqual();
    document.body.classList.remove('shaking');
    $('horrorCard').classList.remove('hidden');
    $('winScreen').classList.add('hidden');
  }, 350);
}

// ─── UTILS ───────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ══════════════════════════════════════════
   TRIP TRACKER
══════════════════════════════════════════ */

// ─── STATE ───────────────────────────────
const trip = {
  people: [],    // [{ id, name }]
  expenses: [],  // [{ id, desc, amount, payerId, splitAmong: [ids] }]
};

let _pid = 0;  // person id counter
let _eid = 0;  // expense id counter

// ─── MODE: add trip tab ───────────────────
// Patch setMode to handle 'trip'
const _origSetMode = typeof setMode === 'function' ? setMode : null;

document.getElementById('modeTripBtn').addEventListener('click', () => activateTripMode());

function activateTripMode() {
  // deactivate other modes visually
  document.getElementById('modeEqualBtn').classList.remove('active');
  document.getElementById('modeFairBtn').classList.remove('active');
  document.getElementById('modeTripBtn').classList.add('active');
  document.getElementById('modeDesc').textContent = 'Track shared trip expenses. Settle with minimum transactions.';

  document.getElementById('equalSection').classList.add('hidden');
  document.getElementById('fairSection').classList.add('hidden');
  document.getElementById('equalResult').classList.add('hidden');
  document.getElementById('fairResult').classList.add('hidden');
  document.querySelector('.card-grid').style.display = 'none';

  document.getElementById('tripSection').classList.remove('hidden');
  renderTripPeople();
  renderExpenses();
}

// Patch existing mode buttons to hide trip section
['modeEqualBtn','modeFairBtn'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    document.getElementById('tripSection').classList.add('hidden');
    document.querySelector('.card-grid').style.display = '';
    document.getElementById('modeTripBtn').classList.remove('active');
  });
});

// ─── PEOPLE ──────────────────────────────
document.getElementById('addTripPersonBtn').addEventListener('click', () => {
  if (trip.people.length >= 8) return;
  addTripPerson('');
});

function addTripPerson(name) {
  const id = ++_pid;
  trip.people.push({ id, name });
  renderTripPeople();
  refreshAllExpenseSplitChips();
}

function removeTripPerson(id) {
  trip.people = trip.people.filter(p => p.id !== id);
  // Remove from all split-among arrays
  trip.expenses.forEach(e => {
    e.splitAmong = e.splitAmong.filter(pid => pid !== id);
    if (e.payerId === id) e.payerId = null;
  });
  renderTripPeople();
  renderExpenses();
}

function renderTripPeople() {
  const grid = document.getElementById('tripPeopleGrid');
  grid.innerHTML = '';
  trip.people.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'trip-person-chip';
    chip.innerHTML = `
      <input type="text" placeholder="Name" value="${escHtmlT(p.name)}" maxlength="18"/>
      <button class="remove-btn" title="Remove">✕</button>
    `;
    chip.querySelector('input').addEventListener('input', e => {
      p.name = e.target.value;
      refreshAllExpenseSplitChips();
    });
    chip.querySelector('.remove-btn').addEventListener('click', () => removeTripPerson(p.id));
    grid.appendChild(chip);
  });

  const btn = document.getElementById('addTripPersonBtn');
  btn.style.display = trip.people.length >= 8 ? 'none' : '';
}

// ─── EXPENSES ────────────────────────────
document.getElementById('addExpenseBtn').addEventListener('click', () => {
  if (trip.people.length < 2) {
    alert('Add at least 2 people first.');
    return;
  }
  const id = ++_eid;
  trip.expenses.push({
    id,
    desc: '',
    amount: 0,
    payerId: trip.people[0]?.id || null,
    splitAmong: trip.people.map(p => p.id),  // everyone by default
  });
  renderExpenses();
});

function removeExpense(id) {
  trip.expenses = trip.expenses.filter(e => e.id !== id);
  renderExpenses();
}

function renderExpenses() {
  const list = document.getElementById('expenseList');
  const empty = document.getElementById('expenseEmpty');
  list.innerHTML = '';

  if (trip.expenses.length === 0) {
    list.appendChild(empty);
    empty.classList.remove('hidden');
    return;
  }

  trip.expenses.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'expense-card';

    // Build payer options
    const payerOptions = trip.people.map(p =>
      `<option value="${p.id}" ${exp.payerId === p.id ? 'selected' : ''}>${escHtmlT(p.name || 'Person')}</option>`
    ).join('');

    card.innerHTML = `
      <div class="expense-card-top">
        <input type="text" placeholder="What for? (e.g. Hotel)" class="exp-desc" value="${escHtmlT(exp.desc)}" maxlength="40"/>
        <input type="number" placeholder="₹ Amount" class="exp-amount" value="${exp.amount || ''}" min="0" step="0.01"/>
        <select class="exp-payer">
          <option value="">Who paid?</option>
          ${payerOptions}
        </select>
        <button class="expense-remove-btn">✕</button>
      </div>
      <div class="split-among-wrap">
        <div class="split-among-label">Split among:</div>
        <div class="split-among-chips"></div>
      </div>
    `;

    // Description
    card.querySelector('.exp-desc').addEventListener('input', e => { exp.desc = e.target.value; });

    // Amount
    card.querySelector('.exp-amount').addEventListener('input', e => {
      exp.amount = parseFloat(e.target.value) || 0;
    });

    // Payer
    card.querySelector('.exp-payer').addEventListener('change', e => {
      exp.payerId = parseInt(e.target.value) || null;
    });

    // Remove
    card.querySelector('.expense-remove-btn').addEventListener('click', () => removeExpense(exp.id));

    // Split chips
    renderSplitChips(card.querySelector('.split-among-chips'), exp);

    list.appendChild(card);
  });

  // Hide settlement result when expenses change
  document.getElementById('settlementResult').classList.add('hidden');
  document.getElementById('settlementEmpty').classList.remove('hidden');
}

function renderSplitChips(container, exp) {
  container.innerHTML = '';

  // "Everyone" chip
  const allChip = document.createElement('span');
  const allSelected = trip.people.every(p => exp.splitAmong.includes(p.id));
  allChip.className = 'split-chip split-chip-all' + (allSelected ? ' selected' : '');
  allChip.textContent = 'Everyone';
  allChip.addEventListener('click', () => {
    if (allSelected) {
      exp.splitAmong = [];
    } else {
      exp.splitAmong = trip.people.map(p => p.id);
    }
    renderExpenses();
  });
  container.appendChild(allChip);

  // Individual chips
  trip.people.forEach(p => {
    const chip = document.createElement('span');
    const sel  = exp.splitAmong.includes(p.id);
    chip.className = 'split-chip' + (sel ? ' selected' : '');
    chip.textContent = p.name || 'Person';
    chip.addEventListener('click', () => {
      if (sel) {
        exp.splitAmong = exp.splitAmong.filter(id => id !== p.id);
      } else {
        exp.splitAmong.push(p.id);
      }
      renderExpenses();
    });
    container.appendChild(chip);
  });
}

function refreshAllExpenseSplitChips() {
  renderExpenses();
}

// ─── SETTLE UP ───────────────────────────
document.getElementById('settleBtn').addEventListener('click', runSettlement);

function runSettlement() {
  if (trip.people.length < 2) { alert('Add at least 2 people.'); return; }
  if (trip.expenses.length === 0) { alert('Add at least one expense.'); return; }

  // Validate
  for (const e of trip.expenses) {
    if (!e.payerId) { alert(`One expense is missing a payer. Please fill all fields.`); return; }
    if (e.splitAmong.length === 0) { alert(`One expense has nobody to split among. Select at least one person.`); return; }
    if (e.amount <= 0) { alert(`All expenses must have an amount greater than 0.`); return; }
  }

  // ── Compute net balances ──
  // balance[id] = total paid - total owed
  const balance = {};
  trip.people.forEach(p => balance[p.id] = 0);

  let grandTotal = 0;

  trip.expenses.forEach(exp => {
    const share = exp.amount / exp.splitAmong.length;
    grandTotal += exp.amount;

    // Payer gets credited
    balance[exp.payerId] += exp.amount;

    // Each person in splitAmong owes their share
    exp.splitAmong.forEach(pid => {
      balance[pid] -= share;
    });
  });

  // ── Min-cash-flow algorithm ──
  const transactions = minCashFlow(balance);

  // ── Render ──
  displaySettlement(balance, transactions, grandTotal);
}

function minCashFlow(balance) {
  // Deep copy and work with floating point rounded
  const bal = {};
  for (const id in balance) bal[id] = Math.round(balance[id] * 100) / 100;

  const transactions = [];
  const EPSILON = 0.005;

  for (let iter = 0; iter < 100; iter++) {
    // Find max creditor and max debtor
    let maxCredId = null, maxDebtId = null;
    let maxCred = 0, maxDebt = 0;

    for (const id in bal) {
      if (bal[id] > maxCred)  { maxCred = bal[id];  maxCredId = id; }
      if (bal[id] < maxDebt) { maxDebt = bal[id];  maxDebtId = id; }
    }

    if (maxCredId === null || maxDebtId === null) break;
    if (maxCred < EPSILON && Math.abs(maxDebt) < EPSILON) break;

    // Settle min(credit, debt)
    const amount = Math.min(maxCred, Math.abs(maxDebt));
    if (amount < EPSILON) break;

    transactions.push({
      from: parseInt(maxDebtId),
      to:   parseInt(maxCredId),
      amount: Math.round(amount * 100) / 100,
    });

    bal[maxCredId] -= amount;
    bal[maxDebtId] += amount;
  }

  return transactions;
}

function displaySettlement(balance, transactions, grandTotal) {
  const result = document.getElementById('settlementResult');
  const empty  = document.getElementById('settlementEmpty');

  result.classList.remove('hidden');
  empty.classList.add('hidden');

  // Summary strip
  const summary = document.getElementById('settlementSummary');
  summary.innerHTML = `
    <div class="ss-item"><span class="ss-label">Total Spent</span><span class="ss-value">₹${grandTotal.toFixed(2)}</span></div>
    <div class="ss-item"><span class="ss-label">Expenses</span><span class="ss-value">${trip.expenses.length}</span></div>
    <div class="ss-item"><span class="ss-label">People</span><span class="ss-value">${trip.people.length}</span></div>
  `;

  // Transaction count
  document.getElementById('txCount').textContent =
    transactions.length === 0 ? 'All settled! 🎉' : `${transactions.length} payment${transactions.length > 1 ? 's' : ''}`;

  // Transaction list
  const list = document.getElementById('settlementList');
  list.innerHTML = '';

  if (transactions.length === 0) {
    list.innerHTML = `<div class="expense-empty" style="color:var(--accent)">Everyone is already settled. No payments needed! 🎉</div>`;
  } else {
    transactions.forEach((tx, i) => {
      const fromName = trip.people.find(p => p.id === tx.from)?.name || 'Person';
      const toName   = trip.people.find(p => p.id === tx.to)?.name   || 'Person';
      const row = document.createElement('div');
      row.className = 'settlement-tx';
      row.style.animationDelay = `${i * 0.06}s`;
      row.innerHTML = `
        <span class="stx-from">${escHtmlT(fromName)}</span>
        <span class="stx-arrow">→</span>
        <span class="stx-to">${escHtmlT(toName)}</span>
        <span class="stx-pays">₹${tx.amount.toFixed(2)}</span>
      `;
      list.appendChild(row);
    });
  }

  // Balances breakdown
  const balDiv = document.getElementById('settlementBalances');
  balDiv.innerHTML = '<div class="bal-title">Individual Balances</div><div class="bal-grid"></div>';
  const grid = balDiv.querySelector('.bal-grid');

  trip.people.forEach(p => {
    const bal = Math.round(balance[p.id] * 100) / 100;
    const chip = document.createElement('div');
    chip.className = 'bal-chip ' + (bal > 0.005 ? 'positive' : bal < -0.005 ? 'negative' : 'zero');
    const statusText = bal > 0.005 ? 'gets back' : bal < -0.005 ? 'owes' : 'settled ✓';
    chip.innerHTML = `
      <span class="bal-name">${escHtmlT(p.name || 'Person')}</span>
      <span class="bal-amount">${bal >= 0 ? '+' : ''}₹${Math.abs(bal).toFixed(2)}</span>
      <span class="bal-status">${statusText}</span>
    `;
    grid.appendChild(chip);
  });

  // Scroll to result
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── COPY SETTLEMENT ─────────────────────
document.getElementById('copySettlementBtn').addEventListener('click', () => {
  const txs = document.querySelectorAll('.settlement-tx');
  let text = '🧳 TRIP SETTLEMENT\n\n';
  txs.forEach(tx => {
    const from  = tx.querySelector('.stx-from').textContent;
    const to    = tx.querySelector('.stx-to').textContent;
    const pays  = tx.querySelector('.stx-pays').textContent;
    text += `${from} → ${to}: ${pays}\n`;
  });
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copySettlementBtn');
    const orig = btn.textContent;
    btn.textContent = 'Copied! 🎉';
    setTimeout(() => btn.textContent = orig, 2000);
  });
});

// ─── UTIL (local scope) ──────────────────
function escHtmlT(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}