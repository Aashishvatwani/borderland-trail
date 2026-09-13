// Borderland Trail — IEEE Multi-Round Challenge Engine
// Mario Roudil Style Page Transitions & Strict Level-by-Level Progression System

// --- Audio Synthesizer (Web Audio API) ---
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
  }
  toggle() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = !this.enabled;
    return this.enabled;
  }
  play(type) {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    try {
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'whoosh') {
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);
        filter.frequency.exponentialRampToValueAtTime(900, now + 0.08);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.1, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.25);
        });
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.setValueAtTime(110, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {}
  }
}

const audio = new SoundSynth();

// --- Timer Manager (Prevents Memory Leaks & Ghost Transitions) ---
const activeTimers = {
  intervals: new Set(),
  timeouts: new Set(),
  setInterval(fn, ms) {
    const id = window.setInterval(fn, ms);
    this.intervals.add(id);
    return id;
  },
  setTimeout(fn, ms) {
    const id = window.setTimeout(fn, ms);
    this.timeouts.add(id);
    return id;
  },
  clearInterval(id) {
    window.clearInterval(id);
    this.intervals.delete(id);
  },
  clearTimeout(id) {
    window.clearTimeout(id);
    this.timeouts.delete(id);
  },
  clearAll() {
    this.intervals.forEach(id => window.clearInterval(id));
    this.timeouts.forEach(id => window.clearTimeout(id));
    this.intervals.clear();
    this.timeouts.clear();
  }
};

// ==========================================================================
// STRICT LEVEL-BY-LEVEL PROGRESSION SYSTEM
// ==========================================================================
const LEVELS = [
  { id: 'formation', num: 1, title: 'Formation ("Find Your People")', badge: 'formation' },
  { id: 'card-hunt', num: 2, title: 'Riddle & Card Hunt', badge: 'hunt' },
  { id: 'diamonds', num: 3, title: '♦ Diamonds (The Exit Code)', badge: 'diamonds' },
  { id: 'hearts', num: 4, title: '♥ Hearts (The Human Chain)', badge: 'hearts' },
  { id: 'spades', num: 5, title: '♠ Spades (The Field Signal)', badge: 'spades' },
  { id: 'clubs', num: 6, title: '♣ Clubs (The War Room)', badge: 'clubs' },
  { id: 'joker', num: 7, title: '🃏 Final Paradox (The Joker)', badge: 'joker' },
  { id: 'leaderboard', num: 8, title: 'Arena Leaderboard', badge: null }
];

function getClearedLevels() {
  try {
    return JSON.parse(localStorage.getItem('bt_cleared_levels') || '[]');
  } catch {
    return [];
  }
}

function clearLevel(levelId) {
  const cleared = getClearedLevels();
  if (!cleared.includes(levelId)) {
    cleared.push(levelId);
    localStorage.setItem('bt_cleared_levels', JSON.stringify(cleared));
  }
  updateNavLockStatus();
}

function isLevelUnlocked(route) {
  if (route === 'home' || route === '' || route === 'formation' || route === 'leaderboard') return true;
  const cleared = getClearedLevels();
  if (route === 'card-hunt') return cleared.includes('formation');
  if (route === 'diamonds') return cleared.includes('card-hunt');
  if (route === 'hearts') return cleared.includes('diamonds');
  if (route === 'spades') return cleared.includes('hearts');
  if (route === 'clubs') return cleared.includes('spades');
  if (route === 'joker') return cleared.includes('clubs');
  return false;
}

function getPrerequisite(route) {
  if (route === 'card-hunt') return { num: 1, title: 'Formation ("Find Your People")' };
  if (route === 'diamonds') return { num: 2, title: 'Riddle & Card Hunt' };
  if (route === 'hearts') return { num: 3, title: '♦ Diamonds Trial' };
  if (route === 'spades') return { num: 4, title: '♥ Hearts Trial' };
  if (route === 'clubs') return { num: 5, title: '♠ Spades Trial' };
  if (route === 'joker') return { num: 6, title: '♣ Clubs Trial' };
  return null;
}

function getActiveUnlockedLevel() {
  const cleared = getClearedLevels();
  if (!cleared.includes('formation')) return 'formation';
  if (!cleared.includes('card-hunt')) return 'card-hunt';
  if (!cleared.includes('diamonds')) return 'diamonds';
  if (!cleared.includes('hearts')) return 'hearts';
  if (!cleared.includes('spades')) return 'spades';
  if (!cleared.includes('clubs')) return 'clubs';
  if (!cleared.includes('joker')) return 'joker';
  return 'leaderboard';
}

let toastTimeout;
function showToast(msg) {
  const toast = document.querySelector('#levelToast');
  const msgEl = document.querySelector('#toastMsg');
  if (!toast || !msgEl) return;
  msgEl.textContent = msg;
  toast.classList.add('show');
  audio.play('error');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function updateNavLockStatus() {
  document.querySelectorAll('.nav-item').forEach(el => {
    const route = el.dataset.route;
    if (route && route !== 'home' && route !== 'leaderboard') {
      const unlocked = isLevelUnlocked(route);
      el.classList.toggle('locked', !unlocked);
      if (!el.getAttribute('data-title')) {
        el.setAttribute('data-title', el.textContent.trim());
      }
      const rawTitle = el.getAttribute('data-title');
      el.textContent = unlocked ? rawTitle : `🔒 ${rawTitle}`;
    }
  });
}

function renderProgressHeader(currentRoute) {
  const cleared = getClearedLevels();
  const currentItem = LEVELS.find(l => l.id === currentRoute);
  const currentNum = currentItem ? currentItem.num : 0;
  const pct = Math.min(100, Math.round((cleared.length / 7) * 100));

  return `
    <div class="level-tracker">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span style="font-weight:800; color:var(--acid);">STAGE ${currentNum > 0 ? `0${currentNum}` : 'ARENA'}</span>
        <span style="color:var(--text-muted); font-size:0.75rem;">/ 07</span>
      </div>
      <div class="level-bar-wrap">
        <div class="level-bar-fill" style="width:${pct}%;"></div>
      </div>
      <div style="font-weight:700; color:var(--text-main); font-size:0.75rem;">
        ${cleared.length} / 7 CLEARED (${pct}%)
      </div>
    </div>
  `;
}

// --- Active Team Session State ---
let currentTeam = localStorage.getItem('bt_team') || 'The Wildcards';
function setActiveTeam(name) {
  currentTeam = name;
  localStorage.setItem('bt_team', name);
}

// Record badge progress to MongoDB Atlas
async function awardBadge(suit) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName: currentTeam, suit, timeSeconds: Math.floor(Date.now() / 1000) })
    });
  } catch {}
}

// --- Page Transition Engine (Mario Roudil List Transition) ---
const curtain = document.querySelector('#pageCurtain');
const curtainSuit = document.querySelector('#curtainSuit');
const curtainTitle = document.querySelector('#curtainTitle');
const curtainTag = document.querySelector('#curtainTag');
const pageRoot = document.querySelector('#pageRoot');

const routeMeta = {
  '': { suit: 'BT', title: 'THE BORDERLAND TRAIL', tag: 'IEEE MULTI-ROUND TEAM ARENA', color: 'var(--acid)' },
  'home': { suit: 'BT', title: 'THE BORDERLAND TRAIL', tag: 'IEEE MULTI-ROUND TEAM ARENA', color: 'var(--acid)' },
  'formation': { suit: '01', title: 'FIND YOUR PEOPLE', tag: 'PHASE 01 // CREW ASSEMBLY', color: 'var(--acid)' },
  'card-hunt': { suit: '02', title: 'RIDDLE & CARD HUNT', tag: 'PHASE 02 // SUIT ROUTE CIPHER', color: '#fff' },
  'diamonds': { suit: '♦', title: 'THE EXIT CODE', tag: 'TRIAL 01 // MATHEMATICS & LOGIC', color: 'var(--diamond)' },
  'hearts': { suit: '♥', title: 'THE HUMAN CHAIN', tag: 'TRIAL 02 // PSYCHOLOGY & TRUST', color: 'var(--heart)' },
  'spades': { suit: '♠', title: 'THE FIELD SIGNAL', tag: 'TRIAL 03 // PHYSICAL WAYPOINTS', color: 'var(--spade)' },
  'clubs': { suit: '♣', title: 'THE WAR ROOM', tag: 'TRIAL 04 // COMMUNICATION & RELAY', color: 'var(--club)' },
  'joker': { suit: '🃏', title: 'FINAL PARADOX', tag: 'THE FINALE // MEMORY & ESCAPE', color: 'var(--joker)' },
  'leaderboard': { suit: '🏆', title: 'ARENA LEADERBOARD', tag: 'LIVE CREW STANDINGS & CHEAT SHEET', color: '#fff' }
};

let isNavigating = false;

function navigateTo(route) {
  const cleanRoute = route.replace(/^#\/?/, '') || 'home';

  // Strict Level Progression Guard
  if (!isLevelUnlocked(cleanRoute)) {
    const prereq = getPrerequisite(cleanRoute);
    if (prereq) {
      showToast(`🔒 LEVEL LOCKED: Clear Level 0${prereq.num} (${prereq.title}) first!`);
    } else {
      showToast(`🔒 LEVEL LOCKED: You must complete the previous trial first!`);
    }
    const currentActive = getActiveUnlockedLevel();
    if (window.location.hash !== `#/${currentActive}`) {
      window.location.hash = `#/${currentActive}`;
    }
    return;
  }

  if (isNavigating) return;
  const meta = routeMeta[cleanRoute] || routeMeta['home'];

  isNavigating = true;
  audio.play('whoosh');

  // Set curtain details
  curtainSuit.textContent = meta.suit;
  curtainSuit.style.color = meta.color;
  curtainTitle.textContent = meta.title;
  curtainTag.textContent = meta.tag;

  // Trigger Mario Roudil curtain incoming animation
  curtain.classList.remove('outgoing');
  curtain.classList.add('active', 'incoming');

  // Halfway through animation, swap content cleanly
  setTimeout(() => {
    activeTimers.clearAll();

    // Mount page view
    mountView(cleanRoute);

    // Update nav links active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === cleanRoute);
    });
    updateNavLockStatus();

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Switch to outgoing curtain animation
    curtain.classList.remove('incoming');
    curtain.classList.add('outgoing');

    setTimeout(() => {
      curtain.classList.remove('active', 'outgoing');
      isNavigating = false;
    }, 550);
  }, 380);
}

// Global Nav click interceptor
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-nav]');
  if (link && link.getAttribute('href')?.startsWith('#')) {
    event.preventDefault();
    const href = link.getAttribute('href');
    const targetRoute = href.replace(/^#\/?/, '') || 'home';

    if (!isLevelUnlocked(targetRoute)) {
      const prereq = getPrerequisite(targetRoute);
      showToast(`🔒 LEVEL LOCKED: Complete Level 0${prereq.num} (${prereq.title}) first!`);
      return;
    }

    if (window.location.hash !== href) {
      window.location.hash = href;
    } else {
      navigateTo(href);
    }
  }
});

window.addEventListener('hashchange', () => {
  navigateTo(window.location.hash);
});

// Ambient Glow tracking
const ambient = document.querySelector('#cursorAmbient');
window.addEventListener('pointermove', e => {
  if (ambient) {
    ambient.style.left = `${e.clientX}px`;
    ambient.style.top = `${e.clientY}px`;
  }
});

// Audio Toggle Button
const btnAudio = document.querySelector('#btnAudio');
const audioIcon = document.querySelector('#audioIcon');
const audioText = document.querySelector('#audioText');
btnAudio.addEventListener('click', () => {
  const isOn = audio.toggle();
  btnAudio.classList.toggle('on', isOn);
  audioIcon.textContent = isOn ? '🔊' : '🔈';
  audioText.textContent = isOn ? 'FX ON' : 'FX OFF';
  if (isOn) audio.play('success');
});

// ==========================================================================
// VIEWS ROUTER & GAME IMPLEMENTATIONS
// ==========================================================================
function mountView(route) {
  switch (route) {
    case 'formation':
      renderFormationView();
      break;
    case 'card-hunt':
      renderCardHuntView();
      break;
    case 'diamonds':
      renderDiamondsView();
      break;
    case 'hearts':
      renderHeartsView();
      break;
    case 'spades':
      renderSpadesView();
      break;
    case 'clubs':
      renderClubsView();
      break;
    case 'joker':
      renderJokerView();
      break;
    case 'leaderboard':
      renderLeaderboardView();
      break;
    case 'home':
    default:
      renderHomeView();
      break;
  }
}

