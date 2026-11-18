/**
 * NISB Borderland Trails — Dual Endpoint Application
 * Endpoint 1: Technical Puzzle Challenges (Accessible via QR)
 * Endpoint 2: Digital Memory Grid Arena (Accessible via QR)
 */

// ============================================================================
// AUTHORITATIVE UPDATED 20 QUESTIONS DATASET (Calibrated Values)
// ============================================================================
const QUESTIONS_DB = [
  {
    id: 1,
    title: "1. THE REVERSED PROCESSOR",
    prompt: "A processor receives the following 8-bit instruction. Apply the correct processor procedure and report the final 8-bit output.",
    code: "INPUT = 10110100",
    summary: "8-bit word procedure: Full reversal -> Invert every bit -> Split into two 4-bit nibbles and exchange left/right nibbles.",
    expected: "00101101",
    answers: ["00101101", "0010 1101"]
  },
  {
    id: 2,
    title: "2. THE FORBIDDEN GATE",
    prompt: "Evaluate the circuit from left to right. Report the single output bit.",
    code: "A = 1\nB = 1\nC = 1\n\nA and B enter G1. The output of G1 and C enter G2.",
    summary: "G1 outputs 1 when exactly one input is 1. G2 outputs 1 when its two inputs are different.",
    expected: "1",
    answers: ["1"]
  },
  {
    id: 3,
    title: "3. THE MEMORY FRAGMENT",
    prompt: "Execute the following instruction sequence using the memory table. Report the final 4-bit result.",
    code: "M1 = 1100\nM2 = 1011\nM3 = 0101\nM4 = 0110\n\nREAD M2\nXOR M4\nAND M1\nNOT RESULT",
    summary: "Execute operations sequentially on 4-bit registers: READ M2, XOR M4, AND M1, NOT RESULT.",
    expected: "0011",
    answers: ["0011"]
  },
  {
    id: 4,
    title: "4. THE CLOCK SYNCHRONIZATION ERROR",
    prompt: "Four machines report different times. Use the synchronization procedure to determine the master time.",
    code: "Machine A = 14:20\nMachine B = 14:08\nMachine C = 14:32\nMachine D = 14:26",
    summary: "For 4 clock readings: sort them, discard earliest and latest, average the remaining two. Round down seconds.",
    expected: "14:23",
    answers: ["14:23", "14.23", "14 23"]
  },
  {
    id: 5,
    title: "5. THE CORRUPTED TRANSMISSION",
    prompt: "A system receives the following 7-bit data.\n\nCheck whether the data is valid. If an error is detected, apply the correction procedure and report the corrected data.",
    code: "RECEIVED = 1101011",
    summary: "For 7-bit word, total 1s must be even. If odd, assume the final bit is corrupted and flip only that bit.",
    expected: "1101010",
    answers: ["1101010"]
  },
  {
    id: 6,
    title: "6. THE ROUTER'S DILEMMA",
    prompt: "A packet must travel from Router A to Router F.\n\nFind the lowest-cost route and report its total cost.",
    code: "Available routes:\nA → B → D → F\nA → C → E → F\nA → B → E → F\n\nConnection costs:\nA-B = 5\nB-D = 2\nD-F = 3\nA-C = 3\nC-E = 2\nE-F = 1\nB-E = 4",
    summary: "Add link costs. Tie-break: fewer links, then alphabetical next-hop.",
    expected: "A-C-E-F, cost 6",
    answers: ["A-C-E-F, cost 6", "A-C-E-F, 6", "A-C-E-F", "6", "A->C->E->F, 6", "A->C->E->F", "A-C-E-F: 6", "A - C - E - F, 6", "cost 6"]
  },
  {
    id: 7,
    title: "7. THE EXPIRING PACKET",
    prompt: "A packet begins with TTL = 10 and travels through the following devices:\n\nRouter A → Switch B → Router C → Router D → Destination\n\nDetermine whether the packet reaches its destination and calculate its remaining TTL.",
    code: "INITIAL TTL = 10\nPATH: Router A → Switch B → Router C → Router D → Destination",
    summary: "Every router decreases TTL by 2. Every switch decreases TTL by 1. Discard if TTL <= 0.",
    expected: "Yes, TTL 3",
    answers: ["Yes, 3", "3", "TTL 3", "TTL = 3", "Delivered with TTL 3", "Delivered, 3", "Yes, TTL 3", "Yes, TTL = 3", "Yes, TTL: 3", "Delivered, TTL 3"]
  },
  {
    id: 8,
    title: "8. THE FIREWALL CODE",
    prompt: "A security system receives the following six-bit authentication token.\n\nTransform the token using the firewall procedure and report the final six-bit token.",
    code: "TOKEN = 100110",
    summary: "For 6-bit token: reverse the bits, XOR with 110011, then rotate left by 2 positions.",
    expected: "101010",
    answers: ["101010"]
  },
  {
    id: 9,
    title: "9. THE LOST PASSWORD",
    prompt: "A message has been encrypted using a Caesar cipher.\n\nDecrypt the message and report the original uppercase word.",
    code: "MODE = C3\nENCRYPTED = ZRUOG",
    summary: "For C3: decrypt by shifting each letter 3 places backward in the alphabet (A wraps to Z).",
    expected: "WORLD",
    answers: ["WORLD", "world"]
  },
  {
    id: 10,
    title: "10. THE AUTHENTICATION SEQUENCE",
    prompt: "A security system requires a six-digit authentication code.\n\nThe following values are provided:\n\nA = 5\nB = 8\nC = 3\nD = 2\nE = 4\nF = 1\n\nGenerate the valid six-digit authentication code.",
    code: "A = 5\nB = 8\nC = 3\nD = 2\nE = 4\nF = 1",
    summary: "Digits in exact order: (A+C) last digit; |B-D|; (E*F) last digit; A+F; C+E; B-F.",
    expected: "864677",
    answers: ["864677"]
  },
  {
    id: 11,
    title: "11. THE LOOP THAT NEVER ENDS",
    prompt: "Execute the following pseudocode exactly and report the values printed.",
    code: "x = 3\ncount = 0\n\nwhile x < 40:\n    x = x * 2\n    count = count + 1\n\nprint(x, count)",
    summary: "Execute the while loop strictly from top to bottom. Report printed x and count.",
    expected: "48, 4",
    answers: ["48, 4", "48,4", "48 4", "(48, 4)", "48 and 4"]
  },
  {
    id: 12,
    title: "12. THE STACK OVERFLOW MYSTERY",
    prompt: "A stack receives the following operations:\n\nDetermine the final stack contents from bottom to top.",
    code: "PUSH 15\nPUSH 25\nPOP\nPUSH 35\nPUSH 45\nPOP\nPUSH 55\nPUSH 65\nPOP",
    summary: "LIFO stack: PUSH adds to top, POP removes from top. Report bottom to top.",
    expected: "15, 35, 55",
    answers: ["15, 35, 55", "15,35,55", "15 35 55", "[15, 35, 55]", "[15,35,55]"]
  },
  {
    id: 13,
    title: "13. THE DEADLOCK SEQUENCE",
    prompt: "Three processes are requesting resources.\n\nP1 holds R1 and needs R3.\nP2 holds R2 and needs R1.\nP3 holds R3 and needs R2.\n\nNo resources are initially available.\n\nDetermine whether the system is deadlocked.\nIf a deadlock exists, apply the recovery procedure and report the completion order of the remaining processes.",
    code: "P1 holds R1 and needs R3.\nP2 holds R2 and needs R1.\nP3 holds R3 and needs R2.\nNo resources available.",
    summary: "Terminate process with lowest number (P1). Released resources satisfy waiting processes.",
    expected: "P2, P3",
    answers: ["P2, P3", "P2,P3", "P2 then P3", "P2 P3", "Deadlock: Yes, Order: P2, P3", "Deadlock: Yes, P2, P3", "Deadlock, P2, P3", "Yes, P2, P3"]
  },
  {
    id: 14,
    title: "14. THE DATABASE DETECTIVE",
    prompt: "A database contains the following records:\n\nExecute the following SQL query and report the resulting Name column in order.",
    code: "ID  | Name | Score\n101 | A    | 82\n102 | B    | 68\n103 | C    | 91\n104 | D    | 74\n105 | E    | 88\n\nSELECT Name\nFROM Students\nWHERE Score > 75\nORDER BY Score DESC;",
    summary: "Filter Score > 75 strictly. Sort descending by score. Display Name column.",
    expected: "C, E, A",
    answers: ["C, E, A", "C,E,A", "C E A", "[C, E, A]", "[C,E,A]"]
  },
  {
    id: 15,
    title: "15. THE CACHE REPLACEMENT MYSTERY",
    prompt: "A cache has three available slots.\n\nThe following memory requests arrive:\n\nB, C, A, B, D, C, E\n\nUsing the cache replacement protocol, determine the final cache contents.\nReport the contents from least recently used to most recently used.",
    code: "Requests: B, C, A, B, D, C, E\nSlots: 3\nProtocol: LRU",
    summary: "On hit mark accessed as MRU. On miss when full, evict LRU. Report oldest to newest.",
    expected: "D, C, E",
    answers: ["D, C, E", "D,C,E", "D C E", "[D, C, E]", "[D,C,E]"]
  },
  {
    id: 16,
    title: "16. THE AI CLASSIFICATION TRAP",
    prompt: "An AI model receives the following features:\n\nCalculate the final score and determine the classification.",
    code: "Temperature = 22\nHumidity = 35\nRainfall = 8\nPROFILE = RISK-3\n\nScore = (Temperature × 2) + (Humidity × 1) - (Rainfall × 3)",
    summary: "RISK-3 bands: below 50 = LOW; 50 through 70 inclusive = MODERATE; above 70 = HIGH.",
    expected: "55, MODERATE",
    answers: ["55, MODERATE", "55,MODERATE", "55 MODERATE", "Score = 55, MODERATE", "MODERATE", "55, Moderate", "Score: 55, MODERATE"]
  },
  {
    id: 17,
    title: "17. THE NEAREST NEIGHBOUR",
    prompt: "An AI system must classify a new object:\n\nX = (3,3)\n\nUse the three nearest neighbours to determine the class of X.",
    code: "X = (3,3)\n\nTraining dataset:\nA = (1,1), RED\nB = (3,2), RED\nC = (2,4), RED\nD = (5,5), BLUE\nE = (4,3), BLUE",
    summary: "Calculate Euclidean distances. Select 3 smallest distances. Majority vote decides class.",
    expected: "RED",
    answers: ["RED", "Red", "red"]
  },
  {
    id: 18,
    title: "18. THE NEURAL NETWORK BLACK BOX",
    prompt: "A neural network receives two inputs:\n\nCalculate the final output of the network.",
    code: "Inputs: X1 = 0, X2 = 1\nWeights:\nX1 → H1 = 3\nX2 → H1 = 1\nX1 → H2 = 2\nX2 → H2 = 2\nH1 → O = 1\nH2 → O = 1",
    summary: "Threshold: sum >= 2 gives 1; otherwise 0. Calculate hidden activations then output activation.",
    expected: "0",
    answers: ["0"]
  },
  {
    id: 19,
    title: "19. THE ROBOT WITH A BROKEN COMPASS",
    prompt: "A robot begins at coordinate (0,0), facing North.\n\nIt receives the following commands:\n\nF, F, R, F, F, F, R, F, L, F\n\nDetermine its final coordinates and direction.",
    code: "Start: (0,0), facing North\nCommands: F, F, R, F, F, F, R, F, L, F\n(North=+Y, East=+X, South=-Y, West=-X)",
    summary: "F moves 1 unit in facing direction. R turns 90° clockwise. L turns 90° anticlockwise.",
    expected: "(4,1), East",
    answers: ["(4,1), East", "(4, 1), East", "(4,1), EAST", "4, 1, East", "4,1,East", "(4,1) East", "(4, 1) East", "(4,1), facing East", "(4, 1), facing East", "4, 1, E", "(4,1), E"]
  },
  {
    id: 20,
    title: "20. THE ALGORITHM THAT LIES",
    prompt: "A machine receives the following array:\n\nExecute the algorithm exactly as written and report the final array.",
    code: "A = [7, 2, 9, 4, 5]\n\nfor i in range(len(A)):\n    for j in range(i + 1, len(A)):\n        if A[i] < A[j]:\n            A[i], A[j] = A[j], A[i]\n\nprint(A)",
    summary: "Trace the nested loop swapping whenever A[i] < A[j]. Every swap takes effect immediately.",
    expected: "[9, 7, 5, 4, 2]",
    answers: ["[9, 7, 5, 4, 2]", "[9,7,5,4,2]", "9, 7, 5, 4, 2", "9,7,5,4,2", "9 7 5 4 2"]
  }
];

