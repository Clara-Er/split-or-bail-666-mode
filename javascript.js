/* ══════════════════════════════════════════
   SPLIT OR BAIL — javascript.js
   Normal mode + Horror Easter Egg (666)
══════════════════════════════════════════ */

// ─── STATE ───────────────────────────────
const state = {
  bill: 0,
  people: 2,
  tip: 10,
  names: [],
};

// ─── DOM REFS ────────────────────────────
const $ = id => document.getElementById(id);

const billInput     = $('billAmount');
const peopleCount   = $('peopleCount');
const customTip     = $('customTip');
const namesList     = $('namesList');
const resSubtotal   = $('resSubtotal');
const resTip        = $('resTip');
const resTotal      = $('resTotal');
const resPerPerson  = $('resPerPerson');
const breakdown     = $('personBreakdown');
const copyToast     = $('copyToast');

// ─── FORMAT ──────────────────────────────
const fmt = n => `$${Number(n).toFixed(2)}`;

// ─── CALCULATE ───────────────────────────
function calculate() {
  const sub  = state.bill;
  const tip  = sub * (state.tip / 100);
  const tot  = sub + tip;
  const pp   = state.people > 0 ? tot / state.people : 0;

  resSubtotal.textContent  = fmt(sub);
  resTip.textContent       = fmt(tip);
  resTotal.textContent     = fmt(tot);
  resPerPerson.textContent = fmt(pp);

  // Animate per-person amount
  resPerPerson.style.transform = 'scale(1.08)';
  setTimeout(() => (resPerPerson.style.transform = ''), 200);

  // Named breakdown
  breakdown.innerHTML = '';
  const nameInputs = namesList.querySelectorAll('input');
  if (nameInputs.length > 0) {
    nameInputs.forEach(inp => {
      const name = inp.value.trim() || 'Someone';
      const row = document.createElement('div');
      row.className = 'pb-row';
      row.innerHTML = `<span>${name}</span><span>${fmt(pp)}</span>`;
      breakdown.appendChild(row);
    });
  }
}

// ─── BILL INPUT (+ 666 TRIGGER) ──────────
billInput.addEventListener('input', () => {
  const val = parseFloat(billInput.value) || 0;
  state.bill = val;
  calculate();

  if (billInput.value === '666') {
    triggerHorror(666);
  }
});

// ─── PEOPLE COUNTER ──────────────────────
$('decreasePeople').addEventListener('click', () => {
  if (state.people > 1) {
    state.people--;
    peopleCount.textContent = state.people;
    calculate();
  }
});

$('increasePeople').addEventListener('click', () => {
  if (state.people < 20) {
    state.people++;
    peopleCount.textContent = state.people;
    calculate();
  }
});

// ─── TIP CHIPS ───────────────────────────
document.querySelectorAll('.tip-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.tip-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.tip = parseInt(chip.dataset.tip);
    customTip.value = '';
    calculate();
  });
});

customTip.addEventListener('input', () => {
  const val = parseFloat(customTip.value);
  if (!isNaN(val) && val >= 0) {
    document.querySelectorAll('.tip-chip').forEach(c => c.classList.remove('active'));
    state.tip = val;
    calculate();
  }
});

// ─── NAMES ───────────────────────────────
$('addNameBtn').addEventListener('click', () => {
  if (namesList.querySelectorAll('.name-row').length >= state.people) return;
  addNameRow();
});

function addNameRow(val = '') {
  const row = document.createElement('div');
  row.className = 'name-row';
  row.innerHTML = `
    <input type="text" placeholder="Name" value="${val}" maxlength="20"/>
    <button class="remove-btn">✕</button>
  `;
  row.querySelector('.remove-btn').addEventListener('click', () => {
    row.remove();
    calculate();
  });
  row.querySelector('input').addEventListener('input', calculate);
  namesList.appendChild(row);
}

