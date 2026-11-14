// Borderland Trail — NISB Multi-Round Challenge Engine
// Mario Roudil Style Page Transitions & Strict Level-by-Level Progression System

// ==========================================================================
// ARENA INTEGRITY & ANTI-CHEAT SHIELD (BLOCKS F12, INSPECT & VIEW-SOURCE)
// ==========================================================================
(() => {
  // 1. Disable Right Click Context Menu
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (typeof showToast === 'function') {
      showToast('⚠️ ARENA DEFENSE: Context menu is disabled during the live trial!');
    }
    return false;
  }, false);

  // 2. Intercept DevTools & Source Inspection Keyboard Shortcuts
  window.addEventListener('keydown', e => {
    const isCtrl = e.ctrlKey || e.metaKey;

    // F12 (Inspect)
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof showToast === 'function') {
        showToast('⚠️ ARENA DEFENSE: Developer tools are disabled during live arena!');
      }
      return false;
    }

    // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
    if (isCtrl && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof showToast === 'function') {
        showToast('⚠️ ARENA DEFENSE: Inspector shortcut intercepted!');
      }
      return false;
    }

    // Ctrl+U (View Source), Ctrl+S (Save Page)
    if (isCtrl && ['u', 'U', 's', 'S'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof showToast === 'function') {
        showToast('⚠️ ARENA DEFENSE: Source view is disabled!');
      }
      return false;
    }
  }, true);

  // 3. Suppress inspection via Console warning
  if (typeof console !== 'undefined') {
    console.log(
      '%c⚠️ BORDERLAND TRAIL · NISB ARENA ACTIVE',
      'color:#ffb703; font-size:18px; font-weight:900; text-shadow:0 0 10px #ffb703;'
    );
    console.log(
      '%cAll round answers execute with server-side validation authority. Solution snooping is strictly prohibited and logged.',
      'color:#94a3b8; font-size:12px;'
    );
  }
})();

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
    } catch { }
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
  { id: 'formation', num: 1, title: 'Formation (Team Registration)', badge: 'formation' },
  { id: 'card-hunt', num: 2, title: 'Riddle & Card Hunt', badge: 'hunt' },
  { id: 'diamonds', num: 3, title: '♦ Diamonds (Physical Trial)', badge: 'diamonds' },
  { id: 'hearts', num: 4, title: '♥ Hearts (Physical Trial)', badge: 'hearts' },
  { id: 'spades', num: 5, title: '♠ Spades (The Field Signal)', badge: 'spades' },
  { id: 'clubs', num: 6, title: '♣ Clubs (Website-Driven)', badge: 'clubs' },
  { id: 'joker', num: 7, title: '🃏 Final Paradox (Two-Part Finale)', badge: 'joker' },
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
  if (route === 'card-hunt') return { num: 1, title: 'Formation (Team Registration)' };
  if (route === 'diamonds') return { num: 2, title: 'Riddle & Card Hunt' };
  if (route === 'hearts') return { num: 3, title: '♦ Diamonds (Physical Trial)' };
  if (route === 'spades') return { num: 4, title: '♥ Hearts (Physical Trial)' };
  if (route === 'clubs') return { num: 5, title: '♠ Spades Trial' };
  if (route === 'joker') return { num: 6, title: '♣ Clubs (Website-Driven)' };
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
  } catch { }
}

// Secure Server-Side Answer Verification Client
async function verifyAnswerWithServer(round, payload = {}) {
  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round, teamName: currentTeam, ...payload })
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { ok: false, error: `Server error (${res.status}). Response was not valid JSON.` };
    }
  } catch (e) {
    return { ok: false, error: 'Connection error. Check network link.' };
  }
}

// --- Page Transition Engine (Mario Roudil List Transition) ---
const curtain = document.querySelector('#pageCurtain');
const curtainSuit = document.querySelector('#curtainSuit');
const curtainTitle = document.querySelector('#curtainTitle');
const curtainTag = document.querySelector('#curtainTag');
const pageRoot = document.querySelector('#pageRoot');

