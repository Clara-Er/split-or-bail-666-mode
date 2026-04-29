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
  if ($('billAmount').value === '666') triggerHorror(state.bill);
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
    if (e.target.value === '666') triggerHorror(666);
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
   HORROR MODE
══════════════════════════════════════════ */

// ─── ENTITY DIALOGUE ─────────────────────
// Phase 1 — cold, observational
const PHASE1 = [
  "You summoned me with that number. How... delightful.",
  "I have been waiting at this table for a very long time.",
  "The bill is ₹666. That was not a coincidence. Nothing ever is.",
  "I'll take half. The rest — split among the living.",
  "I can see your screen. I can see your hands. Keep typing.",
  "Everyone who has typed that number... has met me eventually.",
  "The others at your table cannot see me. But I see them all.",
];

// Phase 2 — agitated, pressing
const PHASE2 = [
  "You are slowing down. That is a mistake.",
  "I moved an inch closer while you hesitated just now. Did you feel it?",
  "Every second of silence is a second I don't need to ask politely.",
  "The chair behind you just shifted. Don't look.",
  "I have been splitting bills since before this city had electricity.",
  "Your typing is getting erratic. Interesting. Fear does that.",
  "I am not here for the money. I am here because you invited me.",
];

// Phase 3 — intimate, terrifying
const PHASE3 = [
  "I can smell your dinner from here. Curious choice.",
  "The person to your left is about to check their phone. Watch.",
  "You keep looking at the screen but not at what's behind it.",
  "One of you is lying about what they ordered. I already know who.",
  "Your share is calculated. The math isn't what concerns me right now.",
  "You are the only one at this table who can hear me. How special.",
  "I don't want your money. I want you to sit with the discomfort a little longer.",
];

// Phase 4 — final approach, unhinged
const PHASE4 = [
  "I am at the edge of your table now. I can read your screen.",
  "Stop. Breathe. Then type. In that order.",
  "You should not have looked away just now.",
  "The candle on your table — did it just flicker? Yes. That was me.",
  "I know your name. I've always known your name.",
  "You are typing faster now. Good. But fast isn't fast enough anymore.",
];

const RESPONSES = [
  "Adequate. But slower than last time.",
  "I see. Continue.",
  "Your words mean little here. Only speed matters now.",
  "Noted. I am still watching.",
  "...acceptable.",
  "Interesting. I will remember that.",
  "You're faster than the last one who sat here.",
  "The last person who hesitated at this table — I don't see them anymore.",
  "Your heartbeat is louder than your typing.",
  "Three inches closer. Answer faster next time.",
  "That response was weak. Weak responses have consequences.",
  "I have sat at this table for 47 years. Entertain me.",
  "Good. You may live through dessert.",
  "Mmm. Yes. I'll allow it... this time.",
];

// ─── HORROR STATE ────────────────────────
let hS = {
  active: false,
  proximity: 4,      // 4 = far, 95 = touching you
  phase: 1,          // 1-4
  dialoguePools: [], // shuffled pool from current phase
  dlgIdx: 0,
  timerMax: 7000,
  timerLeft: 7000,
  timerInterval: null,
  gameOver: false,
  lives: 3,          // 3 strikes = definitive game over
  audioCtx: null,
  oscillator: null,
};

// ─── TRIGGER ─────────────────────────────
function triggerHorror(bill) {
  if (hS.active) return;

  document.body.classList.add('shaking');
  setTimeout(() => document.body.classList.remove('shaking'), 600);

  setTimeout(() => {
    $('app').classList.add('hidden');
    const ha = $('horrorApp');
    ha.classList.remove('hidden');
    ha.classList.add('entering');
    setTimeout(() => ha.classList.remove('entering'), 1100);

    // Init state
    hS.active    = true;
    hS.proximity = 4;
    hS.phase     = 1;
    hS.dlgIdx    = 0;
    hS.gameOver  = false;
    hS.lives     = 3;
    hS.timerMax  = 7000;
    hS.dialoguePools = shuffle([...PHASE1]);

    // Bill display
    const pp = (666 / Math.max(state.people, state.fairPersons.length || 1, 1)).toFixed(2);
    $('hBill').textContent      = '₹666.00';
    $('hEntityCut').textContent = '₹333.00';
    $('hYourDebt').textContent  = `₹${pp}`;

    $('horrorChat').innerHTML = '';
    updateProximity(4);
    updatePips(0);
    $('dangerFill').style.width = '0%';
    $('horrorInput').disabled = false;
    $('horrorSend').disabled  = false;

    // Start ambient sound
    startAmbientSound();

    // Vignette on
    $('vignetteLayer').classList.add('danger');

    // First message after short pause
    setTimeout(() => {
      typeEntityMsg(nextDialogue(), () => startTimer());
    }, 900);
  }, 700);
}

