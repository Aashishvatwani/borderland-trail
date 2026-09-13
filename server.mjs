import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

// Load .env variables if present
try {
  const envContent = await readFile(join(root, '.env'), 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {}

const port = Number(process.env.PORT || 4173);
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'crazy-website';

const seed = JSON.parse(await readFile(join(root, 'data', 'rounds.json'), 'utf8'));
const teamsFile = join(root, 'data', 'teams.json');
let dummyTeams = JSON.parse(await readFile(teamsFile, 'utf8'));

let db = null;
let client = null;

async function connectMongo() {
  if (!mongoUri) {
    console.log('No MONGODB_URI provided. Running on local dummy JSON.');
    return;
  }
  try {
    const { MongoClient } = await import('mongodb');
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db(dbName);
    const roundsCol = db.collection('rounds');
    if ((await roundsCol.countDocuments()) === 0) {
      await roundsCol.insertMany(seed);
      console.log('Seeded rounds collection in MongoDB Atlas.');
    }
    const teamsCol = db.collection('teams');
    if ((await teamsCol.countDocuments()) === 0 && dummyTeams.length > 0) {
      // Strip any duplicate _ids if present
      const cleanTeams = dummyTeams.map(({ _id, ...rest }) => rest);
      await teamsCol.insertMany(cleanTeams);
      console.log('Seeded initial teams collection into MongoDB Atlas.');
    }
    console.log(`Connected to MongoDB Atlas: database "${dbName}"`);
  } catch (error) {
    console.warn(`MongoDB connection failed; running with local storage. ${error.message}`);
    db = null;
  }
}

async function getRounds() {
  if (db) return db.collection('rounds').find({}, { projection: { _id: 0 } }).toArray();
  return seed;
}

async function getTeams() {
  if (db) return db.collection('teams').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return dummyTeams;
}

async function saveTeam(team) {
  if (db) {
    await db.collection('teams').insertOne({ ...team });
  } else {
    dummyTeams.unshift(team);
    await writeFile(teamsFile, `${JSON.stringify(dummyTeams, null, 2)}\n`, 'utf8');
  }
}

async function updateProgress(teamName, badge, timeSeconds) {
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
    const target = dummyTeams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
    if (target) {
      target.badges = Array.from(new Set([...(target.badges || []), badge]));
      target.lastActive = new Date().toISOString();
      target.totalSolved = target.badges.length;
      await writeFile(teamsFile, `${JSON.stringify(dummyTeams, null, 2)}\n`, 'utf8');
    }
  }
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2'
};

function json(res, code, body) {
  res.writeHead(code, {
    'Content-Type': types['.json'],
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(body));
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Health check
  if (url.pathname === '/api/health') {
    return json(res, 200, {
      ok: true,
      storage: db ? 'mongodb-atlas' : 'dummy-json-db',
      database: dbName
    });
  }

  // Get rounds
  if (url.pathname === '/api/rounds' && req.method === 'GET') {
    return json(res, 200, await getRounds());
  }

  // Get specific round
  if (url.pathname.startsWith('/api/rounds/') && req.method === 'GET') {
    const slug = url.pathname.split('/').pop();
    const item = (await getRounds()).find((r) => r.slug === slug);
    return item ? json(res, 200, item) : json(res, 404, { error: 'Round not found' });
  }

  // Teams list
  if (url.pathname === '/api/teams' && req.method === 'GET') {
    return json(res, 200, await getTeams());
  }

  // Register team
  if (url.pathname === '/api/teams' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      const body = JSON.parse(raw);
      const name = String(body.name || '').trim();
      if (name.length < 2 || name.length > 40) {
        return json(res, 422, { error: 'Team name must be 2–40 characters.' });
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
      return json(res, 201, { ok: true, team });
    } catch {
      return json(res, 400, { error: 'Invalid JSON body.' });
    }
  }

  // ==========================================================================
  // SECURE ARENA ANSWER VERIFICATION (SERVER-SIDE ONLY - ZERO FRONTEND LEAKS)
  // ==========================================================================
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

  if (url.pathname === '/api/verify' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      const body = JSON.parse(raw);
      const round = String(body.round || '').trim();
      const teamName = String(body.teamName || '').trim();

      // 1. CARD HUNT
      if (round === 'card-hunt') {
        const answer = String(body.answer || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
        const match = SECRETS['card-hunt'].some(v => v.replace(/[\s\-_]/g, '') === answer);
        if (match) {
          if (teamName) await updateProgress(teamName, 'card-hunt', Math.floor(Date.now() / 1000));
          return json(res, 200, { ok: true, message: 'COORDINATES VERIFIED' });
        }
        return json(res, 200, { ok: false, error: 'Station cipher incorrect. Reread the riddle: "Where north meets the tower..."' });
      }

      // 2. DIAMONDS
      if (round === 'diamonds') {
        const cardKey = String(body.card || '').trim().toUpperCase();
        const inputAnswer = String(body.answer || '').trim();
        const cardSecret = SECRETS['diamonds'][cardKey];

        if (!cardSecret) {
          return json(res, 404, { ok: false, error: 'Unknown challenge card.' });
        }

        if (cardSecret.answer === inputAnswer) {
          if (cardSecret.final && teamName) {
            await updateProgress(teamName, 'diamonds', Math.floor(Date.now() / 1000));
          }
          return json(res, 200, {
            ok: true,
            genuine: cardSecret.genuine,
            reveal: cardSecret.reveal,
            clue: cardSecret.clue,
            next: cardSecret.next,
            final: Boolean(cardSecret.final)
          });
        }
        return json(res, 200, { ok: false, error: 'Incorrect calculation. Check operator precedence: ▲ (+) ● (×) ■ (-) ★ (÷)' });
      }

      // 3. HEARTS - GRID
      if (round === 'hearts-grid') {
        const { arrangement } = body;
        if (!Array.isArray(arrangement) || arrangement.length !== 5) {
          return json(res, 200, { ok: false, error: 'All 5 seats must be assigned.' });
        }

        const correctArr = SECRETS['hearts'].arrangement;
        const arrMatch = correctArr.every((expected, idx) => {
          const userSeat = arrangement[idx];
          return userSeat &&
            userSeat.p?.toLowerCase() === expected.p.toLowerCase() &&
            userSeat.o?.toLowerCase() === expected.o.toLowerCase() &&
            userSeat.g?.toLowerCase() === expected.g.toLowerCase();
        });

        if (!arrMatch) {
          return json(res, 200, { ok: false, error: 'Arrangement conflict. Check seat clues (e.g. Ruby+Locket=6, Topaz & Key at opposite ends).' });
        }

        return json(res, 200, { ok: true, message: 'Arrangement verified!' });
      }

      // 3B. HEARTS - TRUST CHECK
      if (round === 'hearts-trust') {
        const { answers } = body;
        const expected = SECRETS['hearts'].trust;
        if (!Array.isArray(answers) || answers.length !== expected.length) {
          return json(res, 200, { ok: false, error: 'All trust questions must be answered.' });
        }

        const passed = expected.every((val, idx) => String(answers[idx]).toUpperCase() === val);
        if (!passed) {
          return json(res, 200, { ok: false, error: 'Trust check failed. Recheck the statements against the 5-seat arrangement.' });
        }

        if (teamName) await updateProgress(teamName, 'hearts', Math.floor(Date.now() / 1000));
        return json(res, 200, { ok: true, message: 'HEART SIGNAL EARNED' });
      }

      // 4. SPADES - STEP
      if (round === 'spades-step') {
        const stepIdx = Number(body.stepIdx);
        const answer = String(body.answer || '').trim().toLowerCase().replace(/[\s\-_,]/g, '');
        const expectedList = SECRETS['spades'].steps[stepIdx];

        if (expectedList && expectedList.some(exp => exp.replace(/[\s\-_,]/g, '') === answer)) {
          return json(res, 200, { ok: true, message: 'Waypoint signal accepted.' });
        }
        return json(res, 200, { ok: false, error: 'Incorrect waypoint signal. Verify landmark clues.' });
      }

      // 4B. SPADES - MASTER WORD
      if (round === 'spades-master') {
        const word = String(body.word || '').trim().toUpperCase();
        if (word === SECRETS['spades'].master) {
          if (teamName) await updateProgress(teamName, 'spades', Math.floor(Date.now() / 1000));
          return json(res, 200, { ok: true, message: 'SPADE SIGNAL EARNED' });
        }
        return json(res, 200, { ok: false, error: 'Incorrect master word. Combine keys P, S, A, D, E.' });
      }

      // 5. CLUBS
      if (round === 'clubs-order') {
        const order = String(body.order || '').trim().toUpperCase();
        if (order === SECRETS['clubs'].order) {
          return json(res, 200, { ok: true, message: 'Order verified.' });
        }
        return json(res, 200, { ok: false, error: 'Sequence conflict. Re-read the 3 relay rules.' });
      }

      if (round === 'clubs-signal') {
        const freq = Number(body.freq);
        const tactical = String(body.tactical || '').trim().toLowerCase();

        if (freq !== SECRETS['clubs'].freq) {
          return json(res, 200, { ok: false, error: `Harmonic tuner misaligned. Target is 72 MHz (currently ${freq} MHz).` });
        }
        if (tactical !== SECRETS['clubs'].tactical) {
          return json(res, 200, { ok: false, error: 'Protocol rejected. Accuracy must be protected under pressure.' });
        }

        if (teamName) await updateProgress(teamName, 'clubs', Math.floor(Date.now() / 1000));
        return json(res, 200, { ok: true, message: 'CLUB SIGNAL EARNED' });
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
          return json(res, 200, { ok: true, message: 'Story recall verified.' });
        }
        return json(res, 200, { ok: false, error: 'Memory discrepancy detected. Re-verify the details.' });
      }

      if (round === 'joker-final') {
        const code = String(body.code || '').trim();
        if (code === SECRETS['joker'].finalCode) {
          if (teamName) await updateProgress(teamName, 'joker', Math.floor(Date.now() / 1000));
          return json(res, 200, { ok: true, message: 'PARADOX CONQUERED' });
        }
        return json(res, 200, { ok: false, error: 'Invalid escape code. Verify notebook records.' });
      }

      return json(res, 400, { ok: false, error: 'Unknown verification round.' });
    } catch {
      return json(res, 400, { ok: false, error: 'Malformed verification request.' });
    }
  }

  // Update trial progress / badge
  if (url.pathname === '/api/progress' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      const body = JSON.parse(raw);
      const teamName = String(body.teamName || '').trim();
      const suit = String(body.suit || '').trim();
      const timeSeconds = Number(body.timeSeconds || 0);

      if (!teamName || !suit) {
        return json(res, 422, { error: 'teamName and suit are required.' });
      }

      await updateProgress(teamName, suit, timeSeconds);
      return json(res, 200, { ok: true, teamName, suit });
    } catch {
      return json(res, 400, { error: 'Invalid JSON body.' });
    }
  }

  // Leaderboard data
  if (url.pathname === '/api/leaderboard' && req.method === 'GET') {
    const teams = await getTeams();
    const ranked = teams.map(t => ({
      name: t.name,
      captain: t.captain || 'Captain',
      badges: t.badges || [],
      totalSolved: (t.badges || []).length,
      status: (t.badges || []).length === 5 ? 'Paradox Conquered' : `${(t.badges || []).length}/5 Completed`,
      createdAt: t.createdAt
    })).sort((a, b) => b.totalSolved - a.totalSolved);
    return json(res, 200, ranked);
  }

  // Static file serving with SPA fallback
  const safePath = normalize(url.pathname === '/' ? '/index.html' : url.pathname).replace(/^([.][.][/\\])+/, '');
  let file = join(root, 'public', safePath);

  if (!file.startsWith(join(root, 'public')) || !existsSync(file)) {
    // If not an API route and not a static asset file with an extension, fallback to index.html for SPA routing
    if (!url.pathname.startsWith('/api/') && !extname(url.pathname)) {
      file = join(root, 'public', 'index.html');
    } else {
      return json(res, 404, { error: 'Not found' });
    }
  }

  res.writeHead(200, {
    'Content-Type': types[extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  createReadStream(file).pipe(res);
}).listen(port, async () => {
  await connectMongo();
  console.log(`Borderland Trail Arena → http://localhost:${port}`);
});