const routeMeta = {
  '': { suit: 'BT', title: 'THE BORDERLAND TRAIL', tag: 'NISB MULTI-ROUND TEAM ARENA', color: 'var(--acid)' },
  'home': { suit: 'BT', title: 'THE BORDERLAND TRAIL', tag: 'NISB MULTI-ROUND TEAM ARENA', color: 'var(--acid)' },
  'formation': { suit: '01', title: 'FIND YOUR PEOPLE', tag: 'LEVEL 01 · TEAM REGISTRATION', color: 'var(--acid)' },
  'card-hunt': { suit: '02', title: 'RIDDLE & CARD HUNT', tag: 'LEVEL 02 · DIRECTIONAL CIPHER', color: '#fff' },
  'diamonds': { suit: '♦', title: 'DIAMONDS TRIAL', tag: 'LEVEL 03 · PHYSICAL ROUND ONLY', color: 'var(--diamond)' },
  'hearts': { suit: '♥', title: 'HEARTS TRIAL', tag: 'LEVEL 04 · PHYSICAL ROUND ONLY', color: 'var(--heart)' },
  'spades': { suit: '♠', title: 'THE FIELD SIGNAL', tag: 'LEVEL 05 · PHYSICAL WAYPOINTS', color: 'var(--spade)' },
  'clubs': { suit: '♣', title: 'THE WAR ROOM', tag: 'LEVEL 06 · 100% WEBSITE-DRIVEN', color: 'var(--club)' },
  'joker': { suit: '🃏', title: 'FINAL PARADOX', tag: 'LEVEL 07 · TWO-PART FINALE (WEB + PHYSICAL)', color: 'var(--joker)' },
  'leaderboard': { suit: '🏆', title: 'ARENA LEADERBOARD', tag: 'LIVE CREW STANDINGS', color: '#fff' }
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

    // Close mobile nav drawer if open
    closeMobileMenu();

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

// Mobile Navigation Drawer Controller
const btnMobileMenu = document.querySelector('#btnMobileMenu');
const navMobileOverlay = document.querySelector('#navMobileOverlay');
const navLinks = document.querySelector('.nav-links');

function closeMobileMenu() {
  if (btnMobileMenu) {
    btnMobileMenu.classList.remove('open');
    btnMobileMenu.setAttribute('aria-expanded', 'false');
  }
  if (navLinks) navLinks.classList.remove('mobile-open');
  if (navMobileOverlay) navMobileOverlay.classList.remove('active');
}

function toggleMobileMenu() {
  if (!btnMobileMenu || !navLinks) return;
  const isOpen = btnMobileMenu.classList.toggle('open');
  btnMobileMenu.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  navLinks.classList.toggle('mobile-open', isOpen);
  if (navMobileOverlay) navMobileOverlay.classList.toggle('active', isOpen);
  if (isOpen) audio.play('click');
}

if (btnMobileMenu) {
  btnMobileMenu.addEventListener('click', toggleMobileMenu);
}
if (navMobileOverlay) {
  navMobileOverlay.addEventListener('click', closeMobileMenu);
}
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    closeMobileMenu();
  }
});