// Helper: Normalize answer for comparison
function normalizeAnswer(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[\[\]\(\)\{\}'"]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .replace(/->/g, '-')
    .replace(/→/g, '-');
}

function verifyAnswerLocally(q, input) {
  const normInput = normalizeAnswer(input);
  if (!normInput) return false;
  const accepted = q.answers.map(a => normalizeAnswer(a));
  if (accepted.includes(normInput)) return true;
  
  if (q.id === 6) {
    if (normInput.includes('6') || normInput.includes('a-c-e-f')) return true;
  }
  if (q.id === 7) {
    if (normInput === '3' || normInput.includes('ttl 3') || (normInput.includes('yes') && normInput.includes('3'))) return true;
  }
  if (q.id === 13) {
    if (normInput.includes('p2') && normInput.includes('p3')) return true;
  }
  if (q.id === 16) {
    if (normInput.includes('moderate') && (normInput.includes('55') || normInput.length < 15)) return true;
  }
  if (q.id === 19) {
    if (normInput.includes('4,1') && normInput.includes('east')) return true;
    if (normInput.includes('4,1') && normInput.includes('e')) return true;
  }
  return false;
}

// ============================================================================
// AUDIO SYNTHESIS ENGINE (Procedural WebAudio)
// ============================================================================
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'step') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'checkpoint') {
        [587.33, 880, 1174.66].forEach((freq, idx) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + idx * 0.1);
          g.gain.setValueAtTime(0.18, now + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(now + idx * 0.1);
          o.stop(now + idx * 0.1 + 0.35);
        });
      } else if (type === 'success') {
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + idx * 0.08);
          g.gain.setValueAtTime(0.2, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(now + idx * 0.08);
          o.stop(now + idx * 0.08 + 0.25);
        });
      } else if (type === 'trap' || type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(95, now + 0.35);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {}
  }

  playTone(freq, duration = 0.25) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }
}