// --------------------------------------------------------------------------
// VIEW: HOME / EDITORIAL LIST (MARIO ROUDIL TRANSITION ANCHOR)
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// VIEW: HOME / BT-26 SURVIVE THE PARADOX ARENA OVERVIEW
// --------------------------------------------------------------------------
function renderHomeView() {
  const cleared = getClearedLevels();
  const activeLevel = getActiveUnlockedLevel();
  const activeLevelItem = LEVELS.find(l => l.id === activeLevel) || { num: 1, title: 'Formation' };
  const activeNum = activeLevelItem.num || 1;

  const trailCards = [
    {
      num: 1,
      id: 'formation',
      title: 'ARENA HERO',
      suit: '♦',
      desc: 'Master fundamental team assembly & interactive clue sequencing in the primary arena.',
      reward: '+500 ARENA PTS',
      rot: '-6deg',
      tz: '10px'
    },
    {
      num: 2,
      id: 'card-hunt',
      title: 'THE LINK',
      suit: '♥',
      desc: 'Synchronize dual frequency cipher patterns and directional campus clues.',
      reward: '+600 ARENA PTS',
      rot: '-3deg',
      tz: '5px'
    },
    {
      num: 3,
      id: 'diamonds',
      title: 'MEMORY GRID',
      suit: '♠',
      desc: 'Mathematics & logic: 20 challenge cards, 14 decoys, symbol operators & Caesar cipher.',
      reward: 'DIAMOND SIGNAL',
      rot: '-1deg',
      tz: '0px'
    },
    {
      num: 4,
      id: 'hearts',
      title: 'LOGIC RUN',
      suit: '♣',
      desc: 'Psychology & trust: 4 sealed teammate envelopes, 5-seat logic grid & trust verification.',
      reward: 'HEART SIGNAL',
      rot: '0deg',
      tz: '0px'
    },
    {
      num: 5,
      id: 'spades',
      title: 'THE SWAP',
      suit: '♠',
      desc: 'Physical waypoints: Reception, Trophy Area, Three Statues & 1342 sequence cipher.',
      reward: 'SPADE SIGNAL',
      rot: '1deg',
      tz: '0px'
    },
    {
      num: 6,
      id: 'clubs',
      title: 'MIND TRAP',
      suit: '♥',
      desc: 'Cooperative war room: Command relay sequencing, 72 MHz tuner & counter protocol.',
      reward: 'CLUB SIGNAL',
      rot: '3deg',
      tz: '5px'
    },
    {
      num: 7,
      id: 'joker',
      title: 'THE JOKER',
      suit: '★',
      desc: 'Face the Grand Architect of the Paradox. 20×20 floor grid, memory stack & escape code 1536.',
      reward: 'PARADOX ASCENSION',
      rot: '6deg',
      tz: '10px',
      isJoker: true
    }
  ];

  const getCardStatus = (routeId) => {
    const isCleared = cleared.includes(routeId);
    const isActive = routeId === activeLevel;
    const isUnlocked = isLevelUnlocked(routeId);
    return { isCleared, isActive, isUnlocked };
  };

  pageRoot.innerHTML = `
    <div class="paradox-overview-wrapper">
      <!-- Scanlines Holographic Texture -->
      <div class="scanlines" aria-hidden="true"></div>

      <!-- Master Hero Scene with Artwork Backdrop -->
      <div class="paradox-scene-bg">
        <!-- Live Animated Canvas for Floating Golden Embers & Lightning Sparks -->
        <canvas id="liveSceneCanvas" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:2;"></canvas>

        <!-- Top Columns: Left Hero + Right HUD -->
        <div class="paradox-main-content">
          
          <!-- Left Column Content -->
          <div class="paradox-left-col">
            <!-- Header Tag -->
            <div class="paradox-header-tag">
              <div class="paradox-eyebrow-1">
                <span class="tag-dot"></span>
                <span>BORDERLAND TRAIL ARENA</span>
              </div>
              <div class="paradox-eyebrow-2">
                IEEE PRESENTS
              </div>
            </div>

            <!-- Hero Title -->
            <div>
              <h1 class="paradox-hero-title">
                SURVIVE <br />
                <span class="paradox-brush-title animate-glitch-brush">
                  THE PARADOX.
                </span>
              </h1>
              <div class="paradox-sub-title">
                MASTER THE FOUR SUITS.
              </div>
            </div>

            <!-- Description -->
            <p class="paradox-desc">
              Step into a dark cyber-card arena where strangers connect, logic reigns, and memory is a weapon. Progress through seven sequential levels to conquer the Joker.
            </p>

            <!-- CTA Buttons -->
            <div class="paradox-actions">
              <button type="button" id="btnResumeHero" class="btn-paradox-resume">
                <span class="resume-arrow-icon">➔</span>
                <span>RESUME LEVEL 0${activeNum}</span>
                <span>➔</span>
              </button>
            </div>

            <!-- Scroll / Directive indicator -->
            <div class="paradox-scroll-hint" id="scrollHint" style="cursor:pointer;">
              <div class="mouse-pill">
                <span class="mouse-wheel"></span>
              </div>
              <span>SCROLL TO EXPLORE TRAIL</span>
            </div>

            <!-- Left bottom bridge label -->
            <div class="paradox-bridge-label">
              STRANGERS<br/>CONNECT<br/>HERE
            </div>
          </div>

          <!-- Right Column: Live Telemetry HUD & Signs -->
          <div class="paradox-right-col">
            <!-- Live Players Online Box -->
            <div class="paradox-telemetry-card">
              <div class="telemetry-top">
                <span class="ping-wrap">
                  <span class="ping-dot"></span>
                  PLAYERS ONLINE
                </span>
                <span style="color:#34d399; font-size:0.65rem;">LIVE GRID</span>
              </div>
              <div class="telemetry-bottom">
                <span class="player-count-num" id="playerCount">1,248</span>
                <div class="equalizer-bars" id="freqBars"></div>
              </div>
            </div>

            <!-- Graffiti Signs overlaying the scene -->
            <div class="paradox-signs">
              <div class="sign-box-1">
                <p>SAME PEOPLE</p>
                <p>DIFFERENT REALITIES</p>
                <p style="font-size:0.62rem; color:#64748b; margin-top:0.25rem;">&gt;&lt; X &gt;&lt;</p>
              </div>

              <div class="sign-box-2">
                <p class="highlight">EVERY CHOICE LEAVES A TRACE.</p>
                <p style="font-size:0.65rem; color:#64748b; margin-top:0.15rem;">VS</p>
              </div>

              <div class="sign-box-3">
                <span>WILL YOU BREAK,</span><br/>
                <span>OR BECOME THE EXCEPTION?</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom Dock / Level Trail (The 7 3D Perspective Cards) -->
        <div class="paradox-trail-dock" id="trailDock">
          <div class="trail-dock-head">
            <div class="trail-dock-title">
              <span class="title-bold">THE TRAIL</span>
              <span class="title-divider"></span>
              <span class="trail-dock-sub">STAGE PROGRESSION (${cleared.length}/7 COMPLETED)</span>
            </div>
            <div style="color:#64748b; font-size:0.68rem;">
              CLICK ANY CARD TO INSPECT CIPHER
            </div>
          </div>

          <!-- 7 Cards Deck in 3D Perspective -->
          <div class="cards-deck-perspective">
            ${trailCards.map((c) => {
              const { isCleared, isActive, isUnlocked } = getCardStatus(c.id);
              let cardClass = 'trail-card';
              if (isActive) cardClass += ' active-gold-card';
              if (c.isJoker) cardClass += ' trail-card-joker';
              if (isCleared) cardClass += ' card-cleared';
              if (!isUnlocked) cardClass += ' card-locked';

              const suitColor = c.isJoker ? '#c084fc' : (c.suit === '♦' ? '#ffb703' : (c.suit === '♥' ? '#f43f5e' : (c.suit === '♠' ? '#818cf8' : '#34d399')));
              const glyph = !isUnlocked ? '🔒' : (c.isJoker ? '👑' : c.suit);

              return `
                <div class="${cardClass}" data-card-id="${c.id}" style="transform: rotateY(${c.rot}) translateZ(${c.tz});">
                  <div class="trail-card-top">
                    <span>0${c.num}</span>
                    <span style="color:${suitColor}; font-weight:700;">${c.suit}</span>
                  </div>
                  <div class="trail-card-glyph" style="color:${suitColor};">
                    ${glyph}
                  </div>
                  <div class="trail-card-name">
                    ${c.title}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Connecting Node Progress Timeline Line -->
          <div class="timeline-track">
            <div class="timeline-fill" style="width: ${Math.max(14.28, (cleared.length / 7) * 100)}%;"></div>
            <div class="timeline-nodes">
              ${trailCards.map((c) => {
                const { isCleared, isActive } = getCardStatus(c.id);
                const nodeCls = isCleared ? 'cleared' : (isActive ? 'active' : '');
                return `<span class="timeline-node ${nodeCls}"></span>`;
              }).join('')}
            </div>
          </div>

          <!-- IEEE Footer Branding -->
          <div class="paradox-ieee-footer">
            <div class="ieee-brand-tag">
              <svg style="width:14px; height:14px; color:#ffb703;" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>IEEE | IDEAS • PEOPLE • POSSIBILITIES</span>
            </div>
            <div class="ieee-motto">
              NOT JUST A GAME. A STATE OF MIND.
            </div>
          </div>
        </div>
      </div>

      <!-- Level Briefing Modal -->
      <div id="levelModal" class="paradox-modal-overlay" role="dialog" aria-modal="true">
        <div class="paradox-modal-window">
          <button type="button" id="modalCloseBtn" class="modal-close-btn" aria-label="Close modal">
            [ESC / CLOSE]
          </button>

          <div class="modal-head">
            <span id="modalSuit" class="modal-suit-icon">♦</span>
            <div>
              <div id="modalLevelNum" class="modal-meta-num">LEVEL 01</div>
              <div id="modalLevelName" class="modal-meta-title">ARENA HERO</div>
            </div>
          </div>

          <div class="modal-body">
            <div class="modal-directive-box">
              <span class="modal-directive-label">MISSION DIRECTIVE</span>
              <p id="modalLevelDesc" class="modal-directive-text">Master fundamental card sequencing & reaction time in the primary arena.</p>
            </div>

            <div class="modal-stats-grid">
              <div class="modal-stat-box">
                <span class="modal-stat-label">STATUS</span>
                <span id="modalDiff" class="modal-stat-val active">UNLOCKED // ACTIVE</span>
              </div>
              <div class="modal-stat-box">
                <span class="modal-stat-label">REWARD</span>
                <span id="modalReward" class="modal-stat-val" style="color:#34d399;">+500 ARENA PTS</span>
              </div>
            </div>
          </div>

          <div class="modal-foot">
            <button type="button" id="modalCancelBtn" class="btn-modal-cancel">
              Cancel
            </button>
            <button type="button" id="modalActionBtn" class="btn-modal-action">
              LAUNCH MISSION
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // 1. Resume Active Level Button Interaction
  const btnResumeHero = document.querySelector('#btnResumeHero');
  if (btnResumeHero) {
    btnResumeHero.addEventListener('click', () => {
      audio.play('whoosh');
      navigateTo('#/' + activeLevel);
    });
  }

  // 2. Scroll Hint Smooth Scroll
  const scrollHint = document.querySelector('#scrollHint');
  if (scrollHint) {
    scrollHint.addEventListener('click', () => {
      const trailDock = document.querySelector('#trailDock');
      if (trailDock) {
        trailDock.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }

  // 3. Level Briefing Modal Controller
  const modal = document.querySelector('#levelModal');
  const modalSuit = document.querySelector('#modalSuit');
  const modalLevelNum = document.querySelector('#modalLevelNum');
  const modalLevelName = document.querySelector('#modalLevelName');
  const modalLevelDesc = document.querySelector('#modalLevelDesc');
  const modalDiff = document.querySelector('#modalDiff');
  const modalReward = document.querySelector('#modalReward');
  const modalActionBtn = document.querySelector('#modalActionBtn');
  const modalCloseBtn = document.querySelector('#modalCloseBtn');
  const modalCancelBtn = document.querySelector('#modalCancelBtn');

  const openModal = (card) => {
    const { isCleared, isUnlocked } = getCardStatus(card.id);
    modalSuit.textContent = card.suit;
    modalSuit.style.color = card.isJoker ? '#c084fc' : (card.suit === '♦' ? '#ffb703' : (card.suit === '♥' ? '#f43f5e' : (card.suit === '♠' ? '#818cf8' : '#34d399')));
    modalLevelNum.textContent = `LEVEL 0${card.num}`;
    modalLevelName.textContent = card.title;
    modalLevelDesc.textContent = card.desc;
    modalReward.textContent = card.reward;

    if (!isUnlocked) {
      const prereq = getPrerequisite(card.id);
      modalDiff.textContent = 'STATUS: LOCKED // SEQUENCE INCOMPLETE';
      modalDiff.className = 'modal-stat-val locked';
      modalActionBtn.textContent = 'LEVEL LOCKED';
      modalActionBtn.disabled = true;
      audio.play('error');
      if (prereq) {
        showToast(`🔒 LEVEL LOCKED: Complete Level 0${prereq.num} (${prereq.title}) first!`);
      }
    } else {
      modalDiff.textContent = isCleared ? 'STATUS: CLEARED // COMPLETE' : 'STATUS: UNLOCKED // READY';
      modalDiff.className = `modal-stat-val ${isCleared ? 'cleared' : 'active'}`;
      modalActionBtn.textContent = 'LAUNCH MISSION';
      modalActionBtn.disabled = false;
      audio.play('cardSelect');

      modalActionBtn.onclick = () => {
        audio.play('success');
        modalActionBtn.textContent = 'ESTABLISHING NEURAL LINK...';
        modalActionBtn.disabled = true;
        setTimeout(() => {
          closeModal();
          navigateTo('#/' + card.id);
        }, 320);
      };
    }

    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const handleEscKey = (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  };
  window.addEventListener('keydown', handleEscKey);

  // 4. Trail Card Clicks & Hover Sound
  document.querySelectorAll('.trail-card').forEach(cardEl => {
    const cardId = cardEl.getAttribute('data-card-id');
    const cardData = trailCards.find(c => c.id === cardId);
    if (!cardData) return;

    cardEl.addEventListener('mouseenter', () => {
      audio.play('hover');
    });

    cardEl.addEventListener('click', () => {
      openModal(cardData);
    });
  });

  // 5. Live Equalizer Audio Telemetry Frequency Bars
  const freqContainer = document.querySelector('#freqBars');
  if (freqContainer) {
    const barCount = 14;
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('span');
      bar.className = 'eq-bar';
      bar.style.height = `${Math.random() * 18 + 5}px`;
      freqContainer.appendChild(bar);
    }

    const eqTimer = setInterval(() => {
      Array.from(freqContainer.children).forEach(bar => {
        bar.style.height = `${Math.random() * 22 + 4}px`;
      });
    }, 160);
    activeTimers.push(eqTimer);
  }

  // 6. Live Players Online Dynamic Counter
  const playerCountEl = document.querySelector('#playerCount');
  if (playerCountEl) {
    let currentPlayers = 1248;
    const playerTimer = setInterval(() => {
      currentPlayers += Math.floor(Math.random() * 5) - 2;
      playerCountEl.textContent = currentPlayers.toLocaleString();
    }, 4000);
    activeTimers.push(playerTimer);
  }

  // 7. Live Animated Canvas: Golden Embers & Sparks Over Master Artwork
  const canvas = document.querySelector('#liveSceneCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / W - 0.5) * 30;
      targetMouseY = (e.clientY / H - 0.5) * 20;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initialize 80 Floating Glowing Golden Embers
    const embers = [];
    const EMBER_COUNT = 80;
    for (let i = 0; i < EMBER_COUNT; i++) {
      embers.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 2.4 + 0.8,
        speedY: Math.random() * 1.4 + 0.5,
        speedX: (Math.random() - 0.5) * 0.7,
        alpha: Math.random() * 0.85 + 0.15,
        decay: Math.random() * 0.005 + 0.003
      });
    }

    let emberTime = 0;
    let animId = null;

    const emberLoop = () => {
      if (!document.body.contains(canvas)) {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('keydown', handleEscKey);
        return;
      }

      emberTime += 0.03;
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      ctx.clearRect(0, 0, W, H);

      // Render Embers
      ctx.save();
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i];
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(emberTime + p.y * 0.012) * 0.45;
        p.alpha -= p.decay;

        if (p.y < 0 || p.alpha <= 0) {
          p.x = Math.random() * W;
          p.y = H + 10;
          p.alpha = Math.random() * 0.85 + 0.15;
          p.speedY = Math.random() * 1.4 + 0.5;
        }

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffb703';
        ctx.fillStyle = `rgba(255, 183, 3, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Occasional Electric Sparks over the card area (around 62% width, 44% height)
      if (Math.random() > 0.65) {
        ctx.save();
        const cardCenterX = W * 0.61 + mouseX * 0.4;
        const cardCenterY = H * 0.42 + mouseY * 0.4;
        ctx.strokeStyle = Math.random() > 0.5 ? '#ffe66d' : '#ffffff';
        ctx.shadowColor = '#ffb703';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        let sx = cardCenterX + (Math.random() - 0.5) * 65;
        let sy = cardCenterY + (Math.random() - 0.5) * 85;
        ctx.moveTo(sx, sy);
        for (let k = 0; k < 3; k++) {
          sx += (Math.random() - 0.5) * 18;
          sy += (Math.random() - 0.5) * 18;
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(emberLoop);
    };

    animId = requestAnimationFrame(emberLoop);
  }
}

// --------------------------------------------------------------------------
// VIEW: 01. FORMATION ("FIND YOUR PEOPLE")
// --------------------------------------------------------------------------
const participantClues = [
  { icon: '🗣️', text: 'Can speak more than three languages.' },
  { icon: '🌅', text: 'Prefers waking up early rather than staying up late.' },
  { icon: '🗺️', text: 'Comes from a different city or state.' },
  { icon: '🍕', text: 'Has a food combination that everyone else finds weird.' },
  { icon: '🤝', text: "Find two people who don't know each other and introduce them." },
  { icon: '✍️', text: "Find someone whose name you can't pronounce on the first try." },
  { icon: '🎹', text: 'Plays a musical instrument or produces electronic music.' },
  { icon: '⚡', text: 'Has survived a 24+ hour hackathon without sleeping.' }
];

function renderFormationView() {
  let clueIndex = Math.floor(Math.random() * participantClues.length);

  pageRoot.innerHTML = `
    <div class="view-page">
      <header class="page-header">
        <p class="page-eyebrow">LEVEL 01 // CREW ASSEMBLY</p>
        <h1 class="page-title">FIND YOUR<br><span style="color:var(--acid);">PEOPLE.</span></h1>
        <p class="page-desc">
          Every participant receives an icebreaker clue card. Roam the arena, introduce yourself, find matching peers, and lock in your five-player crew to complete Level 01 and unlock the Card Hunt.
        </p>
      </header>

      ${renderProgressHeader('formation')}

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:2rem;">
        <!-- Virtual Physical Clue Card -->
        <div class="challenge-card" style="border-color:var(--acid);">
          <div class="challenge-top">
            <span>PARTICIPANT CLUE PASS</span>
            <span>CARD #${String(clueIndex + 1).padStart(2, '0')}</span>
          </div>

          <div style="text-align:center; padding:2rem 1rem;">
            <div id="clueIcon" style="font-size:3.5rem; margin-bottom:1rem;">${participantClues[clueIndex].icon}</div>
            <p style="font-family:var(--mono); font-size:0.75rem; letter-spacing:0.15em; color:var(--text-dim); text-transform:uppercase;">
              YOUR SOCIAL DIRECTIVE
            </p>
            <h2 id="clueText" style="font-family:var(--sans); font-size:1.4rem; font-weight:700; margin-top:0.75rem; line-height:1.4;">
              ${participantClues[clueIndex].text}
            </h2>
          </div>

          <div style="display:flex; justify-content:center; margin-top:1rem;">
            <button type="button" class="cyber-btn" id="btnDealClue" style="background:var(--acid); color:#000;">
              DEAL ANOTHER CLUE ↺
            </button>
          </div>
        </div>

        <!-- 5-Player Team Registration Form -->
        <div class="challenge-card">
          <div class="challenge-top">
            <span>TEAM REGISTRATION</span>
            <span>MONGODB ATLAS SYNC</span>
          </div>

          <form id="formationForm" style="display:flex; flex-direction:column; gap:1rem;">
            <div>
              <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                TEAM / CREW NAME (REQUIRED)
              </label>
              <input class="cyber-input" name="name" placeholder="e.g. The Wildcards" value="${currentTeam}" required maxlength="40" />
            </div>

            <div>
              <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                CAPTAIN / LEAD NAME
              </label>
              <input class="cyber-input" name="captain" placeholder="Captain Full Name" required />
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
              <div>
                <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                  MEMBER 2
                </label>
                <input class="cyber-input" name="m2" placeholder="Player 2" required />
              </div>
              <div>
                <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                  MEMBER 3
                </label>
                <input class="cyber-input" name="m3" placeholder="Player 3" required />
              </div>
              <div>
                <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                  MEMBER 4
                </label>
                <input class="cyber-input" name="m4" placeholder="Player 4" required />
              </div>
              <div>
                <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                  MEMBER 5
                </label>
                <input class="cyber-input" name="m5" placeholder="Player 5" required />
              </div>
            </div>

            <div>
              <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                CONTACT (EMAIL OR PHONE)
              </label>
              <input class="cyber-input" name="contact" placeholder="crew@ieee.org" />
            </div>

            <button type="submit" class="cyber-btn" id="btnRegisterTeam" style="margin-top:0.5rem;">
              CONFIRM CREW & CLEAR LEVEL 01 ↗
            </button>

            <div id="formationFeedback" style="font-family:var(--mono); font-size:0.8rem; margin-top:0.5rem;"></div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Deal card listener
  const btnDealClue = document.querySelector('#btnDealClue');
  btnDealClue?.addEventListener('click', () => {
    audio.play('click');
    clueIndex = (clueIndex + 1) % participantClues.length;
    document.querySelector('#clueIcon').textContent = participantClues[clueIndex].icon;
    document.querySelector('#clueText').textContent = participantClues[clueIndex].text;
  });

  // Team registration submit listener
  const formationForm = document.querySelector('#formationForm');
  formationForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.querySelector('#btnRegisterTeam');
    const feedback = document.querySelector('#formationFeedback');
    btn.disabled = true;
    btn.textContent = 'REGISTERING IN ATLAS…';
    audio.play('click');

    const fd = new FormData(formationForm);
    const teamData = {
      name: fd.get('name'),
      captain: fd.get('captain'),
      members: [fd.get('m2'), fd.get('m3'), fd.get('m4'), fd.get('m5')].filter(Boolean),
      contact: fd.get('contact')
    };

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save crew');

      setActiveTeam(data.team.name);
      clearLevel('formation');
      audio.play('success');

      feedback.innerHTML = `
        <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:0.75rem; border-radius:4px; border:1px solid var(--club);">
          <strong>✓ LEVEL 01 CLEARED!</strong> Crew <strong>${data.team.name}</strong> is verified in MongoDB Atlas!<br>
          <strong>Level 02: Riddle & Card Hunt</strong> is now unlocked.
          <div style="margin-top:0.5rem;">
            <a href="#/card-hunt" class="cyber-btn" style="padding:0.4rem 0.8rem; font-size:0.75rem;" data-nav>ADVANCE TO LEVEL 02 (CARD HUNT) ↗</a>
          </div>
        </div>
      `;
    } catch (err) {
      audio.play('error');
      feedback.innerHTML = `<span style="color:var(--heart);">${err.message}</span>`;
    } finally {
      btn.disabled = false;
      btn.textContent = 'CONFIRM CREW & CLEAR LEVEL 01 ↗';
    }
  });
}