// Global Nav click interceptor
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-nav]');
  if (link && link.getAttribute('href')?.startsWith('#')) {
    event.preventDefault();
    closeMobileMenu();
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
      title: 'CREW ASSEMBLY',
      suit: '♦',
      desc: 'Physical clue cards distributed at venue. Form your 5-member crew and register on the website.',
      reward: '+500 ARENA PTS',
      rot: '-6deg',
      tz: '10px'
    },
    {
      num: 2,
      id: 'card-hunt',
      title: 'THE LINK',
      suit: '♥',
      desc: 'Solve opening directional riddle without hints to recover the Four Suit Route Pack.',
      reward: '+600 ARENA PTS',
      rot: '-3deg',
      tz: '5px'
    },
    {
      num: 3,
      id: 'diamonds',
      title: 'DIAMONDS TRIAL',
      suit: '♦',
      desc: 'Physical Round: Conducted entirely on-site at the venue. Challenge cards and tasks administered offline.',
      reward: 'DIAMOND SIGNAL',
      rot: '-1deg',
      tz: '0px'
    },
    {
      num: 4,
      id: 'hearts',
      title: 'HEARTS TRIAL',
      suit: '♥',
      desc: 'Physical Round: Conducted entirely on-site at the venue. Teammate envelopes and tasks administered offline.',
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
      title: 'THE WAR ROOM',
      suit: '♣',
      desc: '100% Website-Driven: Command relay sequencing, 72 MHz tuner calibration & counter-protocol.',
      reward: 'CLUB SIGNAL',
      rot: '3deg',
      tz: '5px'
    },
    {
      num: 7,
      id: 'joker',
      title: 'THE JOKER',
      suit: '★',
      desc: 'Two-Part Finale: Part 1 is website-driven (20×20 floor grid), followed by Part 2 in the physical arena.',
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

        <!-- Main Hero Content -->
        <div class="paradox-main-content">
          <div class="paradox-left-col">
            <!-- Hero Brand Line -->
            <div class="hero-brand-line">
              <span class="hero-brand-org">NISB PRESENTS</span>
              <span class="hero-brand-sep">•</span>
              <span class="hero-brand-event">BORDERLAND TRAIL ARENA</span>
            </div>

            <!-- Hero Title -->
            <div>
              <h6 class="paradox-hero-title">
                SURVIVE <br />
                <span class="paradox-brush-title animate-glitch-brush">
                  THE PARADOX.
                </span>
              </h6>
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

            <!-- Directive / Bridge info -->
            <div style="display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap; margin-top:0.5rem;">
              <div class="paradox-scroll-hint" id="scrollHint" style="cursor:pointer;">
                <div class="mouse-pill">
                  <span class="mouse-wheel"></span>
                </div>
                <span>SCROLL TO EXPLORE TRAIL</span>
              </div>
              <div class="paradox-bridge-label">
                STRANGERS • CONNECT • HERE
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

          <!-- NISB Footer Branding -->
          <div class="paradox-NISB-footer">
            <div class="NISB-brand-tag">
              <svg style="width:14px; height:14px; color:#ffb703;" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>NISB | IDEAS • PEOPLE • POSSIBILITIES</span>
            </div>
            <div class="NISB-motto">
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
                <span id="modalDiff" class="modal-stat-val active">UNLOCKED · ACTIVE</span>
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
      modalDiff.textContent = 'STATUS: LOCKED · SEQUENCE INCOMPLETE';
      modalDiff.className = 'modal-stat-val locked';
      modalActionBtn.textContent = 'LEVEL LOCKED';
      modalActionBtn.disabled = true;
      audio.play('error');
      if (prereq) {
        showToast(`🔒 LEVEL LOCKED: Complete Level 0${prereq.num} (${prereq.title}) first!`);
      }
    } else {
      modalDiff.textContent = isCleared ? 'STATUS: CLEARED · COMPLETE' : 'STATUS: UNLOCKED · READY';
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

  // 5. Live Animated Canvas: Subtle Ambient Stardust & Embers Over Master Artwork
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
      targetMouseX = (e.clientX / W - 0.5) * 20;
      targetMouseY = (e.clientY / H - 0.5) * 15;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initialize Subtle Ambient Floating Embers
    const embers = [];
    const EMBER_COUNT = window.innerWidth <= 768 ? 25 : 50;
    for (let i = 0; i < EMBER_COUNT; i++) {
      embers.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 1.8 + 0.6,
        speedY: Math.random() * 0.9 + 0.3,
        speedX: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        decay: Math.random() * 0.003 + 0.002
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

      emberTime += 0.02;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, W, H);

      // Render Subtle Stardust Embers
      ctx.save();
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i];
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(emberTime + p.y * 0.01) * 0.3;
        p.alpha -= p.decay;

        if (p.y < 0 || p.alpha <= 0) {
          p.x = Math.random() * W;
          p.y = H + 10;
          p.alpha = Math.random() * 0.6 + 0.1;
          p.speedY = Math.random() * 0.9 + 0.3;
        }

        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.fillStyle = `rgba(240, 246, 255, ${p.alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animId = requestAnimationFrame(emberLoop);
    };

    animId = requestAnimationFrame(emberLoop);
  }
}

// --------------------------------------------------------------------------
// VIEW: 01. FORMATION ("TEAM REGISTRATION")
// --------------------------------------------------------------------------
function renderFormationView() {
  pageRoot.innerHTML = `
    <div class="view-page">
      <header class="page-header">
        <p class="page-eyebrow">LEVEL 01 · TEAM REGISTRATION</p>
        <h1 class="page-title">FIND YOUR<br><span style="color:var(--acid);">PEOPLE.</span></h1>
        <p class="page-desc">
          Formation clues are distributed physically at the venue. Find your matching peers using your physical clue cards, assemble your five-player crew, and register your team members' names below to unlock Level 02 (Riddle & Card Hunt).
        </p>
      </header>

      ${renderProgressHeader('formation')}

      <div style="max-width:680px; margin:0 auto;">
        <!-- 5-Player Team Registration Form -->
        <div class="challenge-card" style="border-color:var(--acid);">
          <div class="challenge-top">
            <span>OFFICIAL TEAM REGISTRATION</span>
            <span style="color:var(--acid); font-weight:700;">5-MEMBER CREW</span>
          </div>

          <p style="font-family:var(--mono); font-size:0.8rem; color:var(--text-muted); margin-bottom:1.5rem; line-height:1.5;">
            Clues are distributed physically by event coordinators. Once your crew is formed, enter your team members' details below to register in the arena database.
          </p>

          <form id="formationForm" style="display:flex; flex-direction:column; gap:1.15rem;">
            <div>
              <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                TEAM / CREW NAME (REQUIRED)
              </label>
              <input class="cyber-input" name="name" placeholder="e.g. The Wildcards" value="${currentTeam}" required maxlength="40" />
            </div>

            <div>
              <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                CAPTAIN / LEAD FULL NAME (REQUIRED)
              </label>
              <input class="cyber-input" name="captain" placeholder="Captain Full Name" required />
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <div>
                <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                  MEMBER 2 FULL NAME (REQUIRED)
                </label>
                <input class="cyber-input" name="m2" placeholder="Player 2 Full Name" required />
              </div>
              <div>
                <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                  MEMBER 3 FULL NAME (REQUIRED)
                </label>
                <input class="cyber-input" name="m3" placeholder="Player 3 Full Name" required />
              </div>
              <div>
                <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                  MEMBER 4 FULL NAME (REQUIRED)
                </label>
                <input class="cyber-input" name="m4" placeholder="Player 4 Full Name" required />
              </div>
              <div>
                <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                  MEMBER 5 FULL NAME (REQUIRED)
                </label>
                <input class="cyber-input" name="m5" placeholder="Player 5 Full Name" required />
              </div>
            </div>

            <div>
              <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.4rem;">
                CONTACT (EMAIL OR PHONE)
              </label>
              <input class="cyber-input" name="contact" placeholder="crew@ieee.org" />
            </div>

            <button type="submit" class="cyber-btn" id="btnRegisterTeam" style="margin-top:0.5rem; background:var(--acid); color:#000;">
              CONFIRM CREW & CLEAR LEVEL 01 ↗
            </button>

            <div id="formationFeedback" style="font-family:var(--mono); font-size:0.85rem; margin-top:0.5rem;"></div>
          </form>
        </div>
      </div>
    </div>
  `;

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
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON (${res.status}).`);
      }
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
        <p class="page-eyebrow">LEVEL 02 · RIDDLE & CARD HUNT</p>
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
              ENTER DESTINATION CIPHER OR LANDMARK
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
  huntForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const val = document.querySelector('#huntInput').value.trim();
    const feedback = document.querySelector('#huntFeedback');
    feedback.innerHTML = '<span style="color:var(--text-dim);">Connecting to satellite relay...</span>';

    const result = await verifyAnswerWithServer('card-hunt', { answer: val });

    if (result.ok) {
      audio.play('success');
      clearLevel('card-hunt');
      feedback.innerHTML = `
        <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:4px; border:1px solid var(--club); margin-top:1rem;">
          <strong>✓ LEVEL 02 CLEARED! COORDINATES VERIFIED!</strong><br>
          You have recovered the Four Suit Route Pack.<br>
          <strong>Level 03: ♦ Diamonds (Physical Trial) is now unlocked!</strong>
          <div style="margin-top:0.75rem;">
            <a href="#/diamonds" class="cyber-btn" style="background:var(--diamond); color:#000;" data-nav>ADVANCE TO LEVEL 03 (♦ DIAMONDS) ↗</a>
          </div>
        </div>
      `;
    } else {
      audio.play('error');
      feedback.innerHTML = `<span style="color:var(--heart);">${result.error || 'Station cipher incorrect.'}</span>`;
    }
  });
}