const audio = new SoundSynth();

// ============================================================================
// TIMER MANAGER
// ============================================================================
const activeTimers = {
  intervals: new Set(),
  timeouts: new Set(),
  setInterval(fn, ms) {
    const id = setInterval(fn, ms);
    this.intervals.add(id);
    return id;
  },
  clearInterval(id) {
    clearInterval(id);
    this.intervals.delete(id);
  },
  setTimeout(fn, ms) {
    const id = setTimeout(() => {
      this.timeouts.delete(id);
      fn();
    }, ms);
    this.timeouts.add(id);
    return id;
  },
  clearTimeout(id) {
    clearTimeout(id);
    this.timeouts.delete(id);
  },
  clearAll() {
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
  }
};

// ============================================================================
// GLOBAL APPLICATION STATE
// ============================================================================
const state = {
  currentRoute: 'home',
  teamName: localStorage.getItem('bt_team_name') || '',
  customHost: localStorage.getItem('bt_custom_host') || '',
  ep1: {
    questions: [],
    solvedIds: [],
    completed: false,
    loading: false
  },
  ep2: {
    checkpoint: 0,
    visitedRouteIndices: [0],
    previewTime: 10,
    previewing: true,
    trapsCount: 0,
    startTime: null,
    zoomLevel: 1,
    simonActive: false
  }
};

const floor20Route = [
  0, 20, 40, 41, 42, 62, 82, 83, 103, 123, 124, 125, 145, 165, 185,
  186, 206, 226, 246, 247, 267, 287, 307, 327, 347, 367, 368, 388, 398, 399
];

const CHECKPOINTS = [
  { index: 0, cell: 0, label: 'START' },
  { index: 7, cell: 83, label: 'CP 1' },
  { index: 15, cell: 186, label: 'CP 2' },
  { index: 23, cell: 327, label: 'CP 3' },
  { index: 29, cell: 399, label: 'EXIT' }
];

const SIMON_TONES = [261.63, 329.63, 392.00, 523.25];

function getBaseUrl() {
  if (state.customHost) {
    let h = state.customHost.trim();
    if (!h.startsWith('http://') && !h.startsWith('https://')) {
      const proto = window.location.protocol === 'https:' ? 'https://' : 'http://';
      h = proto + h;
    }
    return h.replace(/\/+$/, '');
  }
  return window.location.origin;
}

function showToast(msg, icon = '🔔', duration = 3000) {
  const toast = document.querySelector('#levelToast');
  const msgEl = document.querySelector('#toastMsg');
  const iconEl = document.querySelector('#toastIcon');
  if (toast && msgEl) {
    msgEl.textContent = msg;
    if (iconEl) iconEl.textContent = icon;
    toast.classList.add('visible');
    activeTimers.setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  }
}

function updateNavTeamPill() {
  const pill = document.querySelector('#navTeamPill');
  const label = document.querySelector('#navTeamName');
  if (pill && label) {
    if (state.teamName) {
      label.textContent = state.teamName;
      pill.style.display = 'inline-flex';
    } else {
      pill.style.display = 'none';
    }
  }
}

