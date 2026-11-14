import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

// In-memory / Fallback Database Seed Data
const seedRounds = [
  { "id": 1, "title": "Formation", "slug": "formation", "subtitle": "Find Your People (Team Registration)", "suit": "♦", "order": 1 },
  { "id": 2, "title": "Card Hunt", "slug": "card-hunt", "subtitle": "Riddle & Station Cipher", "suit": "♠", "order": 2 },
  { "id": 3, "title": "Diamonds", "slug": "diamonds", "subtitle": "Physical Trial (On-Site)", "suit": "♦", "order": 3 },
  { "id": 4, "title": "Hearts", "slug": "hearts", "subtitle": "Physical Trial (On-Site)", "suit": "♥", "order": 4 },
  { "id": 5, "title": "Spades", "slug": "spades", "subtitle": "The Field Signal (Physical Waypoints)", "suit": "♠", "order": 5 },
  { "id": 6, "title": "Clubs", "slug": "clubs", "subtitle": "The War Room (100% Website-Driven)", "suit": "♣", "order": 6 },
  { "id": 7, "title": "The Joker", "slug": "joker", "subtitle": "Final Paradox (Part 1: Web / Part 2: Physical)", "suit": "🃏", "order": 7 }
];

let memoryTeams = [
  {
    "id": "team-001",
    "name": "The Wildcards",
    "captain": "Aarav Sharma",
    "members": ["Rohan Gupta", "Priya Verma", "Vikram Das", "Meera Iyer"],
    "contact": "wildcards@ieee.org",
    "badges": ["diamonds", "hearts", "spades", "clubs", "joker"],
    "totalSolved": 5,
    "createdAt": "2026-09-12T10:00:00.000Z",
    "status": "Paradox Conquered"
  },
  {
    "id": "team-002",
    "name": "Circuit Runners",
    "captain": "Tanya Rao",
    "members": ["Nikhil Jain", "Diya Sen", "Kabir Roy", "Ananya Paul"],
    "contact": "runners@ieee.org",
    "badges": ["diamonds", "hearts", "spades", "clubs"],
    "totalSolved": 4,
    "createdAt": "2026-09-12T10:30:00.000Z",
    "status": "Active"
  },
  {
    "id": "team-003",
    "name": "Paradox Shift",
    "captain": "Sameer Khan",
    "members": ["Pooja Nair", "Karan Singh", "Ishaan Roy", "Simran Gill"],
    "contact": "shift@ieee.org",
    "badges": ["diamonds", "hearts"],
    "totalSolved": 2,
    "createdAt": "2026-09-12T11:00:00.000Z",
    "status": "Active"
  }
];

// MongoDB Atlas Client (Cached for Serverless Re-use)
let cachedClient = null;
let cachedDb = null;

async function getDb() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'crazy-website';

  if (!mongoUri) return null;
  if (cachedDb) return cachedDb;

  try {
    const { MongoClient } = await import('mongodb');
    cachedClient = new MongoClient(mongoUri);
    await cachedClient.connect();
    cachedDb = cachedClient.db(dbName);

    // Ensure collections seeded
    const roundsCol = cachedDb.collection('rounds');
    for (const r of seedRounds) {
      await roundsCol.updateOne({ slug: r.slug }, { $set: r }, { upsert: true });
    }
    const teamsCol = cachedDb.collection('teams');
    if ((await teamsCol.countDocuments()) === 0 && memoryTeams.length > 0) {
      const clean = memoryTeams.map(({ _id, ...rest }) => rest);
      await teamsCol.insertMany(clean);
    }
    return cachedDb;
  } catch (err) {
    console.warn('Serverless Mongo Connection error, fallback to memory:', err.message);
    return null;
  }
}

async function getRounds() {
  const db = await getDb();
  if (db) return db.collection('rounds').find({}, { projection: { _id: 0 } }).toArray();
  return seedRounds;
}

async function getTeams() {
  const db = await getDb();
  if (db) return db.collection('teams').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return memoryTeams;
}

async function saveTeam(team) {
  const db = await getDb();
  if (db) {
    await db.collection('teams').insertOne({ ...team });
  } else {
    memoryTeams.unshift(team);
  }
}