// --------------------------------------------------------------------------
// VIEW: 03. TRIAL ♦ DIAMONDS (PHYSICAL ROUND)
// --------------------------------------------------------------------------
function renderDiamondsView() {
  pageRoot.innerHTML = `
    <div class="view-page">
      <header class="page-header">
        <p class="page-eyebrow" style="color:var(--diamond);">LEVEL 03 · PHYSICAL ROUND</p>
        <h1 class="page-title">THE EXIT<br><span style="color:var(--diamond);">CODE.</span></h1>
        <p class="page-desc">
          This round is conducted entirely physically on-site at the venue. All challenge cards, operators, clues, and instructions are provided directly by station leads. No clues or instructions are displayed on the website.
        </p>
      </header>

      ${renderProgressHeader('diamonds')}

      <div style="max-width:720px; margin:0 auto;">
        <div class="challenge-card" style="border-color:var(--diamond); text-align:center;">
          <div class="challenge-top">
            <span>♦ DIAMONDS TRIAL</span>
            <span style="color:var(--diamond); font-weight:700;">100% PHYSICAL VENUE ROUND</span>
          </div>

          <div class="physical-round-emblem" style="background:rgba(56, 189, 248, 0.15); border:2px solid var(--diamond); color:var(--diamond);">
            ♦
          </div>

          <h2 style="font-family:var(--display); font-size:1.6rem; color:#fff; margin-bottom:0.75rem;">
            PHYSICAL TRIAL IN PROGRESS
          </h2>

          <p style="font-size:0.95rem; color:var(--text-muted); line-height:1.6; max-width:540px; margin:0 auto 1.5rem auto;">
            Report to the Diamonds Station lead at the physical arena to receive your physical challenge pack. Work with your crew on-site to solve the challenge.
          </p>

          <div style="background:rgba(0,0,0,0.4); border:1px solid var(--border-subtle); border-radius:6px; padding:1rem; margin-bottom:1.75rem; font-family:var(--mono); font-size:0.8rem; color:var(--text-dim);">
            NO WEBSITE CLUES OR PUZZLES · CONDUCTED OFFLINE AT VENUE
          </div>

          <button type="button" class="cyber-btn" id="btnConfirmDiamonds" style="background:var(--diamond); color:#000; padding:0.85rem 1.8rem; font-size:0.95rem;">
            CONFIRM PHYSICAL TRIAL COMPLETED ↗
          </button>

          <div id="diamondFeedback" style="font-family:var(--mono); font-size:0.9rem; margin-top:1.5rem;"></div>
        </div>
      </div>
    </div>
  `;

  document.querySelector('#btnConfirmDiamonds')?.addEventListener('click', async () => {
    const btn = document.querySelector('#btnConfirmDiamonds');
    const feedback = document.querySelector('#diamondFeedback');
    btn.disabled = true;
    btn.textContent = 'VERIFYING COMPLETION…';
    audio.play('click');

    const result = await verifyAnswerWithServer('diamonds');
    if (result.ok) {
      audio.play('success');
      clearLevel('diamonds');
      await awardBadge('diamonds');
      feedback.innerHTML = `
        <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:6px; border:1px solid var(--club);">
          <strong>✓ LEVEL 03 CLEARED! ♦ DIAMOND SIGNAL EARNED!</strong><br>
          Physical round completion confirmed on server.<br>
          <strong>Level 04: ♥ Hearts Trial is now unlocked!</strong>
          <div style="margin-top:0.85rem;">
            <a href="#/hearts" class="cyber-btn" style="background:var(--heart); color:#fff;" data-nav>ADVANCE TO LEVEL 04 (♥ HEARTS) ↗</a>
          </div>
        </div>
      `;
    } else {
      audio.play('error');
      feedback.innerHTML = `<span style="color:var(--heart);">${result.error || 'Failed to verify round completion.'}</span>`;
      btn.disabled = false;
      btn.textContent = 'CONFIRM PHYSICAL TRIAL COMPLETED ↗';
    }
  });
}