// Router
function handleRoute() {
  activeTimers.clearAll();
  const rawHash = (window.location.hash || '#/').toLowerCase().replace(/^#\/?/, '');
  const path = rawHash.split('?')[0].split('/')[0] || 'home';

  updateNavTeamPill();

  if (path.includes('endpoint1') || path.includes('checkpoint1') || path.includes('clubs')) {
    state.currentRoute = 'endpoint1';
    renderEndpoint1();
  } else if (path.includes('endpoint2') || path.includes('checkpoint2') || path.includes('grid')) {
    state.currentRoute = 'endpoint2';
    renderEndpoint2();
  } else {
    state.currentRoute = 'home';
    renderHome();
  }
}

// ============================================================================
// VIEW: PORTAL HUB (QR-ONLY ACCESS AS REQUESTED)
// ============================================================================
function renderHome() {
  const root = document.querySelector('#pageRoot');
  const ep1Url = `${getBaseUrl()}/#/endpoint1`;
  const ep2Url = `${getBaseUrl()}/#/endpoint2`;
  const manualPdfUrl = `${getBaseUrl()}/Borderland_Trails_NISB_Final.pdf`;

  root.innerHTML = `
    <div class="view-page" style="padding: 1.5rem 1rem;">
      <section class="hub-hero">
        <p class="hub-eyebrow">BORDERLAND TRAILS · CHALLENGE CONSOLE</p>
        <h1 class="hub-title">SCAN QR TO ENTER ENDPOINT</h1>
        <p class="hub-desc">
          Scan the respective QR code with your mobile smartphone camera to enter each endpoint and begin solving.
        </p>
      </section>

      <!-- Network LAN Helper for Event Wi-Fi -->
      <div class="lan-config-panel">
        <div class="lan-config-header">
          <span class="lan-config-title">🌐 Host Address (For Mobile QR Scanning)</span>
          <span style="color:var(--club); font-family:var(--mono); font-size:0.75rem;">AUTO-DETECTED</span>
        </div>
        <div class="lan-config-row">
          <input type="text" id="customHostInput" class="lan-input" value="${state.customHost || window.location.host}" placeholder="e.g. 192.168.1.50:4173 or localhost:4173" />
          <button type="button" class="cyber-btn" id="btnUpdateHost" style="padding:0.4rem 0.85rem; font-size:0.78rem;">UPDATE QR</button>
        </div>
        <p style="color:var(--text-dim); font-size:0.75rem; margin-top:0.4rem; margin-bottom:0;">
          If scanning from phones connected to local Wi-Fi, enter this computer's local IP address above to update the QR codes.
        </p>
      </div>

      <!-- Dual Endpoint QR Cards Grid -->
      <div class="hub-endpoints-grid">
        <!-- Card 1: Endpoint 1 QR -->
        <div class="endpoint-hub-card ep1" style="text-align:center;">
          <span class="ep-tag" style="margin-inline:auto;">ENDPOINT 01 · TECHNICAL PUZZLES</span>
          <h2 class="ep-title">TECHNICAL PUZZLE ARENA</h2>
          <p class="ep-desc">
            20 technical puzzle challenges. Exactly 2 randomized questions are assigned per login. Scan below to enter and verify answers.
          </p>

          <div class="qr-card-container">
            <div class="qr-code-box" id="qrEndpoint1"></div>
            <div class="qr-caption">📱 SCAN WITH PHONE TO ENTER</div>
          </div>
          <div style="font-family:var(--mono); font-size:0.75rem; color:var(--text-dim); word-break:break-all; margin-bottom:1rem;">
            ${ep1Url}
          </div>

          <div class="ep-actions" style="margin-top:auto;">
            <a href="${manualPdfUrl}" download="Borderland_Trails_NISB_Final.pdf" class="cyber-btn" style="text-align:center; font-size:0.8rem;">
              📥 DOWNLOAD MANUAL PDF
            </a>
          </div>
        </div>

        <!-- Card 2: Endpoint 2 QR -->
        <div class="endpoint-hub-card ep2" style="text-align:center;">
          <span class="ep-tag" style="margin-inline:auto;">ENDPOINT 02 · MEMORY GRID</span>
          <h2 class="ep-title">DIGITAL MEMORY MATRIX</h2>
          <p class="ep-desc">
            20 × 20 digital floor grid. Checkpoints along the path with neural memory sequence recalibration upon trap triggers.
          </p>

          <div class="qr-card-container">
            <div class="qr-code-box" id="qrEndpoint2"></div>
            <div class="qr-caption">📱 SCAN WITH PHONE TO ENTER</div>
          </div>
          <div style="font-family:var(--mono); font-size:0.75rem; color:var(--text-dim); word-break:break-all; margin-bottom:1rem;">
            ${ep2Url}
          </div>
        </div>
      </div>
    </div>
  `;

  // Render QR codes
  if (window.QRCodeUtil) {
    QRCodeUtil.render('#qrEndpoint1', ep1Url, { size: 180, colorDark: '#08080a', colorLight: '#ffffff' });
    QRCodeUtil.render('#qrEndpoint2', ep2Url, { size: 180, colorDark: '#08080a', colorLight: '#ffffff' });
  }

  // Update Host button
  document.querySelector('#btnUpdateHost')?.addEventListener('click', () => {
    const val = document.querySelector('#customHostInput').value.trim();
    state.customHost = val;
    localStorage.setItem('bt_custom_host', val);
    audio.play('click');
    showToast('QR Codes updated with new host address!', '✓');
    renderHome();
  });
}

// ============================================================================
// VIEW: ENDPOINT 1 — TECHNICAL PUZZLE ARENA
// ============================================================================
function renderEndpoint1() {
  const root = document.querySelector('#pageRoot');

  // If no team name has been set, show login terminal
  if (!state.teamName) {
    root.innerHTML = `
      <div class="view-page" style="padding: 2rem 1rem;">
        <div class="terminal-login-card">
          <div class="terminal-header">
            <span class="terminal-badge">♣ ENDPOINT 01 AUTHENTICATION</span>
            <h1 class="terminal-title">TECHNICAL PUZZLE ARENA</h1>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-top:0.4rem;">
              Enter your Team Name to begin. 2 randomized challenges will be assigned to your team session.
            </p>
          </div>

          <form id="ep1LoginForm">
            <div style="margin-bottom:1.25rem;">
              <label for="ep1TeamInput" style="display:block; font-family:var(--mono); font-size:0.75rem; color:var(--text-dim); margin-bottom:0.4rem;">TEAM NAME</label>
              <input type="text" id="ep1TeamInput" class="puzzle-input" style="width:100%; box-sizing:border-box;" placeholder="e.g. The Wildcards" required autocomplete="off" />
            </div>

            <button type="submit" class="cyber-btn btn-primary" style="width:100%; background:var(--club); color:#000; font-weight:700; padding:0.75rem;">
              INITIALIZE CHALLENGE SESSION ➔
            </button>
          </form>
        </div>
      </div>
    `;

    document.querySelector('#ep1LoginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = document.querySelector('#ep1TeamInput').value.trim();
      if (!val) return;
      state.teamName = val;
      localStorage.setItem('bt_team_name', val);
      audio.play('click');
      updateNavTeamPill();
      await fetchEndpoint1Session();
      renderEndpoint1();
    });

    return;
  }

  // If questions not loaded yet, fetch or assign them
  if (state.ep1.questions.length === 0) {
    fetchEndpoint1Session().then(() => renderEndpoint1());
    return;
  }

  const manualPdfUrl = `${getBaseUrl()}/Borderland_Trails_NISB_Final.pdf`;
  const solvedCount = (state.ep1.solvedIds || []).length;
  const isAllComplete = solvedCount >= 2;

  root.innerHTML = `
    <div class="view-page ep1-view">
      <!-- Status Bar -->
      <div class="ep-status-bar">
        <div class="team-info-group">
          <div>
            <div style="font-family:var(--mono); font-size:0.68rem; color:var(--club);">ACTIVE TEAM SESSION</div>
            <div class="team-name-tag">${state.teamName}</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span class="progress-counter-badge" id="ep1ProgressCounter">
            ${solvedCount} / 2 PUZZLES VERIFIED
          </span>
        </div>
      </div>

      <!-- Manual & Resource Bar -->
      <div class="manual-resource-bar">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:1.2rem;">📖</span>
          <div>
            <strong style="color:#fff; font-size:0.85rem;">Official Technical Puzzle Manual</strong>
            <div style="color:var(--text-muted); font-size:0.75rem;">Follow procedures to compute the exact outputs.</div>
          </div>
        </div>

        <div class="manual-links">
          <a href="${manualPdfUrl}" download="Borderland_Trails_NISB_Final.pdf" class="cyber-btn" style="font-size:0.78rem;">
            📥 DOWNLOAD PDF
          </a>
          <button type="button" class="cyber-btn" id="btnShowManualQR" style="font-size:0.78rem;">
            📱 MANUAL QR
          </button>
        </div>
      </div>

      <!-- Questions Container -->
      <div id="questionsContainer">
        ${state.ep1.questions.map((q, idx) => {
          const isSolved = state.ep1.solvedIds.includes(q.id);
          return `
            <div class="puzzle-card ${isSolved ? 'solved' : ''}" id="puzzleCard-${q.id}">
              <div class="puzzle-head">
                <div>
                  <span class="puzzle-num">CHALLENGE 0${idx + 1} OF 02 · ID #${q.id}</span>
                  <h3 class="puzzle-name">${q.title}</h3>
                </div>
                ${isSolved ? `<span class="solved-stamp">✓ VERIFIED</span>` : ''}
              </div>

              <p class="puzzle-prompt">${q.prompt}</p>

              ${q.code ? `<div class="puzzle-code-box">${q.code}</div>` : ''}

              ${isSolved ? `
                <div style="font-family:var(--mono); font-size:0.85rem; color:var(--club); padding:0.5rem 0;">
                  ✓ Solved and verified against the backend mainframe.
                </div>
              ` : `
                <form class="puzzle-form" data-qid="${q.id}">
                  <div class="puzzle-form-row">
                    <input type="text" class="puzzle-input q-answer-input" placeholder="Enter calculated result / output..." required autocomplete="off" />
                    <button type="submit" class="cyber-btn btn-primary" style="background:var(--club); color:#000; font-weight:700; white-space:nowrap;">
                      VERIFY ANSWER ➔
                    </button>
                  </div>
                  <div class="puzzle-feedback" id="feedback-${q.id}"></div>
                </form>
              `}
            </div>
          `;
        }).join('')}
      </div>

      <!-- All Solved Victory Banner (No advance button, as requested) -->
      ${isAllComplete ? `
        <div class="all-solved-banner">
          <h2 class="all-solved-title">🎉 ENDPOINT 01 COMPLETE!</h2>
          <p style="color:var(--text-base); margin-bottom:0; max-width:600px; margin-inline:auto;">
            Both technical challenges have been successfully solved and verified by the mainframe. Your progress is saved!
          </p>
        </div>
      ` : ''}
    </div>
  `;

  // Attach Show Manual QR handler
  document.querySelector('#btnShowManualQR')?.addEventListener('click', () => {
    audio.play('click');
    const qrPdfUrl = `${getBaseUrl()}/Borderland_Trails_NISB_Final.pdf`;
    openManualQRModal(qrPdfUrl);
  });

  // Attach Puzzle form submits
  document.querySelectorAll('.puzzle-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const qid = Number(form.dataset.qid);
      const input = form.querySelector('.q-answer-input');
      const feedback = document.querySelector(`#feedback-${qid}`);
      const val = input.value.trim();
      if (!val) return;

      feedback.className = 'puzzle-feedback show';
      feedback.textContent = 'Verifying with server engine...';
      feedback.style.color = 'var(--text-muted)';

      const questionObj = QUESTIONS_DB.find(item => item.id === qid);

      try {
        const res = await fetch('/api/endpoint1/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamName: state.teamName,
            questionId: qid,
            answer: val
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.correct) {
            handleVerifySuccess(qid);
            return;
          } else {
            handleVerifyFail(feedback, data.error);
            return;
          }
        }
      } catch {}

      // Fallback local verification if backend route is unavailable
      if (questionObj && verifyAnswerLocally(questionObj, val)) {
        handleVerifySuccess(qid);
      } else {
        handleVerifyFail(feedback, 'Incorrect output. Recalculate using manual instructions.');
      }
    });
  });

  function handleVerifySuccess(qid) {
    audio.play('success');
    state.ep1.solvedIds = Array.from(new Set([...state.ep1.solvedIds, qid]));
    state.ep1.completed = state.ep1.solvedIds.length >= 2;
    localStorage.setItem(`bt_solved_${state.teamName}`, JSON.stringify(state.ep1.solvedIds));
    showToast('Puzzle Answer Verified!', '✓');
    renderEndpoint1();
  }

  function handleVerifyFail(feedback, msg) {
    audio.play('trap');
    feedback.className = 'puzzle-feedback show error';
    feedback.textContent = msg || 'Incorrect output. Recalculate using manual instructions.';
  }
}