// --------------------------------------------------------------------------
// VIEW: 02. CARD HUNT
// --------------------------------------------------------------------------
function renderCardHuntView() {
  pageRoot.innerHTML = `
    <div class="view-page">
      <header class="page-header">
        <p class="page-eyebrow">LEVEL 02 // RIDDLE & CARD HUNT</p>
        <h1 class="page-title">THE UNIFIED<br><span style="color:#fff;">RIDDLE HUNT.</span></h1>
        <p class="page-desc">
          All 12 teams receive the exact same opening riddle. Crack the directional cipher to locate the opening physical cards and unlock Level 03 (♦ Diamonds Trial).
        </p>
      </header>

      ${renderProgressHeader('card-hunt')}

      <div class="challenge-card" style="max-width:800px; margin:0 auto;">
        <div class="challenge-top">
          <span>STATION CLUE 00</span>
          <span>CAMPUS WIDE BROADCAST</span>
        </div>

        <div style="background:rgba(0,0,0,0.5); padding:2rem; border-radius:8px; border:1px solid var(--border-subtle); margin-bottom:1.5rem;">
          <p style="font-family:'Space Grotesk', serif; font-size:1.35rem; line-height:1.6; font-style:italic; color:var(--text-main);">
            "I have no heart, yet I beat with the clock.<br>
            I have no legs, yet I guide the entire flock.<br>
            Seek the glass corridor where north meets the tower,<br>
            enter the directional cipher to unlock your team's starting suit power."
          </p>
        </div>

        <form id="huntForm" style="display:flex; flex-direction:column; gap:1rem;">
          <div>
            <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
              ENTER DESTINATION CIPHER OR LANDMARK (HINT: CLOCK / TOWER / GLASS CORRIDOR)
            </label>
            <div style="display:flex; gap:0.5rem;">
              <input class="cyber-input" id="huntInput" placeholder="Enter landmark answer..." required autocomplete="off" />
              <button type="submit" class="cyber-btn">UNLOCK LEVEL 03 ↗</button>
            </div>
          </div>
          <div id="huntFeedback" style="font-family:var(--mono); font-size:0.85rem;"></div>
        </form>
      </div>
    </div>
  `;

  const huntForm = document.querySelector('#huntForm');
  huntForm?.addEventListener('submit', e => {
    e.preventDefault();
    const val = document.querySelector('#huntInput').value.trim().toLowerCase().replace(/[^a-z]/g, '');
    const feedback = document.querySelector('#huntFeedback');

    if (['clock', 'tower', 'clocktower', 'glasscorridor', 'corridor', 'northtower'].includes(val)) {
      audio.play('success');
      clearLevel('card-hunt');
      feedback.innerHTML = `
        <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:4px; border:1px solid var(--club); margin-top:1rem;">
          <strong>✓ LEVEL 02 CLEARED! COORDINATES VERIFIED!</strong><br>
          You have recovered the Four Suit Route Pack.<br>
          <strong>Level 03: ♦ Diamonds (The Exit Code) is now unlocked!</strong>
          <div style="margin-top:0.75rem;">
            <a href="#/diamonds" class="cyber-btn" style="background:var(--diamond); color:#000;" data-nav>ADVANCE TO LEVEL 03 (♦ DIAMONDS) ↗</a>
          </div>
        </div>
      `;
    } else {
      audio.play('error');
      feedback.innerHTML = `<span style="color:var(--heart);">Station cipher incorrect. Reread the riddle: "Where north meets the tower..."</span>`;
    }
  });
}