// ─── DIALOGUE ────────────────────────────
function nextDialogue() {
  if (hS.dlgIdx >= hS.dialoguePools.length) {
    hS.dlgIdx = 0;
  }
  const line = hS.dialoguePools[hS.dlgIdx++];
  return line;
}

function setPhase(p) {
  if (p === hS.phase) return;
  hS.phase = p;
  const pools = { 1: PHASE1, 2: PHASE2, 3: PHASE3, 4: PHASE4 };
  hS.dialoguePools = shuffle([...(pools[p] || PHASE4)]);
  hS.dlgIdx = 0;

  // Visual escalation
  const v = $('vignetteLayer');
  if (p >= 3) v.classList.add('critical');

  // Corruption layer on phase 3+
  if (p >= 3) {
    $('corruptionLayer').classList.add('active');
    setTimeout(() => $('corruptionLayer').classList.remove('active'), 4000);
  }

  // Sound escalation
  if (hS.audioCtx && hS.oscillator) {
    hS.oscillator.frequency.linearRampToValueAtTime(40 + p * 12, hS.audioCtx.currentTime + 1);
  }
}

// ─── TYPING EFFECT ───────────────────────
function typeEntityMsg(text, onDone) {
  const chat = $('horrorChat');
  const msg  = document.createElement('div');
  msg.className = 'chat-msg entity-msg';
  msg.innerHTML = `<span class="entity-label">ENTITY_666</span><p></p>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;

  const p = msg.querySelector('p');
  let i = 0;

  // Vary typing speed by phase — faster = more agitated
  const spd = Math.max(18, 42 - hS.phase * 6);

  const t = setInterval(() => {
    p.textContent += text[i++];
    chat.scrollTop = chat.scrollHeight;
    if (i >= text.length) {
      clearInterval(t);
      if (onDone) setTimeout(onDone, 280);
    }
  }, spd);
}

// ─── TIMER ───────────────────────────────
function startTimer() {
  if (hS.gameOver) return;
  hS.timerLeft = hS.timerMax;

  clearInterval(hS.timerInterval);
  $('dangerFill').style.background = 'linear-gradient(90deg, #ff6b00, var(--horror-red))';
  $('dangerFill').style.width = '0%';

  hS.timerInterval = setInterval(() => {
    if (hS.gameOver) { clearInterval(hS.timerInterval); return; }

    hS.timerLeft -= 80;
    const pct = Math.min(100, ((hS.timerMax - hS.timerLeft) / hS.timerMax) * 100);
    $('dangerFill').style.width = pct + '%';

    if (pct > 60) $('dangerFill').style.background = 'linear-gradient(90deg, #ff2200, #ff0000)';
    if (pct > 85) {
      // warning flash
      $('horrorChat').classList.add('warning-flash');
      setTimeout(() => $('horrorChat').classList.remove('warning-flash'), 300);
    }

    if (hS.timerLeft <= 0) {
      clearInterval(hS.timerInterval);
      entityApproach();
    }
  }, 80);
}

// ─── APPROACH ────────────────────────────
function entityApproach() {
  const step = 16 + hS.phase * 5; // bigger jumps in later phases
  hS.proximity = Math.min(hS.proximity + step, 95);
  updateProximity(hS.proximity);

  // Flash + shake
  const ha = $('horrorApp');
  ha.classList.add('flash-danger');
  setTimeout(() => ha.classList.remove('flash-danger'), 1000);

  const hc = $('horrorCard');
  hc.classList.add('shaking');
  setTimeout(() => hc.classList.remove('shaking'), 1000);

  document.body.classList.add('shaking');
  setTimeout(() => document.body.classList.remove('shaking'), 500);

  // Corruption glitch burst
  $('corruptionLayer').classList.add('active');
  setTimeout(() => $('corruptionLayer').classList.remove('active'), 600);

  // Update phase by proximity
  if (hS.proximity > 70) setPhase(4);
  else if (hS.proximity > 45) setPhase(3);
  else if (hS.proximity > 22) setPhase(2);

  // Update pips
  updatePips(hS.proximity);

  if (hS.proximity >= 95) {
    runGameOver();
    return;
  }

  // Entity reacts to approach
  const approachLines = [
    "...",
    "You kept me waiting.",
    "Silence. Interesting.",
    "I moved. Did you notice?",
    "That hesitation cost you.",
  ];
  const line = approachLines[Math.floor(Math.random() * approachLines.length)];
  typeEntityMsg(line, () => {
    setTimeout(() => typeEntityMsg(nextDialogue(), () => startTimer()), 400);
  });
}

// ─── GAME OVER ───────────────────────────
function runGameOver() {
  hS.gameOver = true;
  hS.lives    = Math.max(0, hS.lives - 1);
  clearInterval(hS.timerInterval);

  $('horrorInput').disabled = true;
  $('horrorSend').disabled  = true;

  // Full corruption
  $('corruptionLayer').classList.add('active');
  $('vignetteLayer').classList.add('critical');

  document.body.classList.add('shaking');

  const gameOverLines = [
    "You were too slow.<br><br>The bill is mine now.<br><br>Your debt is not measured in rupees.<br><br>I'll see you at the next dinner.",
    "Silence was your answer. I accepted it.<br><br>You owe me something I haven't named yet.<br><br>I'll collect it when the time is right.",
    "There is no escape button in the real world.<br><br>Only at this table.<br><br>I'll be here when you come back.",
  ];
  const msg = gameOverLines[Math.floor(Math.random() * gameOverLines.length)];

  setTimeout(() => {
    typeEntityMsg(msg);
  }, 600);

  // Reset after 5s and come back angrier
  setTimeout(() => {
    $('corruptionLayer').classList.remove('active');
    hS.gameOver  = false;
    hS.proximity = 4;
    hS.timerMax  = Math.max(hS.timerMax - 800, 2200); // gets shorter each time
    updateProximity(4);
    $('dangerFill').style.width = '0%';
    $('dangerFill').style.background = 'linear-gradient(90deg, #ff6b00, var(--horror-red))';
    $('horrorInput').disabled = false;
    $('horrorSend').disabled  = false;

    if (hS.lives <= 0) {
      // Truly final
      typeEntityMsg("...You keep coming back.<br>Good.<br>So do I.", () => {
        hS.lives = 3;
        hS.timerMax = 7000;
        hS.phase = 1;
        hS.dialoguePools = shuffle([...PHASE1]);
        setTimeout(() => startTimer(), 1000);
      });
    } else {
      setPhase(Math.min(hS.phase + 1, 4));
      typeEntityMsg("I'll give you one more chance. Don't waste it.", () => startTimer());
    }
  }, 5500);
}

// ─── USER TYPES ──────────────────────────
$('horrorInput').addEventListener('keydown', e => {
  if (!hS.active || hS.gameOver) return;

  // Typing resets timer
  hS.timerLeft = hS.timerMax;
  $('dangerFill').style.width = '0%';
  $('dangerFill').style.background = 'linear-gradient(90deg, #ff6b00, var(--horror-red))';

  // Typing pushes entity back slightly
  if (hS.proximity > 4) {
    hS.proximity = Math.max(hS.proximity - 2, 4);
    updateProximity(hS.proximity);
  }

  if (e.key === 'Enter') sendHorrorMsg();
});

$('horrorSend').addEventListener('click', sendHorrorMsg);

function sendHorrorMsg() {
  if (!hS.active || hS.gameOver) return;
  const input = $('horrorInput');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';

  // User message
  const chat = $('horrorChat');
  const msg  = document.createElement('div');
  msg.className = 'chat-msg user-msg';
  msg.innerHTML = `<span class="user-label">YOU</span><p>${escHtml(text)}</p>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;

  // Stop timer, pull entity back on good response
  clearInterval(hS.timerInterval);
  $('dangerFill').style.width = '0%';
  hS.proximity = Math.max(hS.proximity - 14, 4);
  updateProximity(hS.proximity);

  // Entity responds then asks again
  const resp = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
  setTimeout(() => {
    typeEntityMsg(resp, () => {
      setTimeout(() => typeEntityMsg(nextDialogue(), () => startTimer()), 500);
    });
  }, 500);
}