async function fetchEndpoint1Session() {
  state.ep1.loading = true;
  let qIds = null;

  // Check saved session in localStorage
  const savedKey = `bt_qids_${state.teamName}`;
  const savedSolvedKey = `bt_solved_${state.teamName}`;
  try {
    const raw = localStorage.getItem(savedKey);
    if (raw) qIds = JSON.parse(raw);
    const rawSolved = localStorage.getItem(savedSolvedKey);
    if (rawSolved) state.ep1.solvedIds = JSON.parse(rawSolved);
  } catch {}

  try {
    const res = await fetch('/api/endpoint1/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName: state.teamName })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.questions) && data.questions.length >= 2) {
        qIds = data.questions.map(q => q.id);
        if (Array.isArray(data.solvedIds)) state.ep1.solvedIds = data.solvedIds;
        state.ep1.completed = !!data.completed;
      }
    }
  } catch {}

  // If no IDs assigned yet, pick 2 random IDs from 1 to 20
  if (!Array.isArray(qIds) || qIds.length < 2) {
    const total = QUESTIONS_DB.length;
    const q1 = Math.floor(Math.random() * total) + 1;
    let q2 = Math.floor(Math.random() * total) + 1;
    while (q2 === q1) {
      q2 = Math.floor(Math.random() * total) + 1;
    }
    qIds = [q1, q2];
    try {
      localStorage.setItem(savedKey, JSON.stringify(qIds));
    } catch {}
  }

  // Populate questions ALWAYS from the authoritative QUESTIONS_DB with updated values
  state.ep1.questions = qIds.map(id => {
    const full = QUESTIONS_DB.find(item => item.id === id);
    return {
      id: full.id,
      title: full.title,
      prompt: full.prompt,
      code: full.code
    };
  });

  state.ep1.loading = false;
}