// --------------------------------------------------------------------------
// VIEW: 03. TRIAL ♦ DIAMONDS (THE EXIT CODE - 20 CARDS WITH 14 DECOYS)
// --------------------------------------------------------------------------
const diamondCards = [
  // 6 genuine path cards
  { card: 'ORBIT', expression: '[(18 ▲ 6) ★ 3] ● 2 ■ 5', answer: '11', clue: 'Clue Card 11 · Caesar cipher', reveal: 'The encrypted transmission points to NOVA.', next: 'NOVA', genuine: true },
  { card: 'NOVA', expression: '[((20 ● 5) ■ 16) ★ 4] ▲ 13', answer: '34', clue: 'Clue Card 34 · Sequence cipher', reveal: '2, 6, 12, 20, 30… gives 42. Shift LUSJEH back 16 places to get VECTOR.', next: 'VECTOR', genuine: true },
  { card: 'VECTOR', expression: '[(((45 ■ 9) ★ 4) ● 3) ▲ 6] ■ 15', answer: '18', clue: 'Clue Card 18 · Rearrangement', reveal: 'U–2, E–5, P–1, S–4, L–3 resolves to PULSE.', next: 'PULSE', genuine: true },
  { card: 'PULSE', expression: '[(28 ▲ 14) ★ 7] ● 5 ■ 3', answer: '27', clue: 'Clue Card 27 · Binary', reveal: '01000101 01000011 01001111 translates to ECHO.', next: 'ECHO', genuine: true },
  { card: 'ECHO', expression: '[(16 ● 6) ■ 24] ★ 4 ▲ 27', answer: '45', clue: 'Clue Card 45 · Find me', reveal: 'A five-letter word: no A, middle letter I, first not a vowel: PRISM.', next: 'PRISM', genuine: true },
  { card: 'PRISM', expression: '[(((54 ▲ 18) ★ 9) ● 4) ■ 20] ▲ 4', answer: '16', clue: 'Clue Card 16 · Final revelation', reveal: 'One of four suits. Its symbol is both a geometric shape and a playing-card suit: DIAMOND.', next: 'DIAMOND', genuine: true },
  // 14 Decoy cards
  { card: 'COSMOS', expression: '(14 ▲ 7) ● 2 ■ 8', answer: '34', clue: 'Decoy 01', reveal: 'Dead end: Signal dissolves into cosmic noise.', genuine: false },
  { card: 'HELIOS', expression: '[(30 ★ 5) ▲ 12] ● 2', answer: '36', clue: 'Decoy 02', reveal: 'Decoy alert: Solar frequency does not correlate with the suit.', genuine: false },
  { card: 'SPECTRA', expression: '[(40 ■ 10) ★ 3] ▲ 15', answer: '25', clue: 'Decoy 03', reveal: 'Decoy: False spectrum detected.', genuine: false },
  { card: 'VORTEX', expression: '(25 ● 2) ■ 18 ★ 2', answer: '16', clue: 'Decoy 04', reveal: 'Decoy: Swallowed by anomaly.', genuine: false },
  { card: 'MATRIX', expression: '[(12 ▲ 8) ● 3] ■ 20', answer: '40', clue: 'Decoy 05', reveal: 'Decoy: Matrix parity error.', genuine: false },
  { card: 'QUANTUM', expression: '[(60 ★ 4) ▲ 9] ■ 4', answer: '20', clue: 'Decoy 06', reveal: 'Decoy: State collapsed.', genuine: false },
  { card: 'CIPHER', expression: '(15 ● 3) ■ 15 ★ 3', answer: '10', clue: 'Decoy 07', reveal: 'Decoy: Key is invalid.', genuine: false },
  { card: 'ZENITH', expression: '[(22 ▲ 18) ★ 5] ● 7', answer: '56', clue: 'Decoy 08', reveal: 'Decoy: Elevation out of bounds.', genuine: false },
  { card: 'RADAR', expression: '[(50 ■ 20) ★ 6] ▲ 11', answer: '16', clue: 'Decoy 09', reveal: 'Decoy: Ghost echo on sweep.', genuine: false },
  { card: 'FUSION', expression: '(8 ● 6) ▲ 12 ★ 4', answer: '15', clue: 'Decoy 10', reveal: 'Decoy: Reaction destabilized.', genuine: false },
  { card: 'HORIZON', expression: '[(36 ★ 6) ▲ 14] ● 2', answer: '40', clue: 'Decoy 11', reveal: 'Decoy: Nothing beyond the curve.', genuine: false },
  { card: 'QUARK', expression: '(9 ▲ 9) ● 2 ■ 6', answer: '30', clue: 'Decoy 12', reveal: 'Decoy: Charge unbalanced.', genuine: false },
  { card: 'NEBULA', expression: '[(48 ★ 8) ● 5] ▲ 12', answer: '42', clue: 'Decoy 13', reveal: 'Decoy: Obscured in cloud dust.', genuine: false },
  { card: 'ECLIPSE', expression: '[(70 ■ 14) ★ 7] ▲ 19', answer: '27', clue: 'Decoy 14', reveal: 'Decoy: Total occultation.', genuine: false }
];

function renderDiamondsView() {
  let activeIndex = 0; // Starts at ORBIT

  function renderCard(idx) {
    const item = diamondCards[idx];
    const isFinal = item.card === 'PRISM';

    pageRoot.innerHTML = `
      <div class="view-page">
        <header class="page-header">
          <p class="page-eyebrow" style="color:var(--diamond);">LEVEL 03 // MATHEMATICS & LOGIC</p>
          <h1 class="page-title">THE EXIT<br><span style="color:var(--diamond);">CODE.</span></h1>
          <p class="page-desc">
            Decode hidden operators, navigate through genuine cards, and escape 14 decoy traps to retrieve the Diamond Signal and unlock Level 04 (♥ Hearts).
          </p>
        </header>

        ${renderProgressHeader('diamonds')}

        <!-- Symbol Operators Lab Legend -->
        <div style="background:rgba(98,212,255,0.06); border:1px solid rgba(98,212,255,0.2); border-radius:8px; padding:1rem 1.5rem; margin-bottom:2rem; display:flex; flex-wrap:wrap; justify-content:space-between; gap:1rem; font-family:var(--mono); font-size:0.85rem;">
          <span>▲ Addition (+)</span>
          <span>● Multiplication (×)</span>
          <span>■ Subtraction (-)</span>
          <span>★ Division (÷)</span>
        </div>

        <div style="display:grid; grid-template-columns:1.2fr 0.8fr; gap:2rem;">
          <!-- Active Card Solver -->
          <div class="challenge-card" style="border-color:var(--diamond);">
            <div class="challenge-top">
              <span>CHALLENGE CARD: <strong style="color:var(--diamond);">${item.card}</strong></span>
              <span>${item.genuine ? 'AUTHENTIC SUIT ROUTE' : 'DECOY TRAIL'}</span>
            </div>

            <div style="text-align:center; padding:2rem 1rem;">
              <p style="font-family:var(--mono); font-size:0.8rem; color:var(--text-dim); text-transform:uppercase;">EXPRESSION</p>
              <div style="font-family:var(--mono); font-size:clamp(1.5rem, 3vw, 2.2rem); font-weight:700; color:var(--diamond); margin:1rem 0;">
                ${item.expression} = ?
              </div>
              <p style="font-size:0.9rem; color:var(--text-muted);">
                Solve the expression according to operator rules, then enter the clue card number below.
              </p>
            </div>

            <form id="diamondCardForm" style="display:flex; flex-direction:column; gap:1rem; max-width:400px; margin:0 auto;">
              <div style="display:flex; gap:0.5rem;">
                <input class="cyber-input" id="diamondInput" placeholder="Answer..." inputmode="numeric" required autofocus autocomplete="off" />
                <button type="submit" class="cyber-btn" style="background:var(--diamond); color:#000;">DECODE ↗</button>
              </div>
              <div id="diamondFeedback" style="font-family:var(--mono); font-size:0.85rem; text-align:center;"></div>
            </form>
          </div>

          <!-- 20-Card Deck Explorer -->
          <div class="challenge-card">
            <div class="challenge-top">
              <span>20 CHALLENGE CARDS</span>
              <span>6 GENUINE · 14 DECOYS</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
              Click any challenge card in the deck to inspect its equation:
            </p>
            <div class="decoy-grid">
              ${diamondCards.map((c, i) => `
                <div class="decoy-card ${i === idx ? 'solved' : ''}" data-card-idx="${i}">
                  <span style="font-family:var(--mono); font-size:0.65rem; color:var(--text-dim);">#${String(i + 1).padStart(2,'0')}</span>
                  <strong style="font-family:var(--display); font-size:0.95rem; color:${i === idx ? 'var(--diamond)' : '#fff'};">${c.card}</strong>
                  <span style="font-family:var(--mono); font-size:0.7rem; color:${c.genuine ? 'var(--diamond)' : 'var(--text-dim)'};">${c.genuine ? '♦' : '✕'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Deck card click listeners
    document.querySelectorAll('.decoy-card').forEach(el => {
      el.addEventListener('click', () => {
        const targetIdx = Number(el.dataset.cardIdx);
        audio.play('click');
        renderCard(targetIdx);
      });
    });

    // Form submit listener
    const form = document.querySelector('#diamondCardForm');
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const ans = document.querySelector('#diamondInput').value.trim();
      const feedback = document.querySelector('#diamondFeedback');

      if (ans === item.answer) {
        audio.play('success');
        if (item.genuine) {
          if (isFinal) {
            clearLevel('diamonds');
            await awardBadge('diamonds');
            feedback.innerHTML = `
              <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:4px; border:1px solid var(--club);">
                <strong>✓ LEVEL 03 CLEARED! ♦ DIAMOND SIGNAL EARNED!</strong><br>
                ${item.reveal}<br>
                <strong>Level 04: ♥ Hearts Trial is now unlocked!</strong>
                <div style="margin-top:0.75rem;">
                  <a href="#/hearts" class="cyber-btn" style="background:var(--heart); color:#fff;" data-nav>ADVANCE TO LEVEL 04 (♥ HEARTS) ↗</a>
                </div>
              </div>
            `;
          } else {
            const nextIdx = diamondCards.findIndex(c => c.card === item.next);
            feedback.innerHTML = `
              <div style="color:var(--club); margin-top:0.5rem;">
                ✓ Correct! ${item.clue}: ${item.reveal}
                <div style="margin-top:0.5rem;">
                  <button type="button" class="cyber-btn" id="btnNextDiamond" style="padding:0.4rem 0.8rem; font-size:0.75rem;">NEXT CARD (${item.next}) ↗</button>
                </div>
              </div>
            `;
            document.querySelector('#btnNextDiamond')?.addEventListener('click', () => {
              audio.play('click');
              renderCard(nextIdx);
            });
          }
        } else {
          feedback.innerHTML = `<span style="color:var(--joker);">${item.reveal} (Decoy cleared). Return to the genuine trail.</span>`;
        }
      } else {
        audio.play('error');
        feedback.innerHTML = `<span style="color:var(--heart);">Incorrect calculation. Check operator precedence: ▲ (+) ● (×) ■ (-) ★ (÷)</span>`;
      }
    });
  }

  renderCard(activeIndex);
}