// ─── COPY ────────────────────────────────
$('copyBtn').addEventListener('click', () => {
  const sub = state.bill;
  const tip = sub * (state.tip / 100);
  const tot = sub + tip;
  const pp  = state.people > 0 ? tot / state.people : 0;

  let text = `💸 SPLIT OR BAIL\n`;
  text += `Subtotal: ${fmt(sub)}\nTip (${state.tip}%): ${fmt(tip)}\nTotal: ${fmt(tot)}\n`;
  text += `👥 ${state.people} people → ${fmt(pp)} each\n`;

  const nameInputs = namesList.querySelectorAll('input');
  if (nameInputs.length > 0) {
    text += '\nBreakdown:\n';
    nameInputs.forEach(inp => {
      text += `  ${inp.value.trim() || 'Someone'}: ${fmt(pp)}\n`;
    });
  }

  navigator.clipboard.writeText(text).then(() => {
    copyToast.classList.add('show');
    setTimeout(() => copyToast.classList.remove('show'), 2500);
  });
});

// ─── RESET ───────────────────────────────
$('resetBtn').addEventListener('click', () => {
  billInput.value   = '';
  customTip.value   = '';
  state.bill        = 0;
  state.people      = 2;
  state.tip         = 10;
  peopleCount.textContent = state.people;
  namesList.innerHTML = '';
  document.querySelectorAll('.tip-chip').forEach((c, i) => {
    c.classList.toggle('active', c.dataset.tip === '10');
  });
  calculate();
});

// ─── INIT ────────────────────────────────
calculate();


/* ══════════════════════════════════════════
   HORROR MODE
══════════════════════════════════════════ */

// ─── ENTITY DIALOGUE ─────────────────────
const ENTITY_DIALOGUE = [
  "You summoned me with that number. How... delightful.",
  "I see you brought {people} warm bodies to this feast.",
  "The bill is $666. That was not a coincidence.",
  "I'll take half. The rest? Split among the living.",
  "You seem nervous. Your fingers are shaking. Type faster.",
  "Every second you hesitate, I move closer to your seat.",
  "The others at your table... they can't see me. But I see them.",
  "I've been splitting bills since before electricity. Since before ink.",
  "Your share is {perPerson}. A fair price for a fair soul.",
  "Answer me. Don't make me ask again.",
  "I don't need money. I need acknowledgment.",
  "You typed that very quickly. Interesting.",
  "Are you scared? Your typing suggests... uncertainty.",
  "The {people} of you owe me something far more than money.",
  "I'm patient. I have been waiting since before your grandfather was born.",
  "This dinner will cost you more than you think.",
  "Keep typing. As long as you type, I stay where I am.",
  "I am 27% of your total. That is my standard rate.",
  "Tell me your name. I want to know who invited me.",
  "Good. You answered. You may live through dessert.",
];

const RESPONSES_TO_USER = [
  "Adequate. But not quick enough.",
  "I see. Go on.",
  "Your words mean little. Your speed means everything.",
  "Noted. I'm still watching.",
  "That is... acceptable.",
  "Interesting. I'll remember that.",
  "Keep going. Don't stop now.",
  "You're faster than the last one.",
  "The last person who sat here didn't answer in time.",
  "Your heartbeat is louder than your typing.",
  "I am 3 feet away now. Answer faster.",
  "That response was weak. Try again.",
  "I have been at this table for 47 years. Entertain me.",
  "Mmm. Yes. I'll allow it.",
];

// ─── HORROR STATE ────────────────────────
let horrorState = {
  active: false,
  proximity: 5,       // 0 = at you, 100 = far
  dialogueIdx: 0,
  typeTimer: null,
  timerMax: 6000,
  timerLeft: 6000,
  timerInterval: null,
  gameOver: false,
};