// Modal for scanning the manual PDF on phones
function openManualQRModal(pdfUrl) {
  const modal = document.querySelector('#manualModal');
  const body = document.querySelector('#manualModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="text-align:center; padding:1rem 0;">
      <h3 style="color:#fff; margin-bottom:0.5rem; font-family:var(--display);">SCAN TO OPEN MANUAL PDF</h3>
      <p style="color:var(--text-muted); font-size:0.85rem; max-width:400px; margin:0 auto 1.5rem auto;">
        Scan this QR code with any smartphone camera to open and download the official 20-puzzle Operating Manual PDF.
      </p>

      <div class="qr-card-container">
        <div class="qr-code-box" id="modalManualQR"></div>
        <div class="qr-caption">📱 MANUAL PDF LINK</div>
      </div>

      <div style="margin-top:1.5rem;">
        <input type="text" class="lan-input" value="${pdfUrl}" readonly style="width:min(100%, 400px); text-align:center; font-size:0.75rem;" />
      </div>
    </div>
  `;

  modal.classList.add('active');
  if (window.QRCodeUtil) {
    QRCodeUtil.render('#modalManualQR', pdfUrl, { size: 180, colorDark: '#08080a', colorLight: '#ffffff' });
  }

  const close = () => modal.classList.remove('active');
  document.querySelector('#btnCloseManual').onclick = close;
  document.querySelector('#btnDismissManual').onclick = close;
  document.querySelector('#modalBackdrop').onclick = close;
}



// ============================================================================
// VIEW: ENDPOINT 2 — DIGITAL MEMORY GRID ARENA
// ============================================================================
function renderEndpoint2() {
  const root = document.querySelector('#pageRoot');

  // If team name is missing, prompt for team name
  if (!state.teamName) {
    root.innerHTML = `
      <div class="view-page" style="padding: 2rem 1rem;">
        <div class="terminal-login-card">
          <div class="terminal-header">
            <span class="terminal-badge" style="color:var(--joker);">🃏 ENDPOINT 02 AUTHENTICATION</span>
            <h1 class="terminal-title">DIGITAL MEMORY MATRIX</h1>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-top:0.4rem;">
              Enter your Team Name to synchronize with the 20 × 20 digital floor grid.
            </p>
          </div>

          <form id="ep2LoginForm">
            <div style="margin-bottom:1.25rem;">
              <label for="ep2TeamInput" style="display:block; font-family:var(--mono); font-size:0.75rem; color:var(--text-dim); margin-bottom:0.4rem;">TEAM NAME</label>
              <input type="text" id="ep2TeamInput" class="puzzle-input" style="width:100%; box-sizing:border-box;" placeholder="e.g. The Wildcards" required autocomplete="off" />
            </div>

            <button type="submit" class="cyber-btn btn-primary" style="width:100%; background:var(--joker); color:#000; font-weight:700; padding:0.75rem;">
              ENTER GRID ARENA ➔
            </button>
          </form>
        </div>
      </div>
    `;

    document.querySelector('#ep2LoginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = document.querySelector('#ep2TeamInput').value.trim();
      if (!val) return;
      state.teamName = val;
      localStorage.setItem('bt_team_name', val);
      audio.play('click');
      updateNavTeamPill();
      await fetchEndpoint2Session();
      renderEndpoint2();
    });

    return;
  }

  // Active Grid Game
  const currentStep = state.ep2.visitedRouteIndices.length - 1;
  const currentCell = floor20Route[currentStep];

  root.innerHTML = `
    <div class="view-page ep2-view">
      <!-- Status Header -->
      <div class="ep-status-bar" style="border-color:rgba(255,207,92,0.3);">
        <div class="team-info-group">
          <div>
            <div style="font-family:var(--mono); font-size:0.68rem; color:var(--joker);">FLOOR GRID OPERATOR</div>
            <div class="team-name-tag">${state.teamName}</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
          <span class="progress-counter-badge" style="background:rgba(255,207,92,0.1); color:var(--joker); border-color:var(--joker);" id="gridStepCounter">
            STEP ${currentStep + 1} / 30
          </span>
          <span class="progress-counter-badge" style="background:rgba(255,107,134,0.1); color:var(--heart); border-color:var(--heart);" id="gridTrapCounter">
            TRAPS: ${state.ep2.trapsCount}
          </span>
        </div>
      </div>

      <!-- Checkpoint Stepper -->
      <div class="checkpoint-stepper">
        ${CHECKPOINTS.map((cp, idx) => {
          const isPassed = state.ep2.checkpoint >= idx;
          const isActive = state.ep2.checkpoint === idx;
          return `
            <div class="cp-node ${isPassed ? 'completed' : ''} ${isActive ? 'active' : ''}">
              <div class="cp-circle">${isPassed ? '✓' : idx}</div>
              <div class="cp-label">${cp.label}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Toolbar & Mobile Controls Bar -->
      <div class="grid-toolbar">
        <div>
          <span id="gridTimerText" style="font-family:var(--mono); font-size:0.85rem; color:var(--joker); font-weight:700;">
            ${state.ep2.previewing ? `MEMORIZE SAFE ROUTE: ${state.ep2.previewTime}S` : 'FOG OF WAR ACTIVE'}
          </span>
        </div>

        <div class="zoom-btn-group">
          <button type="button" class="btn-zoom" id="btnZoomOut" aria-label="Zoom Out">🔍 -</button>
          <button type="button" class="btn-zoom" id="btnZoomFit" aria-label="Fit Screen">⊡ 100%</button>
          <button type="button" class="btn-zoom" id="btnZoomIn" aria-label="Zoom In">🔍 +</button>
          <button type="button" class="btn-zoom" id="btnCenterPlayer" aria-label="Center Current Tile">🎯 FOCUS</button>
        </div>
      </div>

      <!-- Scrollable / Pannable Touch Viewport -->
      <div class="grid-touch-viewport" id="gridTouchViewport">
        <div class="grid-zoom-wrapper" id="gridZoomWrapper" style="transform: scale(${state.ep2.zoomLevel});">
          <div class="floor-20x20" id="floorGrid">
            ${Array.from({ length: 400 }, (_, i) => {
              const isStart = i === 0;
              const isExit = i === 399;
              const cpMatch = CHECKPOINTS.find(c => c.cell === i && c.index > 0 && c.index < 29);
              const isPreview = state.ep2.previewing && floor20Route.includes(i);
              const isVisited = !state.ep2.previewing && isCellVisited(i);
              const isCurrent = !state.ep2.previewing && i === currentCell;

              let classes = ['floor-tile'];
              if (isStart) classes.push('start-tile');
              if (isExit) classes.push('exit-tile');
              if (cpMatch) classes.push('tile-checkpoint');
              if (isPreview) classes.push('path-preview');
              if (isVisited) classes.push('visited');
              if (isCurrent) classes.push('tile-current');

              return `<button type="button" class="${classes.join(' ')}" data-cell="${i}" ${state.ep2.previewing ? 'disabled' : ''} aria-label="Tile ${i}"></button>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Mobile Touch Directional D-Pad -->
      <div class="mobile-dpad-section">
        <div style="font-family:var(--mono); font-size:0.75rem; color:var(--text-dim); text-align:center;">
          📱 TOUCH CONTROLS (TAP TILES DIRECTLY OR USE D-PAD)
        </div>
        <div class="dpad-container">
          <button type="button" class="dpad-btn up" id="dpadUp" aria-label="Move Up">▲</button>
          <button type="button" class="dpad-btn left" id="dpadLeft" aria-label="Move Left">◄</button>
          <div class="dpad-btn center"></div>
          <button type="button" class="dpad-btn right" id="dpadRight" aria-label="Move Right">►</button>
          <button type="button" class="dpad-btn down" id="dpadDown" aria-label="Move Down">▼</button>
        </div>
      </div>

      <div id="gridFeedback" style="font-family:var(--mono); font-size:0.88rem; text-align:center; margin:1rem auto; min-height:1.5rem;"></div>
    </div>
  `;

  // Zoom handlers
  document.querySelector('#btnZoomIn')?.addEventListener('click', () => {
    state.ep2.zoomLevel = Math.min(state.ep2.zoomLevel + 0.25, 2.0);
    applyZoom();
  });
  document.querySelector('#btnZoomOut')?.addEventListener('click', () => {
    state.ep2.zoomLevel = Math.max(state.ep2.zoomLevel - 0.25, 0.75);
    applyZoom();
  });
  document.querySelector('#btnZoomFit')?.addEventListener('click', () => {
    state.ep2.zoomLevel = 1.0;
    applyZoom();
  });
  document.querySelector('#btnCenterPlayer')?.addEventListener('click', () => {
    centerPlayerTile();
  });

  // Countdown timer for 10s preview
  if (state.ep2.previewing) {
    const timer = activeTimers.setInterval(() => {
      state.ep2.previewTime--;
      const timerEl = document.querySelector('#gridTimerText');
      if (timerEl) {
        timerEl.textContent = `MEMORIZE SAFE ROUTE: ${state.ep2.previewTime}S`;
      }

      if (state.ep2.previewTime <= 0) {
        activeTimers.clearInterval(timer);
        state.ep2.previewing = false;
        state.ep2.startTime = Date.now();
        renderEndpoint2();
      }
    }, 1000);
  }

  // Tile click handler
  document.querySelector('#floorGrid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.floor-tile');
    if (!btn || state.ep2.previewing || state.ep2.simonActive) return;
    const cell = Number(btn.dataset.cell);
    handleTileStep(cell);
  });

  // Mobile D-Pad handlers
  document.querySelector('#dpadUp')?.addEventListener('click', () => handleDpadMove(-20));
  document.querySelector('#dpadDown')?.addEventListener('click', () => handleDpadMove(20));
  document.querySelector('#dpadLeft')?.addEventListener('click', () => handleDpadMove(-1));
  document.querySelector('#dpadRight')?.addEventListener('click', () => handleDpadMove(1));

  centerPlayerTile();
}

function applyZoom() {
  const el = document.querySelector('#gridZoomWrapper');
  if (el) el.style.transform = `scale(${state.ep2.zoomLevel})`;
}

function centerPlayerTile() {
  const currentStep = state.ep2.visitedRouteIndices.length - 1;
  const currentCell = floor20Route[currentStep];
  const tile = document.querySelector(`[data-cell="${currentCell}"]`);
  const viewport = document.querySelector('#gridTouchViewport');
  if (tile && viewport) {
    const tileRect = tile.getBoundingClientRect();
    const vpRect = viewport.getBoundingClientRect();
    viewport.scrollTo({
      left: viewport.scrollLeft + (tileRect.left - vpRect.left) - vpRect.width / 2 + tileRect.width / 2,
      top: viewport.scrollTop + (tileRect.top - vpRect.top) - vpRect.height / 2 + tileRect.height / 2,
      behavior: 'smooth'
    });
  }
}

function isCellVisited(cell) {
  return state.ep2.visitedRouteIndices.some(idx => floor20Route[idx] === cell);
}

function handleDpadMove(delta) {
  if (state.ep2.previewing || state.ep2.simonActive) return;
  const currentStep = state.ep2.visitedRouteIndices.length - 1;
  const currentCell = floor20Route[currentStep];
  const targetCell = currentCell + delta;

  if (targetCell < 0 || targetCell >= 400) return;
  if (delta === 1 && currentCell % 20 === 19) return;
  if (delta === -1 && currentCell % 20 === 0) return;

  handleTileStep(targetCell);
}

function handleTileStep(cell) {
  const nextExpectedIndex = state.ep2.visitedRouteIndices.length;
  const expectedCell = floor20Route[nextExpectedIndex];

  if (cell === expectedCell) {
    audio.play('step');
    state.ep2.visitedRouteIndices.push(nextExpectedIndex);

    const cpIndex = CHECKPOINTS.findIndex(cp => cp.index === nextExpectedIndex);
    if (cpIndex > state.ep2.checkpoint) {
      state.ep2.checkpoint = cpIndex;
      audio.play('checkpoint');
      showToast(`Checkpoint ${CHECKPOINTS[cpIndex].label} Reached! Progress Saved.`, '★');
      fetch('/api/endpoint2/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: state.teamName, checkpoint: state.ep2.checkpoint })
      }).catch(() => {});
    }

    if (nextExpectedIndex === floor20Route.length - 1) {
      handleGridVictory();
      return;
    }

    renderEndpoint2();
  } else {
    handleTrapTriggered(cell);
  }
}

function handleTrapTriggered(cell) {
  audio.play('trap');
  state.ep2.trapsCount++;

  const tileEl = document.querySelector(`[data-cell="${cell}"]`);
  if (tileEl) {
    tileEl.classList.add('trap');
    activeTimers.setTimeout(() => tileEl.classList.remove('trap'), 600);
  }

  const cp = CHECKPOINTS[state.ep2.checkpoint];
  state.ep2.visitedRouteIndices = Array.from({ length: cp.index + 1 }, (_, i) => i);

  showToast(`TRAP TRIGGERED! Falling back to ${cp.label}. Recalibration required.`, '⚠️', 4000);
  startCheckpointRecalibration(cp);
}

function startCheckpointRecalibration(cp) {
  state.ep2.simonActive = true;
  const modal = document.querySelector('#recalModal');
  const statusEl = document.querySelector('#simonStatus');
  const progressEl = document.querySelector('#simonProgress');
  const instructionEl = document.querySelector('#recalInstruction');

  if (!modal) return;
  modal.classList.add('active');

  if (instructionEl) {
    instructionEl.textContent = `Trap triggered! To resume from ${cp.label}, memorize and repeat the neural sequence.`;
  }

  const seqLength = state.ep2.checkpoint >= 2 ? 4 : 3;
  let targetSequence = Array.from({ length: seqLength }, () => Math.floor(Math.random() * 4));
  let playerSequence = [];

  function playSequence() {
    playerSequence = [];
    statusEl.textContent = 'WATCH AND LISTEN...';
    statusEl.style.color = 'var(--joker)';
    progressEl.textContent = `Sequence length: ${targetSequence.length}`;

    document.querySelectorAll('.simon-pad').forEach(p => p.disabled = true);

    targetSequence.forEach((padIdx, i) => {
      activeTimers.setTimeout(() => {
        flashPad(padIdx);
      }, (i + 1) * 600);
    });

    activeTimers.setTimeout(() => {
      statusEl.textContent = 'YOUR TURN: REPEAT THE PATTERN';
      statusEl.style.color = 'var(--club)';
      document.querySelectorAll('.simon-pad').forEach(p => p.disabled = false);
    }, (targetSequence.length + 1) * 600);
  }

  function flashPad(padIdx) {
    const pad = document.querySelector(`.simon-pad[data-pad="${padIdx}"]`);
    if (pad) {
      pad.classList.add('active');
      audio.playTone(SIMON_TONES[padIdx], 0.3);
      activeTimers.setTimeout(() => pad.classList.remove('active'), 350);
    }
  }

  const padHandler = (e) => {
    const pad = e.target.closest('.simon-pad');
    if (!pad || pad.disabled) return;
    const padIdx = Number(pad.dataset.pad);
    flashPad(padIdx);
    playerSequence.push(padIdx);

    const stepIndex = playerSequence.length - 1;

    if (playerSequence[stepIndex] !== targetSequence[stepIndex]) {
      audio.play('trap');
      statusEl.textContent = '✗ MISMATCH! GENERATING NEW PATTERN...';
      statusEl.style.color = 'var(--heart)';
      document.querySelectorAll('.simon-pad').forEach(p => p.disabled = true);

      activeTimers.setTimeout(() => {
        targetSequence = Array.from({ length: seqLength }, () => Math.floor(Math.random() * 4));
        playSequence();
      }, 1000);
      return;
    }

    progressEl.textContent = `Step ${playerSequence.length} / ${targetSequence.length}`;

    if (playerSequence.length === targetSequence.length) {
      audio.play('success');
      statusEl.textContent = `✓ NEURAL SYNC COMPLETE! ${cp.label} RE-ENERGIZED.`;
      statusEl.style.color = 'var(--club)';
      document.querySelectorAll('.simon-pad').forEach(p => p.disabled = true);

      activeTimers.setTimeout(() => {
        modal.classList.remove('active');
        state.ep2.simonActive = false;
        showToast(`${cp.label} Unlocked! Continue walking the floor grid.`, '✓');
        renderEndpoint2();
      }, 900);
    }
  };

  document.querySelectorAll('.simon-pad').forEach(pad => {
    pad.onclick = padHandler;
  });

  document.querySelector('#btnReplaySimon').onclick = () => {
    audio.play('click');
    playSequence();
  };

  playSequence();
}

function handleGridVictory() {
  audio.play('success');
  const timeElapsed = state.ep2.startTime ? Math.round((Date.now() - state.ep2.startTime) / 1000) : 45;

  fetch('/api/endpoint2/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teamName: state.teamName,
      timeElapsed,
      trapsCount: state.ep2.trapsCount
    })
  }).catch(() => {});

  const root = document.querySelector('#pageRoot');
  root.innerHTML = `
    <div class="view-page" style="text-align:center; padding: 3rem 1rem;">
      <div class="all-solved-banner" style="border-color:var(--joker); box-shadow:0 10px 40px rgba(255,207,92,0.25);">
        <span style="font-size:3rem;">👑</span>
        <h1 class="all-solved-title" style="color:var(--joker);">20 × 20 FLOOR GRID CONQUERED!</h1>
        <p style="color:var(--text-base); font-size:1.05rem; margin-bottom:1.5rem;">
          Outstanding execution, <strong>${state.teamName}</strong>! All 4 checkpoints traversed and the memory matrix breached.
        </p>

        <div style="display:flex; justify-content:center; gap:1.5rem; margin-bottom:2rem; flex-wrap:wrap;">
          <div style="background:rgba(0,0,0,0.5); padding:1rem 1.5rem; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-family:var(--mono); font-size:0.75rem; color:var(--text-dim);">COMPLETION TIME</div>
            <div style="font-family:var(--display); font-size:1.5rem; color:#fff;">${timeElapsed}s</div>
          </div>
          <div style="background:rgba(0,0,0,0.5); padding:1rem 1.5rem; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-family:var(--mono); font-size:0.75rem; color:var(--text-dim);">TRAPS OVERCOME</div>
            <div style="font-family:var(--display); font-size:1.5rem; color:var(--heart);">${state.ep2.trapsCount}</div>
          </div>
          <div style="background:rgba(0,0,0,0.5); padding:1rem 1.5rem; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-family:var(--mono); font-size:0.75rem; color:var(--text-dim);">CHECKPOINTS SECURED</div>
            <div style="font-family:var(--display); font-size:1.5rem; color:var(--club);">4 / 4</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function fetchEndpoint2Session() {
  try {
    const res = await fetch('/api/endpoint2/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName: state.teamName })
    });
    const data = await res.json();
    if (data.ok && typeof data.checkpoint === 'number') {
      state.ep2.checkpoint = Math.min(data.checkpoint, 3);
      const cp = CHECKPOINTS[state.ep2.checkpoint];
      state.ep2.visitedRouteIndices = Array.from({ length: cp.index + 1 }, (_, i) => i);
    }
  } catch {}
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  const btnAudio = document.querySelector('#btnAudio');
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      audio.muted = !audio.muted;
      const icon = document.querySelector('#audioIcon');
      const text = document.querySelector('#audioText');
      if (audio.muted) {
        if (icon) icon.textContent = '🔈';
        if (text) text.textContent = 'FX OFF';
      } else {
        if (icon) icon.textContent = '🔊';
        if (text) text.textContent = 'FX ON';
        audio.play('click');
      }
    });
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
});