// --------------------------------------------------------------------------
// VIEW: 04. TRIAL ♥ HEARTS (THE HUMAN CHAIN - 4 ENVELOPES & 5-SEAT LOGIC GRID)
// --------------------------------------------------------------------------
const heartEnvelopes = [
  {
    title: 'ENVELOPE A (Vikram’s Pack)',
    clues: [
      'Topaz and the Key occupy opposite ends.',
      'Ruby seat + Locket seat = 6.',
      'Meera sits immediately left of Aarav.'
    ]
  },
  {
    title: 'ENVELOPE B (Meera’s Pack)',
    clues: [
      'Sapphire sits immediately left of Topaz.',
      'Emerald sits immediately right of Ruby.',
      'Diya is not at either end.'
    ]
  },
  {
    title: 'ENVELOPE C (Aarav’s Pack)',
    clues: [
      'Coin sits immediately right of Pearl.',
      'Rohan holds neither Ring, Watch, nor Key.',
      'The Pearl owner sits immediately right of Emerald owner.'
    ]
  },
  {
    title: 'ENVELOPE D (Diya’s Pack)',
    clues: [
      'Ruby owner and Key holder are the same person.',
      'Meera holds the Watch and owns Emerald.',
      'The confirmed arrangement decodes via A1Z26.'
    ]
  }
];

const heartCorrectArrangement = [
  { p: 'Vikram', o: 'Key', g: 'Ruby', n: 8 },
  { p: 'Meera', o: 'Watch', g: 'Emerald', n: 5 },
  { p: 'Aarav', o: 'Ring', g: 'Pearl', n: 1 },
  { p: 'Diya', o: 'Coin', g: 'Sapphire', n: 18 },
  { p: 'Rohan', o: 'Locket', g: 'Topaz', n: 20 }
];

function renderHeartsView() {
  let openEnv = 0;

  function render() {
    pageRoot.innerHTML = `
      <div class="view-page">
        <header class="page-header">
          <p class="page-eyebrow" style="color:var(--heart);">LEVEL 04 // PSYCHOLOGY & TRUST</p>
          <h1 class="page-title">THE HUMAN<br><span style="color:var(--heart);">CHAIN.</span></h1>
          <p class="page-desc">
            Four sealed envelopes. 20 clues. No single teammate has the full truth. Distribute the envelopes, deduce the five-seat logic matrix, pass the Trust Check, and unlock Level 05 (♠ Spades).
          </p>
        </header>

        ${renderProgressHeader('hearts')}

        <!-- 4 Sealed Envelopes Selector -->
        <p style="font-family:var(--mono); font-size:0.75rem; letter-spacing:0.15em; color:var(--text-dim); text-transform:uppercase; margin-bottom:0.75rem;">
          SELECT TEAMMATE SEALED ENVELOPE
        </p>
        <div class="envelope-grid">
          ${heartEnvelopes.map((env, i) => `
            <div class="envelope-card ${i === openEnv ? 'active' : ''}" data-env-idx="${i}">
              <span style="font-family:var(--mono); font-size:0.7rem; color:var(--heart);">ENVELOPE 0${i + 1}</span>
              <h3 style="font-family:var(--display); font-size:1.05rem; margin:0.4rem 0;">${env.title}</h3>
              <ul style="font-size:0.82rem; color:var(--text-muted); padding-left:1.1rem; line-height:1.5;">
                ${env.clues.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <!-- 5-Seat Logic Grid Form -->
        <div class="challenge-card" style="border-color:var(--heart);">
          <div class="challenge-top">
            <span>FIVE-SEAT LOGIC MATRIX</span>
            <span>MATCH PERSON · OBJECT · GEM FOR SEATS 1 TO 5</span>
          </div>

          <form id="heartsGridForm">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(190px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
              ${[1,2,3,4,5].map(seat => `
                <div style="background:rgba(0,0,0,0.4); border:1px solid var(--border-subtle); padding:1rem; border-radius:6px;">
                  <div style="font-family:var(--mono); font-size:0.8rem; font-weight:700; color:var(--heart); margin-bottom:0.75rem;">
                    SEAT 0${seat}
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.5rem;">
                    <select class="cyber-input" name="p${seat}" required style="padding:0.5rem;">
                      <option value="">— Person —</option>
                      ${['Vikram','Meera','Aarav','Diya','Rohan'].map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                    <select class="cyber-input" name="o${seat}" required style="padding:0.5rem;">
                      <option value="">— Object —</option>
                      ${['Key','Watch','Ring','Coin','Locket'].map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                    <select class="cyber-input" name="g${seat}" required style="padding:0.5rem;">
                      <option value="">— Gem —</option>
                      ${['Ruby','Emerald','Pearl','Sapphire','Topaz'].map(g => `<option value="${g}">${g}</option>`).join('')}
                    </select>
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <button type="submit" class="cyber-btn" style="background:var(--heart); color:#fff;">
                SUBMIT SEAT DEDUCTION ↗
              </button>
              <div id="heartsGridFeedback" style="font-family:var(--mono); font-size:0.85rem;"></div>
            </div>
          </form>
        </div>

        <!-- Trust Check Modal / Section -->
        <div id="trustCheckSection" style="display:none; margin-top:2rem;">
          <div class="challenge-card" style="border-color:var(--heart);">
            <div class="challenge-top">
              <span>HEARTS TRUST CHECK</span>
              <span>VERIFY THE DEDUCED TRUTHS</span>
            </div>

            <form id="trustForm" style="display:flex; flex-direction:column; gap:1rem;">
              ${[
                'Ruby owner and Key holder are the same person.',
                'Pearl owner sits immediately right of Emerald owner.',
                'Rohan owns Sapphire.',
                'Coin holder sits between Pearl owner and Topaz owner.',
                'Meera and the Sapphire owner sit next to each other.'
              ].map((q, idx) => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:0.85rem 1.25rem; border-radius:6px; border:1px solid var(--border-subtle); flex-wrap:wrap; gap:0.5rem;">
                  <span style="font-size:0.9rem;">0${idx + 1}. ${q}</span>
                  <select class="cyber-input" name="q${idx}" required style="width:120px; padding:0.4rem;">
                    <option value="">Choose</option>
                    <option value="TRUE">TRUE</option>
                    <option value="FALSE">FALSE</option>
                  </select>
                </div>
              `).join('')}

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem;">
                <button type="submit" class="cyber-btn" style="background:var(--heart); color:#fff;">
                  VERIFY TRUST CHECK ↗
                </button>
                <div id="trustFeedback" style="font-family:var(--mono); font-size:0.85rem;"></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Envelope selectors
    document.querySelectorAll('.envelope-card').forEach(el => {
      el.addEventListener('click', () => {
        audio.play('click');
        openEnv = Number(el.dataset.envIdx);
        render();
      });
    });

    // Grid Form validation
    const gridForm = document.querySelector('#heartsGridForm');
    gridForm?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(gridForm);
      const isMatch = heartCorrectArrangement.every((seat, idx) => {
        const s = idx + 1;
        return fd.get(`p${s}`) === seat.p && fd.get(`o${s}`) === seat.o && fd.get(`g${s}`) === seat.g;
      });

      const feedback = document.querySelector('#heartsGridFeedback');
      if (isMatch) {
        audio.play('success');
        feedback.innerHTML = `<span style="color:var(--club);">✓ Arrangement verified! Now complete the 5-Question Trust Check below.</span>`;
        document.querySelector('#trustCheckSection').style.display = 'block';
        document.querySelector('#trustCheckSection').scrollIntoView({ behavior: 'smooth' });
      } else {
        audio.play('error');
        feedback.innerHTML = `<span style="color:var(--heart);">Arrangement conflict. Check seat clues (e.g. Ruby+Locket=6, Topaz & Key at opposite ends).</span>`;
      }
    });

    // Trust Form validation
    const trustForm = document.querySelector('#trustForm');
    trustForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(trustForm);
      const expected = ['TRUE', 'TRUE', 'FALSE', 'TRUE', 'FALSE'];
      const passed = expected.every((val, i) => fd.get(`q${i}`) === val);

      const feedback = document.querySelector('#trustFeedback');
      if (passed) {
        audio.play('success');
        clearLevel('hearts');
        await awardBadge('hearts');
        feedback.innerHTML = `
          <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:4px; border:1px solid var(--club); margin-top:1rem;">
            <strong>✓ LEVEL 04 CLEARED! ♥ HEART SIGNAL EARNED!</strong><br>
            A1Z26 number cards: 8 (H) · 5 (E) · 1 (A) · 18 (R) · 20 (T).<br>
            <strong>Level 05: ♠ Spades Trial is now unlocked!</strong>
            <div style="margin-top:0.75rem;">
              <a href="#/spades" class="cyber-btn" style="background:var(--spade); color:#000;" data-nav>ADVANCE TO LEVEL 05 (♠ SPADES) ↗</a>
            </div>
          </div>
        `;
      } else {
        audio.play('error');
        feedback.innerHTML = `<span style="color:var(--heart);">Trust check failed. Recheck the statements against the 5-seat arrangement.</span>`;
      }
    });
  }

  render();
}

// --------------------------------------------------------------------------
// VIEW: 05. TRIAL ♠ SPADES (THE FIELD SIGNAL - CAMPUS WAYPOINTS)
// --------------------------------------------------------------------------
const spadeCheckpoints = [
  {
    step: 'CHECKPOINT 01 · WAYPOINT RIDDLE',
    location: 'Reception Area',
    prompt: 'I welcome those who arrive and point the lost in the right direction. Where am I?',
    answers: ['reception', 'reception area', 'main desk', 'front desk'],
    keyAward: 'P'
  },
  {
    step: 'CHECKPOINT 02 · TECHNICAL RIDDLE',
    location: 'Sports Achievements Area',
    prompt: 'I am the evidence of a mistake. Read me and the problem reveals itself. What am I?',
    answers: ['error log', 'log', 'error message', 'logs'],
    keyAward: 'S'
  },
  {
    step: 'CHECKPOINT 03 · THE STATUES',
    location: 'Three Statues',
    prompt: 'Silent while thousands pass. Outside, never moving, while everyone moves around them. Name the landmark.',
    answers: ['three statues', 'statues', 'statue', 'the three statues'],
    keyAward: 'A'
  },
  {
    step: 'SYSTEM MESSAGE · ALPHABETICAL SCRAMBLE',
    location: 'Central Control',
    prompt: 'THE CODE IS NOT THE ANSWER. Put CODE in alphabetical order (C-D-E-O), then enter the original 1-based positions of those letters.',
    answers: ['1342'],
    keyAward: 'D and E'
  }
];