async function updateProgress(teamName, badge, timeSeconds) {
  const db = await getDb();
  if (db) {
    await db.collection('teams').updateOne(
      { name: teamName },
      {
        $addToSet: { badges: badge },
        $set: { lastActive: new Date().toISOString() },
        $inc: { totalSolved: 1 }
      }
    );
  } else {
    const target = memoryTeams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
    if (target) {
      target.badges = Array.from(new Set([...(target.badges || []), badge]));
      target.lastActive = new Date().toISOString();
      target.totalSolved = target.badges.length;
    }
  }
}

const SECRETS = {
  'card-hunt': ['clock', 'tower', 'clocktower', 'glasscorridor', 'corridor', 'northtower', 'belltower', 'clock tower', 'north tower'],
  'diamonds': {
    'ORBIT': { answer: '11', clue: 'Clue Card 11 · Caesar cipher', reveal: 'The encrypted transmission points to NOVA.', next: 'NOVA', genuine: true },
    'NOVA': { answer: '34', clue: 'Clue Card 34 · Sequence cipher', reveal: '2, 6, 12, 20, 30… gives 42. Shift LUSJEH back 16 places to get VECTOR.', next: 'VECTOR', genuine: true },
    'VECTOR': { answer: '18', clue: 'Clue Card 18 · Rearrangement', reveal: 'U–2, E–5, P–1, S–4, L–3 resolves to PULSE.', next: 'PULSE', genuine: true },
    'PULSE': { answer: '27', clue: 'Clue Card 27 · Binary', reveal: '01000101 01000011 01001111 translates to ECHO.', next: 'ECHO', genuine: true },
    'ECHO': { answer: '45', clue: 'Clue Card 45 · Find me', reveal: 'A five-letter word: no A, middle letter I, first not a vowel: PRISM.', next: 'PRISM', genuine: true },
    'PRISM': { answer: '16', clue: 'Clue Card 16 · Final revelation', reveal: 'One of four suits. Its symbol is both a geometric shape and a playing-card suit: DIAMOND.', next: 'DIAMOND', genuine: true, final: true },
    'COSMOS': { answer: '34', genuine: false, reveal: 'Dead end: Signal dissolves into cosmic noise.' },
    'HELIOS': { answer: '36', genuine: false, reveal: 'Decoy alert: Solar frequency does not correlate with the suit.' },
    'SPECTRA': { answer: '25', genuine: false, reveal: 'Decoy: False spectrum detected.' },
    'VORTEX': { answer: '16', genuine: false, reveal: 'Decoy: Swallowed by anomaly.' },
    'MATRIX': { answer: '40', genuine: false, reveal: 'Decoy: Matrix parity error.' },
    'QUANTUM': { answer: '20', genuine: false, reveal: 'Decoy: State collapsed.' },
    'CIPHER': { answer: '10', genuine: false, reveal: 'Decoy: Key is invalid.' },
    'ZENITH': { answer: '56', genuine: false, reveal: 'Decoy: Elevation out of bounds.' },
    'RADAR': { answer: '16', genuine: false, reveal: 'Decoy: Ghost echo on sweep.' },
    'FUSION': { answer: '15', genuine: false, reveal: 'Decoy: Reaction destabilized.' },
    'HORIZON': { answer: '40', genuine: false, reveal: 'Decoy: Nothing beyond the curve.' },
    'QUARK': { answer: '30', genuine: false, reveal: 'Decoy: Charge unbalanced.' },
    'NEBULA': { answer: '42', genuine: false, reveal: 'Decoy: Obscured in cloud dust.' },
    'ECLIPSE': { answer: '27', genuine: false, reveal: 'Decoy: Total occultation.' },
    'APEX': { answer: '18', genuine: false, reveal: 'Decoy: Vector misalignment.' },
    'NEXUS': { answer: '24', genuine: false, reveal: 'Decoy: Loop terminated without suit output.' }
  },
  'hearts': {
    arrangement: [
      { p: 'Vikram', o: 'Key', g: 'Ruby', n: 8 },
      { p: 'Meera', o: 'Watch', g: 'Emerald', n: 5 },
      { p: 'Aarav', o: 'Ring', g: 'Pearl', n: 1 },
      { p: 'Diya', o: 'Coin', g: 'Sapphire', n: 18 },
      { p: 'Rohan', o: 'Locket', g: 'Topaz', n: 20 }
    ],
    trust: ['TRUE', 'TRUE', 'FALSE', 'TRUE', 'FALSE']
  },
  'spades': {
    steps: [
      ['reception', 'reception area', 'main desk', 'front desk'],
      ['error log', 'log', 'error message', 'logs'],
      ['three statues', 'statues', 'statue', 'the three statues'],
      ['1342', '1,3,4,2', '1-3-4-2', '1 3 4 2']
    ],
    master: 'SPADE'
  },
  'clubs': {
    order: 'SCAN|BRIEF|RELAY|EXECUTE',
    freq: 72,
    tactical: 'verify'
  },
  'joker': {
    story: { q1: 'yellow', q2: '15', q3: '3', q4: '6' },
    finalCode: '1536'
  }
};

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw); } catch { return {}; }
}

