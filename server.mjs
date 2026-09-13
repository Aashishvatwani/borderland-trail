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