// ─── PROXIMITY HELPERS ───────────────────
function updateProximity(val) {
  const leftPct = 4 + (val / 100) * 76;
  $('entityMarker').style.left = leftPct + '%';
  $('entityStatusText').textContent = proxText(val);
  $('proxDesc').textContent = proxDesc(val);
  updatePips(val);
}

function proxText(v) {
  if (v < 18) return "The Entity is watching from afar...";
  if (v < 32) return "The Entity has moved closer.";
  if (v < 50) return "The Entity is at your table.";
  if (v < 68) return "The Entity is directly behind you.";
  if (v < 82) return "The Entity is breathing on your neck.";
  if (v < 93) return "The Entity is inches from your face.";
  return "THE ENTITY IS HERE.";
}

function proxDesc(v) {
  if (v < 18) return "Safe distance maintained.";
  if (v < 32) return "Keep responding. Don't slow down.";
  if (v < 50) return "Type. Don't stop typing.";
  if (v < 68) return "Do not look behind you.";
  if (v < 82) return "It can read what you're typing.";
  return "Too late to run.";
}

function updatePips(proximity) {
  const pips = $('wlPips').querySelectorAll('.wl-pip');
  const filled = Math.round((proximity / 95) * 5);
  pips.forEach((pip, i) => {
    pip.classList.remove('lit', 'lit-orange');
    if (i < filled) {
      pip.classList.add(i < 3 ? 'lit-orange' : 'lit');
    }
  });
}