function sendJson(res, code, body) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // Health
  if (pathname === '/api/health' || pathname === '/api') {
    const db = await getDb();
    return sendJson(res, 200, {
      ok: true,
      storage: db ? 'mongodb-atlas' : 'serverless-memory',
      time: new Date().toISOString()
    });
  }

  // Rounds
  if (pathname === '/api/rounds' && req.method === 'GET') {
    return sendJson(res, 200, await getRounds());
  }
  if (pathname.startsWith('/api/rounds/') && req.method === 'GET') {
    const slug = pathname.split('/').pop();
    const item = (await getRounds()).find((r) => r.slug === slug);
    return item ? sendJson(res, 200, item) : sendJson(res, 404, { error: 'Round not found' });
  }

  // Teams
  if (pathname === '/api/teams' && req.method === 'GET') {
    return sendJson(res, 200, await getTeams());
  }
  if (pathname === '/api/teams' && req.method === 'POST') {
    const body = await parseBody(req);
    const name = String(body.name || '').trim();
    if (name.length < 2 || name.length > 40) {
      return sendJson(res, 422, { error: 'Team name must be 2–40 characters.' });
    }
    const captain = String(body.captain || '').trim();
    const members = Array.isArray(body.members)
      ? body.members.map(m => String(m || '').trim()).filter(Boolean)
      : [];
    const contact = String(body.contact || '').trim();

    const team = {
      id: `team-${Date.now()}`,
      name,
      captain: captain || 'Captain',
      members: members.length > 0 ? members : ['Member 1', 'Member 2', 'Member 3', 'Member 4'],
      contact,
      badges: [],
      totalSolved: 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    await saveTeam(team);
    return sendJson(res, 201, { ok: true, team });
  }

  // Verify Answers
  if (pathname === '/api/verify' && req.method === 'POST') {
    const body = await parseBody(req);
    const round = String(body.round || '').trim();
    const teamName = String(body.teamName || '').trim();

    // 1. CARD HUNT
    if (round === 'card-hunt') {
      const answer = String(body.answer || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
      const match = SECRETS['card-hunt'].some(v => v.replace(/[\s\-_]/g, '') === answer);
      if (match) {
        if (teamName) await updateProgress(teamName, 'card-hunt', Math.floor(Date.now() / 1000));
        return sendJson(res, 200, { ok: true, message: 'COORDINATES VERIFIED' });
      }
      return sendJson(res, 200, { ok: false, error: 'Station cipher incorrect.' });
    }

    // 2. DIAMONDS (Physical Round)
    if (round === 'diamonds') {
      if (teamName) await updateProgress(teamName, 'diamonds', Math.floor(Date.now() / 1000));
      return sendJson(res, 200, {
        ok: true,
        genuine: true,
        final: true,
        message: 'DIAMONDS PHYSICAL TRIAL CONFIRMED'
      });
    }

    // 3. HEARTS (Physical Round)
    if (round === 'hearts' || round === 'hearts-grid' || round === 'hearts-trust') {
      if (teamName) await updateProgress(teamName, 'hearts', Math.floor(Date.now() / 1000));
      return sendJson(res, 200, {
        ok: true,
        message: 'HEARTS PHYSICAL TRIAL CONFIRMED'
      });
    }

    // 4. SPADES STEP
    if (round === 'spades-step') {
      const stepIdx = Number(body.stepIdx);
      const answer = String(body.answer || '').trim().toLowerCase().replace(/[\s\-_,]/g, '');
      const expectedList = SECRETS['spades'].steps[stepIdx];
      if (expectedList && expectedList.some(exp => exp.replace(/[\s\-_,]/g, '') === answer)) {
        return sendJson(res, 200, { ok: true, message: 'Waypoint signal accepted.' });
      }
      return sendJson(res, 200, { ok: false, error: 'Incorrect waypoint signal. Verify landmark clues.' });
    }

    // 4B. SPADES MASTER WORD
    if (round === 'spades-master') {
      const word = String(body.word || '').trim().toUpperCase();
      if (word === SECRETS['spades'].master) {
        if (teamName) await updateProgress(teamName, 'spades', Math.floor(Date.now() / 1000));
        return sendJson(res, 200, { ok: true, message: 'SPADE SIGNAL EARNED' });
      }
      return sendJson(res, 200, { ok: false, error: 'Incorrect master word. Combine keys P, S, A, D, E.' });
    }

    // 5. CLUBS
    if (round === 'clubs-order') {
      const order = String(body.order || '').trim().toUpperCase();
      if (order === SECRETS['clubs'].order) {
        return sendJson(res, 200, { ok: true, message: 'Order verified.' });
      }
      return sendJson(res, 200, { ok: false, error: 'Sequence conflict. Re-read the 3 relay rules.' });
    }

    if (round === 'clubs-signal') {
      const freq = Number(body.freq);
      const tactical = String(body.tactical || '').trim().toLowerCase();
      if (freq !== SECRETS['clubs'].freq) {
        return sendJson(res, 200, { ok: false, error: `Harmonic tuner misaligned. Target is 72 MHz.` });
      }
      if (tactical !== SECRETS['clubs'].tactical) {
        return sendJson(res, 200, { ok: false, error: 'Protocol rejected. Accuracy must be protected under pressure.' });
      }
      if (teamName) await updateProgress(teamName, 'clubs', Math.floor(Date.now() / 1000));
      return sendJson(res, 200, { ok: true, message: 'CLUB SIGNAL EARNED' });
    }

    // 6. JOKER
    if (round === 'joker-story') {
      const { q1, q2, q3, q4 } = body;
      const s = SECRETS['joker'].story;
      if (
        String(q1 || '').trim().toLowerCase() === s.q1 &&
        String(q2 || '').trim() === s.q2 &&
        String(q3 || '').trim() === s.q3 &&
        String(q4 || '').trim() === s.q4
      ) {
        return sendJson(res, 200, { ok: true, message: 'Story recall verified.' });
      }
      return sendJson(res, 200, { ok: false, error: 'Memory discrepancy detected. Re-verify the details.' });
    }

    if (round === 'joker-final') {
      const code = String(body.code || '').trim();
      if (code === SECRETS['joker'].finalCode) {
        if (teamName) await updateProgress(teamName, 'joker', Math.floor(Date.now() / 1000));
        return sendJson(res, 200, { ok: true, message: 'PARADOX CONQUERED' });
      }
      return sendJson(res, 200, { ok: false, error: 'Invalid escape code. Verify notebook records.' });
    }

    return sendJson(res, 400, { ok: false, error: 'Unknown verification round.' });
  }

  // Progress
  if (pathname === '/api/progress' && req.method === 'POST') {
    const body = await parseBody(req);
    const teamName = String(body.teamName || '').trim();
    const suit = String(body.suit || '').trim();
    const timeSeconds = Number(body.timeSeconds || 0);

    if (!teamName || !suit) {
      return sendJson(res, 422, { error: 'teamName and suit are required.' });
    }
    await updateProgress(teamName, suit, timeSeconds);
    return sendJson(res, 200, { ok: true, teamName, suit });
  }

  // Leaderboard
  if (pathname === '/api/leaderboard' && req.method === 'GET') {
    const teams = await getTeams();
    const ranked = teams.map(t => ({
      name: t.name,
      captain: t.captain || 'Captain',
      badges: t.badges || [],
      totalSolved: (t.badges || []).length,
      status: (t.badges || []).length === 5 ? 'Paradox Conquered' : `${(t.badges || []).length}/5 Completed`,
      createdAt: t.createdAt
    })).sort((a, b) => b.totalSolved - a.totalSolved);
    return sendJson(res, 200, ranked);
  }

  return sendJson(res, 404, { error: 'API endpoint not found' });
}