// --------------------------------------------------------------------------
// VIEW: 04. TRIAL ♥ HEARTS (PHYSICAL ROUND)
// --------------------------------------------------------------------------
function renderHeartsView() {
  pageRoot.innerHTML = `
    <div class="view-page">
      <header class="page-header">
        <p class="page-eyebrow" style="color:var(--heart);">LEVEL 04 · PHYSICAL ROUND</p>
        <h1 class="page-title">THE HUMAN<br><span style="color:var(--heart);">CHAIN.</span></h1>
        <p class="page-desc">
          This round is conducted entirely physically on-site at the venue. All teammate envelopes, clues, and instructions are distributed directly by station coordinators. No clues or instructions are displayed on the website.
        </p>
      </header>

      ${renderProgressHeader('hearts')}

      <div style="max-width:720px; margin:0 auto;">
        <div class="challenge-card" style="border-color:var(--heart); text-align:center;">
          <div class="challenge-top">
            <span>♥ HEARTS TRIAL</span>
            <span style="color:var(--heart); font-weight:700;">100% PHYSICAL VENUE ROUND</span>
          </div>

          <div class="physical-round-emblem" style="background:rgba(239, 68, 68, 0.15); border:2px solid var(--heart); color:var(--heart);">
            ♥
          </div>

          <h2 style="font-family:var(--display); font-size:1.6rem; color:#fff; margin-bottom:0.75rem;">
            PHYSICAL TRIAL IN PROGRESS
          </h2>

          <p style="font-size:0.95rem; color:var(--text-muted); line-height:1.6; max-width:540px; margin:0 auto 1.5rem auto;">
            Report to the Hearts Station lead to receive your sealed physical teammate envelopes. Work together offline with your crew to verify the human trust chain.
          </p>

          <div style="background:rgba(0,0,0,0.4); border:1px solid var(--border-subtle); border-radius:6px; padding:1rem; margin-bottom:1.75rem; font-family:var(--mono); font-size:0.8rem; color:var(--text-dim);">
            NO WEBSITE CLUES OR PUZZLES · CONDUCTED OFFLINE AT VENUE
          </div>

          <button type="button" class="cyber-btn" id="btnConfirmHearts" style="background:var(--heart); color:#fff; padding:0.85rem 1.8rem; font-size:0.95rem;">
            CONFIRM PHYSICAL TRIAL COMPLETED ↗
          </button>

          <div id="heartFeedback" style="font-family:var(--mono); font-size:0.9rem; margin-top:1.5rem;"></div>
        </div>
      </div>
    </div>
  `;

  document.querySelector('#btnConfirmHearts')?.addEventListener('click', async () => {
    const btn = document.querySelector('#btnConfirmHearts');
    const feedback = document.querySelector('#heartFeedback');
    btn.disabled = true;
    btn.textContent = 'VERIFYING COMPLETION…';
    audio.play('click');

    const result = await verifyAnswerWithServer('hearts');
    if (result.ok) {
      audio.play('success');
      clearLevel('hearts');
      await awardBadge('hearts');
      feedback.innerHTML = `
        <div style="color:var(--club); background:rgba(80,250,158,0.1); padding:1rem; border-radius:6px; border:1px solid var(--club);">
          <strong>✓ LEVEL 04 CLEARED! ♥ HEART SIGNAL EARNED!</strong><br>
          Physical round completion confirmed on server.<br>
          <strong>Level 05: ♠ Spades Trial is now unlocked!</strong>
          <div style="margin-top:0.85rem;">
            <a href="#/spades" class="cyber-btn" style="background:var(--spade); color:#000;" data-nav>ADVANCE TO LEVEL 05 (♠ SPADES) ↗</a>
          </div>
        </div>
      `;
    } else {
      audio.play('error');
      feedback.innerHTML = `<span style="color:var(--heart);">${result.error || 'Failed to verify round completion.'}</span>`;
      btn.disabled = false;
      btn.textContent = 'CONFIRM PHYSICAL TRIAL COMPLETED ↗';
    }
  });
}