// ─── TRIGGER HORROR ──────────────────────
function triggerHorror(bill) {
  const app      = $('app');
  const horrorApp = $('horrorApp');

  // Shake body first
  document.body.classList.add('shaking');
  setTimeout(() => document.body.classList.remove('shaking'), 500);

  // Brief delay, then switch
  setTimeout(() => {
    app.classList.add('hidden');
    horrorApp.classList.remove('hidden');
    horrorApp.classList.add('entering');
    setTimeout(() => horrorApp.classList.remove('entering'), 900);

    horrorState.active    = true;
    horrorState.proximity = 5;
    horrorState.dialogueIdx = 0;
    horrorState.gameOver  = false;

    // Set bill displays
    const pp = (666 / state.people).toFixed(2);
    $('hBill').textContent       = '$666.00';
    $('hEntityCut').textContent  = '$333.00';
    $('hYourDebt').textContent   = `$${pp}`;

    // Clear chat
    const chat = $('horrorChat');
    chat.innerHTML = '';

    // Update proximity marker
    updateProximity(5);

    // First message
    setTimeout(() => {
      typeEntityMessage(getEntityLine(), () => {
        startDangerTimer();
      });
    }, 800);
  }, 600);
}

// ─── GET ENTITY LINE ─────────────────────
function getEntityLine() {
  const pp = (666 / state.people).toFixed(2);
  let line = ENTITY_DIALOGUE[horrorState.dialogueIdx % ENTITY_DIALOGUE.length];
  line = line.replace('{people}', state.people).replace('{perPerson}', `$${pp}`);
  horrorState.dialogueIdx++;
  return line;
}