function renderSpadesView() {
  let stepIdx = 0;
  let earnedKeys = [];

  function render() {
    const item = spadeCheckpoints[stepIdx];

    pageRoot.innerHTML = `
      <div class="view-page">
        <header class="page-header">
          <p class="page-eyebrow" style="color:var(--spade);">LEVEL 05 // PHYSICAL & PRACTICAL</p>
          <h1 class="page-title">THE FIELD<br><span style="color:var(--spade);">SIGNAL.</span></h1>
          <p class="page-desc">
            Move through real-world campus waypoints, crack the technical field riddles, recover all 5 letter keys, and assemble the master word to unlock Level 06 (♣ Clubs).
          </p>
        </header>

        ${renderProgressHeader('spades')}

        <!-- Key Strip -->
        <div style="display:flex; gap:0.75rem; justify-content:center; margin-bottom:2rem;">
          ${['S','P','A','D','E'].map(k => `
            <div style="width:48px; height:48px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:1.3rem; font-weight:800; border:1px solid ${earnedKeys.includes(k) ? 'var(--spade)' : 'var(--border-subtle)'}; background:${earnedKeys.includes(k) ? 'rgba(187,162,255,0.2)' : 'rgba(0,0,0,0.3)'}; color:${earnedKeys.includes(k) ? 'var(--spade)' : 'var(--text-dim)'};">
              ${earnedKeys.includes(k) ? k : '?'}
            </div>
          `).join('')}
        </div>

        <div class="challenge-card" style="border-color:var(--spade); max-width:760px; margin:0 auto;">
          <div class="challenge-top">
            <span>${item.step}</span>
            <span>STAGE 0${stepIdx + 1} / 04</span>
          </div>

          <div style="padding:1.5rem 0; text-align:center;">
            <p style="font-family:var(--mono); font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">LOCATION TARGET: ${item.location}</p>
            <h2 style="font-family:var(--sans); font-size:1.4rem; font-weight:700; margin:1rem 0; line-height:1.4;">
              "${item.prompt}"
            </h2>
          </div>

          <form id="spadeStepForm" style="display:flex; flex-direction:column; gap:1rem; max-width:440px; margin:0 auto;">
            <div style="display:flex; gap:0.5rem;">
              <input class="cyber-input" id="spadeInput" placeholder="Enter answer..." required autofocus autocomplete="off" />
              <button type="submit" class="cyber-btn" style="background:var(--spade); color:#000;">UNLOCK ↗</button>
            </div>
            <div id="spadeFeedback" style="font-family:var(--mono); font-size:0.85rem; text-align:center;"></div>
          </form>
        </div>

        <!-- Master Word Assembly (Visible when all 5 keys earned) -->
        <div id="spadeMasterSection" style="display:${earnedKeys.length >= 5 ? 'block' : 'none'}; margin-top:2.5rem; text-align:center;">
          <div class="challenge-card" style="border-color:var(--spade); max-width:600px; margin:0 auto;">
            <h2 style="font-family:var(--display); font-size:1.6rem; margin-bottom:1rem;">ASSEMBLE THE 5 KEYS</h2>
            <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1.5rem;">
              Arrange keys P, S, A, D, E into the final suit master word before time expires.
            </p>
            <form id="spadeMasterForm" style="display:flex; gap:0.5rem; justify-content:center;">
              <input class="cyber-input" id="masterWordInput" placeholder="Master Word..." style="width:240px; text-transform:uppercase;" required />
              <button type="submit" class="cyber-btn" style="background:var(--spade); color:#000;">LOCK IN ↗</button>
            </form>
            <div id="masterFeedback" style="margin-top:1rem; font-family:var(--mono); font-size:0.85rem;"></div>
          </div>
        </div>
      </div>
    `;

    const form = document.querySelector('#spadeStepForm');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const val = document.querySelector('#spadeInput').value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const feedback = document.querySelector('#spadeFeedback');

      if (item.answers.some(a => a.toLowerCase().replace(/[^a-z0-9]/g, '') === val)) {
        audio.play('success');
        if (item.keyAward.includes('and')) {
          earnedKeys.push('D', 'E');
        } else {
          earnedKeys.push(item.keyAward);
        }
        earnedKeys = Array.from(new Set(earnedKeys));

        if (stepIdx < spadeCheckpoints.length - 1) {
          stepIdx++;
          render();
        } else {
          feedback.innerHTML = `<span style="color:var(--club);">✓ All 5 keys collected! Unscramble below.</span>`;
          render();
        }
      } else {
        audio.play('error');
        feedback.innerHTML = `<span style="color:var(--heart);">Incorrect waypoint signal. Verify landmark clues.</span>`;
      }
    });

    const masterForm = document.querySelector('#spadeMasterForm');
    masterForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const word = document.querySelector('#masterWordInput').value.trim().toUpperCase();
      const feedback = document.querySelector('#masterFeedback');

      if (word === 'SPADE') {
        audio.play('success');
        clearLevel('spades');
        await awardBadge('spades');
        feedback.innerHTML = `
          <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:4px; border:1px solid var(--club);">
            <strong>✓ LEVEL 05 CLEARED! ♠ SPADE SIGNAL EARNED!</strong><br>
            Keys S · P · A · D · E secured.<br>
            <strong>Level 06: ♣ Clubs (The War Room) is now unlocked!</strong>
            <div style="margin-top:0.75rem;">
              <a href="#/clubs" class="cyber-btn" style="background:var(--club); color:#000;" data-nav>ADVANCE TO LEVEL 06 (♣ CLUBS) ↗</a>
            </div>
          </div>
        `;
      } else {
        audio.play('error');
        feedback.innerHTML = `<span style="color:var(--heart);">Incorrect master word. Combine keys P, S, A, D, E.</span>`;
      }
    });
  }

  render();
}

// --------------------------------------------------------------------------
// VIEW: 06. TRIAL ♣ CLUBS (THE WAR ROOM - COOPERATIVE COMMAND RELAY)
// --------------------------------------------------------------------------
function renderClubsView() {
  pageRoot.innerHTML = `
    <div class="view-page">
      <header class="page-header">
        <p class="page-eyebrow" style="color:var(--club);">LEVEL 06 // COMMUNICATION & STRATEGY</p>
        <h1 class="page-title">THE WAR<br><span style="color:var(--club);">ROOM.</span></h1>
        <p class="page-desc">
          Your crew operates the command relay. Synchronize transmission order, calibrate frequency balance, and execute the verified response protocol to unlock Level 07 (🃏 The Final Paradox).
        </p>
      </header>

      ${renderProgressHeader('clubs')}

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem;">
        <!-- Command Cards Relay Order -->
        <div class="challenge-card" style="border-color:var(--club);">
          <div class="challenge-top">
            <span>COMMAND SEQUENCE RELAY</span>
            <span>FOUR TACTICAL PHASES</span>
          </div>

          <div style="background:rgba(80,250,158,0.06); border:1px solid rgba(80,250,158,0.2); border-radius:6px; padding:1rem; margin-bottom:1.5rem; font-size:0.85rem; color:var(--text-muted);">
            <strong style="color:var(--club);">RELAY PROTOCOL RULES:</strong><br>
            1. SCAN is always the opening move.<br>
            2. BRIEF must happen immediately before RELAY.<br>
            3. EXECUTE is the final decisive strike.
          </div>

          <form id="clubsOrderForm" style="display:flex; flex-direction:column; gap:1rem;">
            ${[1,2,3,4].map(slot => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:0.75rem 1rem; border-radius:6px; border:1px solid var(--border-subtle);">
                <span style="font-family:var(--mono); font-size:0.85rem; font-weight:700;">STAGE 0${slot}</span>
                <select class="cyber-input" name="c${slot}" required style="width:160px; padding:0.4rem;">
                  <option value="">Select Command</option>
                  <option value="SCAN">SCAN</option>
                  <option value="BRIEF">BRIEF</option>
                  <option value="RELAY">RELAY</option>
                  <option value="EXECUTE">EXECUTE</option>
                </select>
              </div>
            `).join('')}

            <button type="submit" class="cyber-btn" style="background:var(--club); color:#000; margin-top:0.5rem;">
              LOCK RELAY ORDER ↗
            </button>
            <div id="clubsOrderFeedback" style="font-family:var(--mono); font-size:0.85rem;"></div>
          </form>
        </div>

        <!-- Frequency Calibration & Counter Signal -->
        <div class="challenge-card">
          <div class="challenge-top">
            <span>FREQUENCY CONSENSUS</span>
            <span>CALIBRATE 50% BALANCE</span>
          </div>

          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">
            Both command operators must calibrate their frequencies without circuit overloading. Tune the slider to the resonant harmonic (72 MHz).
          </p>

          <div style="margin-bottom:2rem;">
            <label style="font-family:var(--mono); font-size:0.8rem; color:var(--club); display:flex; justify-content:space-between;">
              <span>HARMONIC TUNER</span>
              <span id="freqDisplay">50 MHz</span>
            </label>
            <input type="range" id="freqSlider" min="10" max="100" value="50" style="width:100%; margin-top:0.75rem; accent-color:var(--club);" />
          </div>

          <div class="challenge-top">
            <span>COUNTER-SIGNAL DECISION</span>
            <span>TACTICAL PRIORITY</span>
          </div>

          <form id="signalChoiceForm" style="display:flex; flex-direction:column; gap:0.75rem;">
            <label style="display:flex; align-items:center; gap:0.75rem; background:rgba(0,0,0,0.3); padding:0.75rem 1rem; border-radius:6px; border:1px solid var(--border-subtle); cursor:pointer;">
              <input type="radio" name="tactical" value="speed" />
              <span style="font-size:0.88rem;">Guess instantly and move with maximum speed</span>
            </label>
            <label style="display:flex; align-items:center; gap:0.75rem; background:rgba(0,0,0,0.3); padding:0.75rem 1rem; border-radius:6px; border:1px solid var(--border-subtle); cursor:pointer;">
              <input type="radio" name="tactical" value="verify" />
              <span style="font-size:0.88rem;">Verify the message with station lead, then relay it</span>
            </label>
            <label style="display:flex; align-items:center; gap:0.75rem; background:rgba(0,0,0,0.3); padding:0.75rem 1rem; border-radius:6px; border:1px solid var(--border-subtle); cursor:pointer;">
              <input type="radio" name="tactical" value="split" />
              <span style="font-size:0.88rem;">Split the crew across sectors without sharing the plan</span>
            </label>

            <button type="submit" class="cyber-btn" style="background:var(--club); color:#000; margin-top:0.5rem;">
              TRANSMIT PROTOCOL ↗
            </button>
            <div id="signalFeedback" style="font-family:var(--mono); font-size:0.85rem;"></div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Frequency slider
  const slider = document.querySelector('#freqSlider');
  const freqDisplay = document.querySelector('#freqDisplay');
  slider?.addEventListener('input', () => {
    freqDisplay.textContent = `${slider.value} MHz`;
  });

  let relayLocked = false;
  const orderForm = document.querySelector('#clubsOrderForm');
  orderForm?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(orderForm);
    const order = [fd.get('c1'), fd.get('c2'), fd.get('c3'), fd.get('c4')].join('|');
    const feedback = document.querySelector('#clubsOrderFeedback');

    if (order === 'SCAN|BRIEF|RELAY|EXECUTE') {
      audio.play('success');
      relayLocked = true;
      feedback.innerHTML = `<span style="color:var(--club);">✓ Sequence verified: SCAN ➔ BRIEF ➔ RELAY ➔ EXECUTE. Now calibrate frequency & transmit protocol.</span>`;
    } else {
      audio.play('error');
      feedback.innerHTML = `<span style="color:var(--heart);">Sequence conflict. Re-read the 3 relay rules.</span>`;
    }
  });

  const signalForm = document.querySelector('#signalChoiceForm');
  signalForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const feedback = document.querySelector('#signalFeedback');
    const fd = new FormData(signalForm);

    if (!relayLocked) {
      audio.play('error');
      feedback.innerHTML = `<span style="color:var(--heart);">First lock in the 4-phase sequence on the left.</span>`;
      return;
    }

    if (Number(slider.value) !== 72) {
      audio.play('error');
      feedback.innerHTML = `<span style="color:var(--joker);">Harmonic tuner misaligned. Target is 72 MHz (currently ${slider.value} MHz).</span>`;
      return;
    }

    if (fd.get('tactical') === 'verify') {
      audio.play('success');
      clearLevel('clubs');
      await awardBadge('clubs');
      feedback.innerHTML = `
        <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:4px; border:1px solid var(--club); margin-top:1rem;">
          <strong>✓ LEVEL 06 CLEARED! ♣ CLUB SIGNAL UNLOCKED!</strong><br>
          Command relay synchronized. All Four Suits Cleared!<br>
          <strong>Level 07: 🃏 The Final Paradox is now unlocked!</strong>
          <div style="margin-top:0.75rem;">
            <a href="#/joker" class="cyber-btn" style="background:var(--joker); color:#000;" data-nav>ENTER LEVEL 07 (THE JOKER FINALE) ↗</a>
          </div>
        </div>
      `;
    } else {
      audio.play('error');
      feedback.innerHTML = `<span style="color:var(--heart);">Protocol rejected. Accuracy must be protected under pressure.</span>`;
    }
  });
}

// --------------------------------------------------------------------------
// VIEW: 07. TRIAL 🃏 FINAL PARADOX (THE JOKER - 20x20 GRID, 15-STACK, STORY TRAP)
// --------------------------------------------------------------------------
const floor20Route = [
  // Defined safe path from (0,0) down to (19,19)
  0, 20, 40, 41, 42, 62, 82, 83, 103, 123, 124, 125, 145, 165, 185,
  186, 206, 226, 246, 247, 267, 287, 307, 327, 347, 367, 368, 388, 398, 399
];

const fifteenColors = [
  'red', 'blue', 'yellow', 'green', 'violet',
  'orange', 'pink', 'cyan', 'lime', 'amber',
  'purple', 'teal', 'white', 'crimson', 'gold'
];