// --------------------------------------------------------------------------
// VIEW: 05. TRIAL ♠ SPADES (THE FIELD SIGNAL - CAMPUS WAYPOINTS)
// --------------------------------------------------------------------------
const spadeCheckpoints = [
  {
    step: 'CHECKPOINT 01 · WAYPOINT RIDDLE',
    location: 'Reception Area',
    prompt: 'I welcome those who arrive and point the lost in the right direction. Where am I?',
    keyAward: 'P'
  },
  {
    step: 'CHECKPOINT 02 · TECHNICAL RIDDLE',
    location: 'Sports Achievements Area',
    prompt: 'I am the evidence of a mistake. Read me and the problem reveals itself. What am I?',
    keyAward: 'S'
  },
  {
    step: 'CHECKPOINT 03 · THE STATUES',
    location: 'Three Statues',
    prompt: 'Silent while thousands pass. Outside, never moving, while everyone moves around them. Name the landmark.',
    keyAward: 'A'
  },
  {
    step: 'SYSTEM MESSAGE · ALPHABETICAL SCRAMBLE',
    location: 'Central Control',
    prompt: 'THE CODE IS NOT THE ANSWER. Put CODE in alphabetical order (C-D-E-O), then enter the original 1-based positions of those letters.',
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
          <p class="page-eyebrow" style="color:var(--spade);">LEVEL 05 · PHYSICAL & PRACTICAL</p>
          <h1 class="page-title">THE FIELD<br><span style="color:var(--spade);">SIGNAL.</span></h1>
          <p class="page-desc">
            Move through real-world campus waypoints, crack the technical field riddles, recover all 5 letter keys, and assemble the master word to unlock Level 06 (♣ Clubs).
          </p>
        </header>

        ${renderProgressHeader('spades')}

        <!-- Key Strip -->
        <div style="display:flex; gap:0.75rem; justify-content:center; margin-bottom:2rem;">
          ${['S', 'P', 'A', 'D', 'E'].map(k => `
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
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const val = document.querySelector('#spadeInput').value.trim();
      const feedback = document.querySelector('#spadeFeedback');
      feedback.innerHTML = '<span style="color:var(--text-dim);">Verifying waypoint signal...</span>';

      const result = await verifyAnswerWithServer('spades-step', { stepIdx, answer: val });

      if (result.ok) {
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
        feedback.innerHTML = `<span style="color:var(--heart);">${result.error || 'Incorrect waypoint signal. Verify landmark clues.'}</span>`;
      }
    });

    const masterForm = document.querySelector('#spadeMasterForm');
    masterForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const word = document.querySelector('#masterWordInput').value.trim().toUpperCase();
      const feedback = document.querySelector('#masterFeedback');
      feedback.innerHTML = '<span style="color:var(--text-dim);">Decrypting master word...</span>';

      const result = await verifyAnswerWithServer('spades-master', { word });

      if (result.ok) {
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
        feedback.innerHTML = `<span style="color:var(--heart);">${result.error || 'Incorrect master word. Combine keys P, S, A, D, E.'}</span>`;
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
        <p class="page-eyebrow" style="color:var(--club);">LEVEL 06 · 100% WEBSITE-DRIVEN TRIAL</p>
        <h1 class="page-title">THE WAR<br><span style="color:var(--club);">ROOM.</span></h1>
        <p class="page-desc">
          This round is completely website-driven. Your crew operates the digital command relay directly on this portal. Synchronize transmission order, calibrate frequency balance, and execute the verified response protocol to unlock Level 07 (🃏 The Final Paradox).
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
            ${[1, 2, 3, 4].map(slot => `
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
  orderForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(orderForm);
    const order = [fd.get('c1'), fd.get('c2'), fd.get('c3'), fd.get('c4')].join('|');
    const feedback = document.querySelector('#clubsOrderFeedback');
    feedback.innerHTML = '<span style="color:var(--text-dim);">Verifying sequence with relay tower...</span>';

    const result = await verifyAnswerWithServer('clubs-order', { order });

    if (result.ok) {
      audio.play('success');
      relayLocked = true;
      feedback.innerHTML = `<span style="color:var(--club);">✓ Sequence verified: SCAN ➔ BRIEF ➔ RELAY ➔ EXECUTE. Now calibrate frequency & transmit protocol.</span>`;
    } else {
      audio.play('error');
      feedback.innerHTML = `<span style="color:var(--heart);">${result.error || 'Sequence conflict. Re-read the 3 relay rules.'}</span>`;
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

    feedback.innerHTML = '<span style="color:var(--text-dim);">Transmitting harmonic pulse to war room...</span>';
    const result = await verifyAnswerWithServer('clubs-signal', {
      freq: Number(slider.value),
      tactical: fd.get('tactical')
    });

    if (result.ok) {
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
      feedback.innerHTML = `<span style="color:var(--heart);">${result.error || 'Protocol rejected.'}</span>`;
    }
  });
}

// --------------------------------------------------------------------------
// VIEW: 07. TRIAL 🃏 FINAL PARADOX (THE JOKER - TWO-PART FINALE)
// --------------------------------------------------------------------------
const floor20Route = [
  // Defined safe path from (0,0) down to (19,19)
  0, 20, 40, 41, 42, 62, 82, 83, 103, 123, 124, 125, 145, 165, 185,
  186, 206, 226, 246, 247, 267, 287, 307, 327, 347, 367, 368, 388, 398, 399
];

function renderJokerView() {
  function renderPart1Web() {
    let visitedCells = [];
    let previewing = true;
    let previewTime = 10;

    pageRoot.innerHTML = `
      <div class="view-page">
        <header class="page-header">
          <p class="page-eyebrow" style="color:var(--joker);">LEVEL 07 · TWO-PART FINALE (PART 1 OF 2)</p>
          <h1 class="page-title">FINAL<br><span style="color:var(--joker);">PARADOX.</span></h1>
          <p class="page-desc">
            This round has two parts: The first half is website-driven right here on the portal. Memorize the golden route and conquer the 20 × 20 floor grid to unlock the second half (Physical Arena Finale).
          </p>
        </header>

        ${renderProgressHeader('joker')}

        <!-- Structure Tracker Bar -->
        <div class="joker-phase-tracker">
          <div class="phase-step active">
            <span class="step-num">PART 01</span>
            <span class="step-title">FIRST HALF: WEBSITE-DRIVEN</span>
            <span class="step-badge">ACTIVE · 20×20 FLOOR GRID</span>
          </div>
          <div class="phase-arrow">➔</div>
          <div class="phase-step locked">
            <span class="step-num">PART 02</span>
            <span class="step-title">SECOND HALF: PHYSICAL</span>
            <span class="step-badge">🔒 LOCKED UNTIL PART 1 COMPLETE</span>
          </div>
        </div>

        <div class="challenge-card" style="border-color:var(--joker);">
          <div class="challenge-top">
            <span>PART 1 · 20 × 20 DIGITAL ARENA FLOOR MATRIX</span>
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
              <strong>✓ FIRST HALF (WEBSITE-DRIVEN) CONQUERED!</strong><br>
              20 × 20 Floor Grid cleared. The website-driven half is complete!<br>
              <strong>Proceed to Part 2: The Physical Arena Finale.</strong>
              <div style="margin-top:0.75rem;">
                <button type="button" class="cyber-btn" id="btnNextPhase" style="background:var(--joker); color:#000;">ADVANCE TO SECOND HALF (PHYSICAL FINALE) ➔</button>
              </div>
            </div>
          `;
          document.querySelector('#btnNextPhase')?.addEventListener('click', () => {
            renderPart2Physical();
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

  function renderPart2Physical() {
    pageRoot.innerHTML = `
      <div class="view-page">
        <header class="page-header">
          <p class="page-eyebrow" style="color:var(--joker);">LEVEL 07 · TWO-PART FINALE (PART 2 OF 2)</p>
          <h1 class="page-title">THE PHYSICAL<br><span style="color:var(--joker);">FINALE.</span></h1>
          <p class="page-desc">
            The second half of the Joker round is conducted physically on-site across the venue. Report to the Joker Station lead in the main arena to execute your physical finale tasks.
          </p>
        </header>

        ${renderProgressHeader('joker')}

        <!-- Structure Tracker Bar -->
        <div class="joker-phase-tracker">
          <div class="phase-step completed">
            <span class="step-num">PART 01</span>
            <span class="step-title">FIRST HALF: WEBSITE-DRIVEN</span>
            <span class="step-badge">✓ CLEARED · 20×20 GRID COMPLETE</span>
          </div>
          <div class="phase-arrow">➔</div>
          <div class="phase-step active">
            <span class="step-num">PART 02</span>
            <span class="step-title">SECOND HALF: PHYSICAL</span>
            <span class="step-badge">ACTIVE · ARENA FINALE</span>
          </div>
        </div>

        <div class="challenge-card" style="border-color:var(--joker); max-width:760px; margin:0 auto; text-align:center;">
          <div class="challenge-top">
            <span>PART 2 · PHYSICAL FINALE ROUND</span>
            <span style="color:var(--joker); font-weight:700;">ON-SITE VENUE CLEARANCE</span>
          </div>

          <div class="physical-round-emblem" style="background:rgba(245, 158, 11, 0.15); border:2px solid var(--joker); color:var(--joker);">
            🃏
          </div>

          <h2 style="font-family:var(--display); font-size:1.6rem; color:#fff; margin-bottom:0.75rem;">
            ON-SITE PHYSICAL FINALE DIRECTIVE
          </h2>

          <p style="font-size:0.95rem; color:var(--text-muted); line-height:1.6; max-width:580px; margin:0 auto 1.5rem auto;">
            Report to the physical arena to meet the Grand Station Lead. Complete the physical finale tasks at the campus checkpoints. Once completed, enter your physical clearance code provided by the coordinator below to conclude the Borderland Trail.
          </p>

          <form id="finalJokerForm" style="display:flex; flex-direction:column; gap:1rem; max-width:440px; margin:0 auto;">
            <label style="font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); text-align:center;">
              ENTER PHYSICAL CLEARANCE CODE (FROM STATION LEAD)
            </label>
            <div style="display:flex; gap:0.5rem;">
              <input class="cyber-input" id="finalCodeInput" placeholder="Enter code (e.g. 1536)..." required style="font-size:1.15rem; font-weight:700; text-align:center;" autocomplete="off" />
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
      feedback.innerHTML = '<span style="color:var(--text-dim);">Authenticating physical clearance on server...</span>';

      const result = await verifyAnswerWithServer('joker-final', { code });

      if (result.ok) {
        audio.play('success');
        clearLevel('joker');
        await awardBadge('joker');
        feedback.innerHTML = `
          <div style="background:rgba(255,194,51,0.12); border:1px solid var(--joker); border-radius:8px; padding:2rem; margin-top:1.5rem; text-align:center;">
            <div style="font-size:3.5rem;">👑 🃏 🏆</div>
            <h2 style="font-family:var(--display); font-size:2rem; color:var(--joker); margin:0.5rem 0;">PARADOX CONQUERED!</h2>
            <p style="font-size:1rem; color:var(--text-main); margin-bottom:1.5rem;">
              All Seven Levels, All Four Suits (♦ ♥ ♠ ♣), and The Joker (🃏) have been conquered. Both halves (Website-driven & Physical) are complete! Your crew <strong>${currentTeam}</strong> has cleared the NISB Multi-Round Challenge!
            </p>
            <a href="#/leaderboard" class="cyber-btn" style="background:var(--acid); color:#000;" data-nav>
              VIEW LIVE LEADERBOARD STANDINGS ↗
            </a>
          </div>
        `;
      } else {
        audio.play('error');
        feedback.innerHTML = `<span style="color:var(--heart);">${result.error || 'Invalid clearance code. Check with arena coordinator.'}</span>`;
      }
    });
  }

  renderPart1Web();
}

// --------------------------------------------------------------------------
// VIEW: 08. LEADERBOARD & COORDINATOR HUB (MONGODB ATLAS REAL-TIME SYNC)
// --------------------------------------------------------------------------
async function renderLeaderboardView() {
  const cleared = getClearedLevels();

  pageRoot.innerHTML = `
    <div class="view-page">
      <header class="page-header">
        <p class="page-eyebrow">LIVE CREW RANKINGS · MONGODB ATLAS</p>
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
            <strong style="color:var(--acid);">👥 Team Formation:</strong>
            <div>Clues distributed physically at venue · Register 5 crew members on website</div>
          </div>
          <div>
            <strong style="color:var(--diamond);">♦ Diamonds (Physical):</strong>
            <div>Conducted entirely physically on-site at venue · No web clues/instructions</div>
          </div>
          <div>
            <strong style="color:var(--heart);">♥ Hearts (Physical):</strong>
            <div>Conducted entirely physically on-site at venue · No web clues/instructions</div>
          </div>
          <div>
            <strong style="color:var(--spade);">♠ Spades:</strong>
            <div>Reception (P) | Trophy (S) | Statues (A) | CODE unscramble (D, E) ➔ SPADE</div>
          </div>
          <div>
            <strong style="color:var(--club);">♣ Clubs (100% Website-Driven):</strong>
            <div>SCAN ➔ BRIEF ➔ RELAY ➔ EXECUTE | Frequency: 72 MHz | Signal: Verify then relay ➔ CLUB</div>
          </div>
          <div>
            <strong style="color:var(--joker);">🃏 Joker (Two-Part Finale):</strong>
            <div>Part 1: Website-Driven (20×20 Floor Grid) | Part 2: Physical Arena (Code: 1536)</div>
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
      const text = await res.text();
      let teams = [];
      try {
        teams = JSON.parse(text);
      } catch {
        container.innerHTML = `<p style="color:var(--heart); font-family:var(--mono);">Could not parse standings response from server (${res.status}).</p>`;
        return;
      }

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