// ─── AMBIENT SOUND (Web Audio API) ───────
function startAmbientSound() {
  try {
    hS.audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    const ctx    = hS.audioCtx;

    // Sub-bass rumble
    const osc    = ctx.createOscillator();
    const gain   = ctx.createGain();
    osc.type     = 'sine';
    osc.frequency.setValueAtTime(40, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    hS.oscillator = osc;
    hS.gainNode   = gain;

    // High-pitched creak (once)
    setTimeout(() => {
      if (!hS.audioCtx) return;
      const creak   = ctx.createOscillator();
      const creakG  = ctx.createGain();
      creak.type    = 'sawtooth';
      creak.frequency.setValueAtTime(800, ctx.currentTime);
      creak.frequency.linearRampToValueAtTime(200, ctx.currentTime + 1.2);
      creakG.gain.setValueAtTime(0.03, ctx.currentTime);
      creakG.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      creak.connect(creakG);
      creakG.connect(ctx.destination);
      creak.start();
      creak.stop(ctx.currentTime + 1.3);
    }, 1500);

  } catch(e) {
    // Audio not available — silent horror
  }
}

function stopAmbientSound() {
  if (hS.gainNode) {
    hS.gainNode.gain.linearRampToValueAtTime(0, hS.audioCtx.currentTime + 0.5);
  }
  setTimeout(() => {
    if (hS.audioCtx) { hS.audioCtx.close(); hS.audioCtx = null; }
    hS.oscillator = null;
    hS.gainNode   = null;
  }, 600);
}

// ─── ESCAPE ──────────────────────────────
$('escapeBtn').addEventListener('click', escapeHorror);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('horrorApp').classList.contains('hidden')) escapeHorror();
});

function escapeHorror() {
  clearInterval(hS.timerInterval);
  hS.active   = false;
  hS.gameOver = false;
  stopAmbientSound();

  const ha = $('horrorApp');
  document.body.classList.add('shaking');
  ha.style.filter = 'brightness(5) contrast(4)';
  setTimeout(() => { ha.style.filter = 'brightness(0)'; }, 150);
  setTimeout(() => {
    ha.style.filter = '';
    ha.classList.add('hidden');
    $('app').classList.remove('hidden');
    $('vignetteLayer').classList.remove('danger', 'critical');
    $('corruptionLayer').classList.remove('active');
    $('billAmount').value = '';
    $('dangerFill').style.width = '0%';
    state.bill = 0;
    calculateEqual();
    document.body.classList.remove('shaking');
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