function renderJokerView() {
  function renderPhase1() {
    let visitedCells = [];
    let previewing = true;
    let previewTime = 10;

    pageRoot.innerHTML = `
      <div class="view-page">
        <header class="page-header">
          <p class="page-eyebrow" style="color:var(--joker);">LEVEL 07 // 20 × 20 FLOOR GRID</p>
          <h1 class="page-title">FINAL<br><span style="color:var(--joker);">PARADOX.</span></h1>
          <p class="page-desc">
            A 20 × 20 grid of 400 tiles. Memorize the golden route before the lights shut down. Navigate from START to EXIT without stepping on a hidden trap.
          </p>
        </header>

        ${renderProgressHeader('joker')}

        <div class="challenge-card" style="border-color:var(--joker);">
          <div class="challenge-top">
            <span>20 × 20 ARENA FLOOR MATRIX (400 CELLS)</span>
            <span id="gridTimerText" style="color:var(--joker); font-weight:700;">ROUTE MEMORY WINDOW: ${previewTime}S</span>
          </div>

          <p id="gridInstruction" style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem; text-align:center;">
            MEMORIZE THE SAFE GOLDEN PATH. Fog of War activates in <strong id="gridTimerSec">${previewTime}</strong> seconds.
          </p>

          <div class="joker-grid-viewport">
            <div class="floor-20x20" id="floorGrid">
              ${Array.from({ length: 400 }, (_, i) => `
                <button type="button" class="floor-tile ${i === 0 ? 'start-tile' : i === 399 ? 'exit-tile' : ''} ${floor20Route.includes(i) ? 'path-preview' : ''}" data-cell="${i}" disabled></button>
              `).join('')}
            </div>
          </div>

          <div id="gridFeedback" style="font-family:var(--mono); font-size:0.85rem; text-align:center; margin-top:1.5rem;"></div>
        </div>
      </div>
    `;

    // 10s preview countdown
    const timer = activeTimers.setInterval(() => {
      previewTime--;
      const secEl = document.querySelector('#gridTimerSec');
      if (secEl) secEl.textContent = previewTime;

      if (previewTime <= 0) {
        activeTimers.clearInterval(timer);
        previewing = false;
        const timerText = document.querySelector('#gridTimerText');
        const instEl = document.querySelector('#gridInstruction');
        if (timerText) timerText.textContent = 'FOG OF WAR ACTIVE';
        if (instEl) instEl.textContent = 'Navigate tile by tile from (0,0) top-left to (19,19) bottom-right in the correct sequence.';

        // Hide path and enable interactive buttons
        document.querySelectorAll('.floor-tile').forEach(btn => {
          btn.classList.remove('path-preview');
          btn.disabled = false;
        });
      }
    }, 1000);

    // Grid click handler
    document.querySelector('#floorGrid')?.addEventListener('click', e => {
      const btn = e.target.closest('.floor-tile');
      if (!btn || previewing) return;
      const cell = Number(btn.dataset.cell);
      const expected = floor20Route[visitedCells.length];

      if (cell === expected) {
        audio.play('click');
        visitedCells.push(cell);
        btn.classList.add('visited');

        if (visitedCells.length === floor20Route.length) {
          audio.play('success');
          document.querySelector('#gridFeedback').innerHTML = `
            <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:4px; border:1px solid var(--club);">
              <strong>✓ 20×20 FLOOR GRID CONQUERED!</strong><br>
              Checkpoint 01 cleared. Proceeding to the 15-Block Memory Stack.
              <div style="margin-top:0.75rem;">
                <button type="button" class="cyber-btn" id="btnNextPhase" style="background:var(--joker); color:#000;">COMMENCE 15-BLOCK STACK ↗</button>
              </div>
            </div>
          `;
          document.querySelector('#btnNextPhase')?.addEventListener('click', () => {
            renderPhase2();
          });
        }
      } else {
        audio.play('error');
        btn.classList.add('trap');
        setTimeout(() => btn.classList.remove('trap'), 500);
        visitedCells = [];
        document.querySelectorAll('.floor-tile').forEach(b => b.classList.remove('visited'));
        document.querySelector('#gridFeedback').innerHTML = `<span style="color:var(--heart);">Trap tile triggered! The floor has reset to START.</span>`;
      }
    });
  }

  function renderPhase2() {
    let stackPicked = [];
    let previewing = true;
    let previewSeconds = 8;

    pageRoot.innerHTML = `
      <div class="view-page">
        <header class="page-header">
          <p class="page-eyebrow" style="color:var(--joker);">CHECKPOINT 01 // 15-BLOCK MEMORY STACK</p>
          <h1 class="page-title">THE FIFTEEN<br><span style="color:var(--joker);">BLOCKS.</span></h1>
          <p class="page-desc">
            Memorize the full 15-block color sequence. Once the stack conceals, click the palette buttons to rebuild all 15 blocks from bottom to top.
          </p>
        </header>

        ${renderProgressHeader('joker')}

        <div class="challenge-card" style="border-color:var(--joker); max-width:680px; margin:0 auto;">
          <div class="challenge-top">
            <span>15-COLOR SEQUENCE MEMORY</span>
            <span id="stackTimerText" style="color:var(--joker); font-weight:700;">HIDING IN: ${previewSeconds}S</span>
          </div>

          <div class="stack-builder-15" id="stackDisplay">
            ${fifteenColors.map((color, i) => `
              <div class="stack-tile-15 bg-${color}">${String(i + 1).padStart(2, '0')} · ${color.toUpperCase()}</div>
            `).join('')}
          </div>

          <div class="color-pallet-15" id="colorPallet" style="display:none;">
            ${fifteenColors.map(color => `
              <button type="button" class="color-btn bg-${color}" data-color="${color}">${color}</button>
            `).join('')}
          </div>

          <div id="stackFeedback" style="font-family:var(--mono); font-size:0.85rem; text-align:center; margin-top:1.5rem;"></div>
        </div>
      </div>
    `;

    // 8s countdown
    const timer = activeTimers.setInterval(() => {
      previewSeconds--;
      const el = document.querySelector('#stackTimerText');
      if (el) el.textContent = `HIDING IN: ${previewSeconds}S`;

      if (previewSeconds <= 0) {
        activeTimers.clearInterval(timer);
        previewing = false;
        if (el) el.textContent = 'REBUILD 0 / 15';
        document.querySelector('#colorPallet').style.display = 'grid';
        renderEmptyStack();
      }
    }, 1000);

    function renderEmptyStack() {
      const display = document.querySelector('#stackDisplay');
      if (!display) return;
      display.innerHTML = fifteenColors.map((_, i) => {
        const picked = stackPicked[i];
        if (picked) {
          return `<div class="stack-tile-15 bg-${picked}">${String(i + 1).padStart(2, '0')} · ${picked.toUpperCase()}</div>`;
        }
        return `<div class="stack-tile-15" style="background:#181a24; border:1px solid #2d3042; color:#555;">BLOCK 0${i + 1}</div>`;
      }).join('');
    }

    document.querySelector('#colorPallet')?.addEventListener('click', e => {
      const btn = e.target.closest('.color-btn');
      if (!btn || previewing) return;
      const color = btn.dataset.color;
      const expected = fifteenColors[stackPicked.length];

      if (color === expected) {
        audio.play('click');
        stackPicked.push(color);
        const timerText = document.querySelector('#stackTimerText');
        if (timerText) timerText.textContent = `REBUILD ${stackPicked.length} / 15`;
        renderEmptyStack();

        if (stackPicked.length === fifteenColors.length) {
          audio.play('success');
          document.querySelector('#stackFeedback').innerHTML = `
            <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:4px; border:1px solid var(--club);">
              <strong>✓ 15-BLOCK COLOR STACK CONQUERED!</strong><br>
              Checkpoint 02 cleared. Advancing to the Memory Trap Story Recall.
              <div style="margin-top:0.75rem;">
                <button type="button" class="cyber-btn" id="btnNextStory" style="background:var(--joker); color:#000;">ADVANCE TO MEMORY TRAP ↗</button>
              </div>
            </div>
          `;
          document.querySelector('#btnNextStory')?.addEventListener('click', () => {
            renderPhase3();
          });
        }
      } else {
        audio.play('error');
        stackPicked = [];
        renderEmptyStack();
        document.querySelector('#stackFeedback').innerHTML = `<span style="color:var(--heart);">Wrong color block! The stack has reset.</span>`;
      }
    });
  }

  function renderPhase3() {
    let readingSeconds = 12;

    pageRoot.innerHTML = `
      <div class="view-page">
        <header class="page-header">
          <p class="page-eyebrow" style="color:var(--joker);">CHECKPOINT 02 // MEMORY TRAP STORY</p>
          <h1 class="page-title">THE WITNESS<br><span style="color:var(--joker);">TEST.</span></h1>
          <p class="page-desc">
            A precise eyewitness account from the laboratory. Memorize every number, object, and color before the questions lock in.
          </p>
        </header>

        ${renderProgressHeader('joker')}

        <div class="challenge-card" style="border-color:var(--joker); max-width:760px; margin:0 auto;">
          <div class="challenge-top">
            <span>EYEWITNESS TRANSCRIPT</span>
            <span id="storyTimer" style="color:var(--joker); font-weight:700;">QUESTIONS COMMENCE IN: ${readingSeconds}S</span>
          </div>

          <div id="storyContent" style="background:rgba(0,0,0,0.5); padding:2rem; border-radius:8px; border:1px solid var(--border-subtle); line-height:1.75; font-size:1.15rem; font-family:Georgia, serif; color:var(--text-main);">
            "At 9:15 AM, Aarav, Meera, Rohan and Diya entered a laboratory. Aarav wore blue and placed key <b>6</b> on Table <b>2</b>. Meera wore red and placed green card <b>8</b> on Table <b>4</b>. Rohan wore <b>yellow</b>, carried a black notebook of <b>15</b> pages, and placed it immediately left of Meera. Diya wore green and carried key <b>3</b>. Before leaving, Aarav moved his key to Rohan’s table."
          </div>

          <!-- Questions form (hidden until timer finishes) -->
          <form id="storyQuestionsForm" style="display:none; margin-top:2rem; flex-direction:column; gap:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:0.85rem; border-radius:6px; border:1px solid var(--border-subtle); flex-wrap:wrap; gap:0.5rem;">
              <span>01. What color was Rohan wearing?</span>
              <input class="cyber-input" name="q1" placeholder="Color..." required style="width:180px;" />
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:0.85rem; border-radius:6px; border:1px solid var(--border-subtle); flex-wrap:wrap; gap:0.5rem;">
              <span>02. How many pages were in Rohan's notebook?</span>
              <input class="cyber-input" name="q2" placeholder="Page count..." required inputmode="numeric" style="width:180px;" />
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:0.85rem; border-radius:6px; border:1px solid var(--border-subtle); flex-wrap:wrap; gap:0.5rem;">
              <span>03. Which table number held Rohan's notebook?</span>
              <input class="cyber-input" name="q3" placeholder="Table number..." required style="width:180px;" />
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:0.85rem; border-radius:6px; border:1px solid var(--border-subtle); flex-wrap:wrap; gap:0.5rem;">
              <span>04. What number was on Aarav's key?</span>
              <input class="cyber-input" name="q4" placeholder="Key number..." required inputmode="numeric" style="width:180px;" />
            </div>

            <button type="submit" class="cyber-btn" style="background:var(--joker); color:#000; margin-top:0.5rem;">
              VALIDATE RECALL ↗
            </button>
            <div id="storyFeedback" style="font-family:var(--mono); font-size:0.85rem; text-align:center;"></div>
          </form>
        </div>
      </div>
    `;

    const timer = activeTimers.setInterval(() => {
      readingSeconds--;
      const el = document.querySelector('#storyTimer');
      if (el) el.textContent = `QUESTIONS COMMENCE IN: ${readingSeconds}S`;

      if (readingSeconds <= 0) {
        activeTimers.clearInterval(timer);
        if (el) el.textContent = 'MEMORY RECALL ACTIVE';
        document.querySelector('#storyContent').innerHTML = '<p style="color:var(--text-dim); font-style:italic;">[Eyewitness transcript concealed. Answer from memory.]</p>';
        document.querySelector('#storyQuestionsForm').style.display = 'flex';
      }
    }, 1000);

    const form = document.querySelector('#storyQuestionsForm');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const q1 = fd.get('q1').trim().toLowerCase();
      const q2 = fd.get('q2').trim();
      const q3 = fd.get('q3').trim().toLowerCase().replace(/[^0-9]/g, '');
      const q4 = fd.get('q4').trim();

      const feedback = document.querySelector('#storyFeedback');
      if (q1 === 'yellow' && q2 === '15' && q3 === '3' && q4 === '6') {
        audio.play('success');
        feedback.innerHTML = `
          <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:4px; border:1px solid var(--club); margin-top:1rem;">
            <strong>✓ MEMORY TRAP SURVIVED!</strong><br>
            Key numbers synthesized: Pages (15) · Table (3) · Key (6) ➔ Code: <strong>1536</strong>.<br>
            Final stage unlocked: The 3 Campus Exit Locations.
            <div style="margin-top:0.75rem;">
              <button type="button" class="cyber-btn" id="btnCampusEscape" style="background:var(--joker); color:#000;">REACH CAMPUS ESCAPE ↗</button>
            </div>
          </div>
        `;
        document.querySelector('#btnCampusEscape')?.addEventListener('click', () => {
          renderPhase4();
        });
      } else {
        audio.play('error');
        feedback.innerHTML = `<span style="color:var(--heart);">Memory discrepancy detected. Re-verify the details.</span>`;
      }
    });
  }

  function renderPhase4() {
    pageRoot.innerHTML = `
      <div class="view-page">
        <header class="page-header">
          <p class="page-eyebrow" style="color:var(--joker);">LEVEL 07 FINAL STRIKE // CAMPUS EXIT LOCATIONS</p>
          <h1 class="page-title">PARADOX<br><span style="color:var(--joker);">ESCAPED.</span></h1>
          <p class="page-desc">
            To claim the physical Joker Card, solve the three campus escape riddles and enter the master verification code <strong>1536</strong>.
          </p>
        </header>

        ${renderProgressHeader('joker')}

        <div class="challenge-card" style="border-color:var(--joker); max-width:760px; margin:0 auto;">
          <div class="challenge-top">
            <span>FINAL THREE LANDMARKS</span>
            <span>CODE: 1536</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:1rem; margin-bottom:2rem;">
            <div style="background:rgba(0,0,0,0.4); padding:1rem 1.25rem; border-radius:6px; border:1px solid var(--border-subtle);">
              <span style="font-family:var(--mono); color:var(--joker); font-size:0.8rem;">LANDMARK A</span>
              <p style="margin-top:0.25rem; font-size:0.95rem;">"Where bouncing rubber echoes off asphalt cages under open sky." ➔ <strong>Basketball Court</strong></p>
            </div>
            <div style="background:rgba(0,0,0,0.4); padding:1rem 1.25rem; border-radius:6px; border:1px solid var(--border-subtle);">
              <span style="font-family:var(--mono); color:var(--joker); font-size:0.8rem;">LANDMARK B</span>
              <p style="margin-top:0.25rem; font-size:0.95rem;">"Where water dances in stone rings under the sun." ➔ <strong>Campus Fountain</strong></p>
            </div>
            <div style="background:rgba(0,0,0,0.4); padding:1rem 1.25rem; border-radius:6px; border:1px solid var(--border-subtle);">
              <span style="font-family:var(--mono); color:var(--joker); font-size:0.8rem;">LANDMARK C</span>
              <p style="margin-top:0.25rem; font-size:0.95rem;">"Where students refuel and cups clatter at noon." ➔ <strong>Central Canteen</strong></p>
            </div>
          </div>

          <form id="finalJokerForm" style="display:flex; flex-direction:column; gap:1rem; max-width:400px; margin:0 auto;">
            <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); text-align:center;">
              ENTER MASTER ESCAPE CODE (PAGES · TABLE · KEY)
            </label>
            <div style="display:flex; gap:0.5rem;">
              <input class="cyber-input" id="finalCodeInput" placeholder="1536" required style="font-size:1.2rem; font-weight:700; text-align:center;" />
              <button type="submit" class="cyber-btn" style="background:var(--joker); color:#000;">CLAIM JOKER ↗</button>
            </div>
            <div id="finalJokerFeedback" style="font-family:var(--mono); font-size:0.85rem; text-align:center;"></div>
          </form>
        </div>
      </div>
    `;

    const form = document.querySelector('#finalJokerForm');
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const code = document.querySelector('#finalCodeInput').value.trim();
      const feedback = document.querySelector('#finalJokerFeedback');

      if (code === '1536') {
        audio.play('success');
        clearLevel('joker');
        await awardBadge('joker');
        feedback.innerHTML = `
          <div style="background:rgba(255,194,51,0.12); border:1px solid var(--joker); border-radius:8px; padding:2rem; margin-top:1.5rem; text-align:center;">
            <div style="font-size:3.5rem;">👑 🃏 🏆</div>
            <h2 style="font-family:var(--display); font-size:2rem; color:var(--joker); margin:0.5rem 0;">PARADOX CONQUERED!</h2>
            <p style="font-size:1rem; color:var(--text-main); margin-bottom:1.5rem;">
              All Seven Levels, All Four Suits (♦ ♥ ♠ ♣), and The Joker (🃏) have been conquered. Your crew <strong>${currentTeam}</strong> has cleared the IEEE Multi-Round Challenge!
            </p>
            <a href="#/leaderboard" class="cyber-btn" style="background:var(--acid); color:#000;" data-nav>
              VIEW LIVE LEADERBOARD STANDINGS ↗
            </a>
          </div>
        `;
      } else {
        audio.play('error');
        feedback.innerHTML = `<span style="color:var(--heart);">Invalid code. Recall notebook pages (15) · Table (3) · Key (6).</span>`;
      }
    });
  }

  renderPhase1();
}