// ─── TYPE MESSAGE ────────────────────────
function typeEntityMessage(text, onDone) {
  const chat = $('horrorChat');
  const msg  = document.createElement('div');
  msg.className = 'chat-msg entity-msg';
  msg.innerHTML = `<span class="entity-label">ENTITY_666</span><p></p>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;

  const p   = msg.querySelector('p');
  let i     = 0;
  const spd = 38;

  const typing = setInterval(() => {
    p.textContent += text[i];
    i++;
    chat.scrollTop = chat.scrollHeight;
    if (i >= text.length) {
      clearInterval(typing);
      if (onDone) setTimeout(onDone, 300);
    }
  }, spd);
}

// ─── DANGER TIMER ────────────────────────
function startDangerTimer() {
  if (horrorState.gameOver) return;

  horrorState.timerLeft = horrorState.timerMax;
  $('dangerFill').style.width = '0%';

  clearInterval(horrorState.timerInterval);
  horrorState.timerInterval = setInterval(() => {
    if (horrorState.gameOver) { clearInterval(horrorState.timerInterval); return; }

    horrorState.timerLeft -= 100;
    const pct = ((horrorState.timerMax - horrorState.timerLeft) / horrorState.timerMax) * 100;
    $('dangerFill').style.width = pct + '%';

    if (pct > 70) {
      $('dangerFill').style.background = 'linear-gradient(90deg, #ff0000, #ff0000)';
    }

    if (horrorState.timerLeft <= 0) {
      clearInterval(horrorState.timerInterval);
      entityApproach();
    }
  }, 100);
}

// ─── ENTITY APPROACHES ───────────────────
function entityApproach() {
  horrorState.proximity = Math.min(horrorState.proximity + 22, 98);
  updateProximity(horrorState.proximity);

  // Flash red
  const ha = $('horrorApp');
  ha.classList.add('flash-danger');
  setTimeout(() => ha.classList.remove('flash-danger'), 900);

  document.body.classList.add('shaking');
  setTimeout(() => document.body.classList.remove('shaking'), 400);

  $('entityStatusText').textContent = proximityText(horrorState.proximity);

  if (horrorState.proximity >= 98) {
    gameOver();
    return;
  }

  typeEntityMessage("...", () => {
    typeEntityMessage("You kept me waiting.", () => startDangerTimer());
  });
}

// ─── UPDATE PROXIMITY ────────────────────
function updateProximity(val) {
  // val: 5 (far) → 98 (on you)
  // marker left: ~4% (far) → ~82% (on you)
  const leftPct = 4 + (val / 100) * 78;
  $('entityMarker').style.left = leftPct + '%';
  $('entityStatusText').textContent = proximityText(val);
}

function proximityText(val) {
  if (val < 20)  return "The Entity is watching from afar...";
  if (val < 40)  return "The Entity has moved closer.";
  if (val < 60)  return "The Entity is at your table.";
  if (val < 80)  return "The Entity is right behind you.";
  if (val < 95)  return "The Entity is breathing on your neck.";
  return "The Entity is HERE.";
}

// ─── GAME OVER ───────────────────────────
function gameOver() {
  horrorState.gameOver = true;
  clearInterval(horrorState.timerInterval);
  $('horrorInput').disabled = true;
  $('horrorSend').disabled  = true;

  $('horrorApp').classList.add('flash-danger');
  document.body.classList.add('shaking');

  setTimeout(() => {
    const chat = $('horrorChat');
    const msg  = document.createElement('div');
    msg.className = 'chat-msg entity-msg';
    msg.innerHTML = `<span class="entity-label">ENTITY_666</span><p style="color:var(--horror-red);font-weight:bold;letter-spacing:.08em;">You were too slow. The bill is now mine to collect.<br><br>Your debt: more than money.<br><br>See you at the next dinner.</p>`;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }, 500);

  setTimeout(() => {
    $('horrorInput').disabled = false;
    $('horrorSend').disabled  = false;
    horrorState.gameOver      = false;
    horrorState.proximity     = 5;
    updateProximity(5);
    $('dangerFill').style.width = '0%';
    $('dangerFill').style.background = 'linear-gradient(90deg, #ff6b00, var(--horror-red))';
    horrorState.timerMax = Math.max(horrorState.timerMax - 500, 2500); // gets harder
    typeEntityMessage("I'll give you one more chance.", () => startDangerTimer());
  }, 4500);
}

// ─── USER TYPES ──────────────────────────
$('horrorInput').addEventListener('keydown', e => {
  if (!horrorState.active || horrorState.gameOver) return;
  // Reset timer on any keypress
  horrorState.timerLeft = horrorState.timerMax;
  $('dangerFill').style.width = '0%';
  $('dangerFill').style.background = 'linear-gradient(90deg, #ff6b00, var(--horror-red))';

  // Move entity back slightly
  if (horrorState.proximity > 5) {
    horrorState.proximity = Math.max(horrorState.proximity - 3, 5);
    updateProximity(horrorState.proximity);
  }

  if (e.key === 'Enter') sendUserMessage();
});

$('horrorSend').addEventListener('click', sendUserMessage);

function sendUserMessage() {
  const input = $('horrorInput');
  const text  = input.value.trim();
  if (!text || horrorState.gameOver) return;
  input.value = '';

  // Add user message to chat
  const chat = $('horrorChat');
  const msg  = document.createElement('div');
  msg.className = 'chat-msg user-msg';
  msg.innerHTML = `<span class="user-label">YOU</span><p>${escapeHtml(text)}</p>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;

  // Stop timer while entity responds
  clearInterval(horrorState.timerInterval);
  $('dangerFill').style.width = '0%';

  // Pull entity back a little on successful response
  horrorState.proximity = Math.max(horrorState.proximity - 12, 5);
  updateProximity(horrorState.proximity);

  // Entity responds
  const response = RESPONSES_TO_USER[Math.floor(Math.random() * RESPONSES_TO_USER.length)];
  setTimeout(() => {
    typeEntityMessage(response, () => {
      setTimeout(() => {
        typeEntityMessage(getEntityLine(), () => startDangerTimer());
      }, 500);
    });
  }, 600);
}

// ─── ESCAPE ──────────────────────────────
$('escapeBtn').addEventListener('click', () => {
  clearInterval(horrorState.timerInterval);
  horrorState.active   = false;
  horrorState.gameOver = false;

  // Glitch out then return to normal
  document.body.classList.add('shaking');
  const ha = $('horrorApp');
  ha.style.filter = 'brightness(3) contrast(3)';
  setTimeout(() => {
    ha.style.filter = 'brightness(0)';
    setTimeout(() => {
      ha.style.filter = '';
      ha.classList.add('hidden');
      $('app').classList.remove('hidden');
      // Reset bill input so 666 doesn't re-trigger
      billInput.value = '';
      state.bill = 0;
      calculate();
      document.body.classList.remove('shaking');
    }, 300);
  }, 200);
});

// ─── ESCAPE KEY ──────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('horrorApp').classList.contains('hidden')) {
    $('escapeBtn').click();
  }
});

// ─── UTIL ────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