// --------------------------------------------------------------------------
// VIEW: 08. LEADERBOARD & COORDINATOR HUB (MONGODB ATLAS REAL-TIME SYNC)
// --------------------------------------------------------------------------
async function renderLeaderboardView() {
  const cleared = getClearedLevels();

  pageRoot.innerHTML = `
    <div class="view-page">
      <header class="page-header">
        <p class="page-eyebrow">LIVE CREW RANKINGS // MONGODB ATLAS</p>
        <h1 class="page-title">ARENA<br><span style="color:var(--acid);">LEADERBOARD.</span></h1>
        <p class="page-desc">
          Real-time status of all 12 teams across the four suit trials and the final paradox. Verified against MongoDB database <code>crazy-website</code>.
        </p>
      </header>

      ${renderProgressHeader('leaderboard')}

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button type="button" class="cyber-btn" id="btnRefreshLead" style="padding:0.5rem 1rem; font-size:0.75rem;">REFRESH DATA ↻</button>
          <button type="button" class="cyber-btn" id="btnToggleCheat" style="padding:0.5rem 1rem; font-size:0.75rem; background:transparent; border:1px solid var(--border-subtle); color:var(--text-muted);">
            STATION LEADS CHEAT SHEET 👁
          </button>
          <button type="button" class="cyber-btn" id="btnResetProgress" style="padding:0.5rem 1rem; font-size:0.75rem; background:transparent; border:1px solid var(--heart); color:var(--heart);">
            RESET MY TRAIL PROGRESS ↺
          </button>
        </div>
        <div style="font-family:var(--mono); font-size:0.8rem; color:var(--text-muted);">
          Active Crew: <strong style="color:var(--acid);">${currentTeam}</strong> (${cleared.length} / 7 Completed)
        </div>
      </div>

      <!-- Station Leads Cheat Sheet (Hidden by default) -->
      <div id="cheatSheet" style="display:none; background:rgba(0,0,0,0.6); border:1px solid var(--border-subtle); border-radius:8px; padding:1.5rem; margin-bottom:2rem; font-family:var(--mono); font-size:0.85rem; color:var(--text-muted);">
        <h3 style="font-family:var(--display); color:var(--diamond); margin-bottom:1rem;">STATION LEADS SOLUTION MASTER REFERENCE</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
          <div>
            <strong style="color:var(--diamond);">♦ Diamonds Route:</strong>
            <div>ORBIT (11) ➔ NOVA (34) ➔ VECTOR (18) ➔ PULSE (27) ➔ ECHO (45) ➔ PRISM (16) ➔ DIAMOND</div>
          </div>
          <div>
            <strong style="color:var(--heart);">♥ Hearts Arrangement:</strong>
            <div>Vikram (Key, Ruby) | Meera (Watch, Emerald) | Aarav (Ring, Pearl) | Diya (Coin, Sapphire) | Rohan (Locket, Topaz) ➔ HEART</div>
          </div>
          <div>
            <strong style="color:var(--spade);">♠ Spades Keys:</strong>
            <div>Reception (P) | Trophy (S) | Statues (A) | CODE unscramble (D, E) ➔ SPADE</div>
          </div>
          <div>
            <strong style="color:var(--club);">♣ Clubs Command:</strong>
            <div>SCAN ➔ BRIEF ➔ RELAY ➔ EXECUTE | Frequency: 72 MHz | Signal: Verify then relay ➔ CLUB</div>
          </div>
          <div>
            <strong style="color:var(--joker);">🃏 Joker Trap Code:</strong>
            <div>1536 (Pages: 15, Table: 3, Key: 6) | Landmarks: Basketball Court, Fountain, Canteen</div>
          </div>
        </div>
      </div>

      <div id="leaderboardContainer">
        <p style="font-family:var(--mono); color:var(--text-dim);">Fetching live teams from Atlas…</p>
      </div>
    </div>
  `;

  document.querySelector('#btnResetProgress')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset your local trial progression back to Level 01?')) {
      audio.play('click');
      localStorage.removeItem('bt_cleared_levels');
      updateNavLockStatus();
      showToast('Trail progression reset! Starting at Level 01 (Formation).');
      navigateTo('#/formation');
    }
  });

  document.querySelector('#btnToggleCheat')?.addEventListener('click', () => {
    const sheet = document.querySelector('#cheatSheet');
    if (sheet) sheet.style.display = sheet.style.display === 'none' ? 'block' : 'none';
  });

  const btnRefresh = document.querySelector('#btnRefreshLead');
  btnRefresh?.addEventListener('click', () => {
    audio.play('click');
    loadTeams();
  });

  async function loadTeams() {
    const container = document.querySelector('#leaderboardContainer');
    try {
      const res = await fetch('/api/leaderboard');
      const teams = await res.json();

      if (!teams.length) {
        container.innerHTML = `<p style="font-family:var(--mono); color:var(--text-dim);">No teams registered yet. Be the first to assemble a crew in Level 01!</p>`;
        return;
      }

      container.innerHTML = `
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Crew Name</th>
              <th>Captain</th>
              <th>Badges Earned</th>
              <th>Completed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${teams.map((t, idx) => `
              <tr style="${t.name === currentTeam ? 'outline:1px solid var(--acid);' : ''}">
                <td style="font-family:var(--mono); font-weight:700; color:${idx === 0 ? 'var(--acid)' : 'inherit'};">
                  #${String(idx + 1).padStart(2, '0')}
                </td>
                <td style="font-weight:700;">
                  ${t.name} ${t.name === currentTeam ? '<small style="color:var(--acid); margin-left:4px;">(YOU)</small>' : ''}
                </td>
                <td style="color:var(--text-muted);">${t.captain}</td>
                <td>
                  <span class="badge-tag ${(t.badges || []).includes('diamonds') ? 'earned' : ''}" title="Diamonds">♦</span>
                  <span class="badge-tag ${(t.badges || []).includes('hearts') ? 'earned' : ''}" title="Hearts">♥</span>
                  <span class="badge-tag ${(t.badges || []).includes('spades') ? 'earned' : ''}" title="Spades">♠</span>
                  <span class="badge-tag ${(t.badges || []).includes('clubs') ? 'earned' : ''}" title="Clubs">♣</span>
                  <span class="badge-tag ${(t.badges || []).includes('joker') ? 'earned' : ''}" title="Joker">🃏</span>
                </td>
                <td style="font-family:var(--mono);">${t.totalSolved} / 5</td>
                <td>
                  <span style="font-family:var(--mono); font-size:0.75rem; padding:0.25rem 0.6rem; border-radius:4px; background:${t.totalSolved === 5 ? 'rgba(80,250,158,0.15)' : 'rgba(255,255,255,0.05)'}; color:${t.totalSolved === 5 ? 'var(--club)' : 'var(--text-muted)'};">
                    ${t.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch {
      container.innerHTML = `<p style="color:var(--heart); font-family:var(--mono);">Could not reach server to load standings.</p>`;
    }
  }

  loadTeams();
}

// Initial mount based on window location
const initialRoute = window.location.hash.replace(/^#\/?/, '') || 'home';
if (!isLevelUnlocked(initialRoute)) {
  const activeLevel = getActiveUnlockedLevel();
  window.location.hash = `#/${activeLevel}`;
  mountView(activeLevel);
} else {
  mountView(initialRoute);
}
updateNavLockStatus();
