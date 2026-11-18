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

const teamsFile = join(root, 'data', 'teams.json');
let dummyTeams = JSON.parse(await readFile(teamsFile, 'utf8'));

// Dynamically read questions on demand so changes to questions.json reflect immediately
async function getQuestions() {
  try {
    return JSON.parse(await readFile(join(root, 'data', 'questions.json'), 'utf8'));
  } catch (err) {
    console.error('Failed to read questions.json:', err.message);
    return [];
  }
}

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
    const teamsCol = db.collection('teams');
    if ((await teamsCol.countDocuments()) === 0 && dummyTeams.length > 0) {
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

async function getTeams() {
  if (db) return db.collection('teams').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return dummyTeams;
}

async function findOrCreateTeam(name) {
  const cleanName = String(name || '').trim();
  if (!cleanName) return null;
  
  if (db) {
    let t = await db.collection('teams').findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
    if (!t) {
      t = {
        id: `team-${Date.now()}`,
        name: cleanName,
        endpoint1Questions: [],
        endpoint1Solved: [],
        endpoint1Completed: false,
        gridCheckpoint: 0,
        gridCompleted: false,
        createdAt: new Date().toISOString()
      };
      await db.collection('teams').insertOne(t);
    }
    return t;
  } else {
    let t = dummyTeams.find(item => item.name && item.name.toLowerCase() === cleanName.toLowerCase());
    if (!t) {
      t = {
        id: `team-${Date.now()}`,
        name: cleanName,
        endpoint1Questions: [],
        endpoint1Solved: [],
        endpoint1Completed: false,
        gridCheckpoint: 0,
        gridCompleted: false,
        createdAt: new Date().toISOString()
      };
      dummyTeams.unshift(t);
      await writeFile(teamsFile, `${JSON.stringify(dummyTeams, null, 2)}\n`, 'utf8');
    }
    return t;
  }
}

async function updateTeam(team) {
  const { _id, ...cleanTeam } = team;
  if (db) {
    await db.collection('teams').updateOne({ name: team.name }, { $set: cleanTeam }, { upsert: true });
  } else {
    const idx = dummyTeams.findIndex(t => t.name.toLowerCase() === team.name.toLowerCase());
    if (idx >= 0) dummyTeams[idx] = team;
    else dummyTeams.unshift(team);
    await writeFile(teamsFile, `${JSON.stringify(dummyTeams, null, 2)}\n`, 'utf8');
  }
}

// Randomly pick 2 distinct question IDs from 1 to 20
function pickTwoRandomQuestions(totalQuestions = 20) {
  const q1 = Math.floor(Math.random() * totalQuestions) + 1;
  let q2 = Math.floor(Math.random() * totalQuestions) + 1;
  while (q2 === q1) {
    q2 = Math.floor(Math.random() * totalQuestions) + 1;
  }
  return [q1, q2];
}

// Answer normalizer & verifier
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

function verifyAnswer(q, input) {
  const normInput = normalizeAnswer(input);
  if (!normInput) return false;
  const accepted = q.answers.map(a => normalizeAnswer(a));
  
  if (accepted.includes(normInput)) return true;
  
  // Specific question heuristics for reasonable user inputs
  if (q.id === 6) { // Router dilemma: accept "6" or route containing "a-c-e-f"
    if (normInput.includes('6') || normInput.includes('a-c-e-f')) return true;
  }
  if (q.id === 7) { // Expiring packet: accept "3" or "yes" or "ttl 3"
    if (normInput === '3' || normInput.includes('ttl 3') || (normInput.includes('yes') && normInput.includes('3'))) return true;
  }
  if (q.id === 13) { // Deadlock: accept order containing p2, p3
    if (normInput.includes('p2') && normInput.includes('p3')) return true;
  }
  if (q.id === 16) { // AI Classification: accept moderate or 55
    if (normInput.includes('moderate') && (normInput.includes('55') || normInput.length < 15)) return true;
  }
  if (q.id === 19) { // Robot: coordinate (4,1) and east
    if (normInput.includes('4,1') && normInput.includes('east')) return true;
    if (normInput.includes('4,1') && normInput.includes('e')) return true;
  }
  
  return false;
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2'
};

function json(res, code, body) {
  res.writeHead(code, {
    'Content-Type': types['.json'],
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(body));
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Favicon handler to prevent 404 logs in browsers
  if (url.pathname === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }

  // Health check
  if (url.pathname === '/api/health') {
    const questions = await getQuestions();
    return json(res, 200, {
      ok: true,
      storage: db ? 'mongodb-atlas' : 'local-json-db',
      database: dbName,
      questionsLoaded: questions.length
    });
  }

  // Get teams
  if (url.pathname === '/api/teams' && req.method === 'GET') {
    return json(res, 200, await getTeams());
  }

  // Register / Find team
  if (url.pathname === '/api/teams' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      const body = JSON.parse(raw);
      const name = String(body.name || '').trim();
      if (!name) return json(res, 400, { error: 'Team name is required.' });
      const team = await findOrCreateTeam(name);
      return json(res, 200, { ok: true, team });
    } catch {
      return json(res, 400, { error: 'Invalid JSON body.' });
    }
  }

  // =========================================================================
  // ENDPOINT 1: TECHNICAL PUZZLE ARENA
  // =========================================================================
  
  // Endpoint 1 - Session Init (Pick 2 random questions for each login)
  if (url.pathname === '/api/endpoint1/session' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      const body = JSON.parse(raw);
      const teamName = String(body.teamName || '').trim();
      if (!teamName) return json(res, 400, { error: 'Team name is required.' });

      const team = await findOrCreateTeam(teamName);
      const questions = await getQuestions();

      // If team doesn't have 2 questions assigned, pick 2 random ones
      if (!Array.isArray(team.endpoint1Questions) || team.endpoint1Questions.length < 2) {
        team.endpoint1Questions = pickTwoRandomQuestions(questions.length);
        team.endpoint1Solved = team.endpoint1Solved || [];
        await updateTeam(team);
      }

      // Return question data WITHOUT solutions/expected answers
      const assignedQuestions = team.endpoint1Questions.map(id => {
        const q = questions.find(item => item.id === id);
        return {
          id: q.id,
          title: q.title,
          prompt: q.prompt,
          code: q.code,
          summary: q.summary
        };
      });

      return json(res, 200, {
        ok: true,
        teamName: team.name,
        questions: assignedQuestions,
        solvedIds: team.endpoint1Solved || [],
        completed: !!team.endpoint1Completed
      });
    } catch (err) {
      return json(res, 400, { error: 'Failed to initialize session: ' + err.message });
    }
  }

  // Endpoint 1 - Reset questions for a new attempt if team wishes
  if (url.pathname === '/api/endpoint1/reroll' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      const body = JSON.parse(raw);
      const teamName = String(body.teamName || '').trim();
      if (!teamName) return json(res, 400, { error: 'Team name is required.' });

      const team = await findOrCreateTeam(teamName);
      const questions = await getQuestions();
      team.endpoint1Questions = pickTwoRandomQuestions(questions.length);
      team.endpoint1Solved = [];
      team.endpoint1Completed = false;
      await updateTeam(team);

      const assignedQuestions = team.endpoint1Questions.map(id => {
        const q = questions.find(item => item.id === id);
        return {
          id: q.id,
          title: q.title,
          prompt: q.prompt,
          code: q.code,
          summary: q.summary
        };
      });

      return json(res, 200, {
        ok: true,
        teamName: team.name,
        questions: assignedQuestions,
        solvedIds: [],
        completed: false
      });
    } catch (err) {
      return json(res, 400, { error: 'Failed to re-roll questions.' });
    }
  }

  // Endpoint 1 - Verify Answer (Secure Server-Side Verification)
  if (url.pathname === '/api/endpoint1/verify' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      const body = JSON.parse(raw);
      const teamName = String(body.teamName || '').trim();
      const questionId = Number(body.questionId);
      const answer = String(body.answer || '').trim();

      if (!teamName || !questionId) {
        return json(res, 400, { error: 'Team name and question ID required.' });
      }

      const team = await findOrCreateTeam(teamName);
      const questions = await getQuestions();
      const q = questions.find(item => item.id === questionId);
      if (!q) return json(res, 404, { error: 'Question not found.' });

      const isCorrect = verifyAnswer(q, answer);

      if (isCorrect) {
        team.endpoint1Solved = Array.from(new Set([...(team.endpoint1Solved || []), questionId]));
        
        // Check if both assigned questions are now solved
        const allSolved = (team.endpoint1Questions || []).every(id => team.endpoint1Solved.includes(id));
        if (allSolved) {
          team.endpoint1Completed = true;
          team.completedAt = new Date().toISOString();
        }
        await updateTeam(team);

        return json(res, 200, {
          ok: true,
          correct: true,
          message: '✓ VERIFIED: Accurate computation. Protocol accepted.',
          questionId,
          solvedIds: team.endpoint1Solved,
          allSolved
        });
      } else {
        return json(res, 200, {
          ok: true,
          correct: false,
          error: '✗ MISMATCH: The reported result does not match the processor/protocol rules. Recheck the manual and recalculate.',
          questionId
        });
      }
    } catch (err) {
      return json(res, 400, { error: 'Malformed verification payload.' });
    }
  }

  // =========================================================================
  // ENDPOINT 2: DIGITAL MEMORY GRID ARENA
  // =========================================================================

  // Endpoint 2 - Session Init
  if (url.pathname === '/api/endpoint2/session' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      const body = JSON.parse(raw);
      const teamName = String(body.teamName || '').trim();
      if (!teamName) return json(res, 400, { error: 'Team name is required.' });

      const team = await findOrCreateTeam(teamName);

      return json(res, 200, {
        ok: true,
        teamName: team.name,
        checkpoint: team.gridCheckpoint || 0,
        completed: !!team.gridCompleted
      });
    } catch {
      return json(res, 400, { error: 'Malformed session request.' });
    }
  }

  // Endpoint 2 - Save Checkpoint Progress
  if (url.pathname === '/api/endpoint2/checkpoint' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      const body = JSON.parse(raw);
      const teamName = String(body.teamName || '').trim();
      const checkpoint = Number(body.checkpoint || 0);

      const team = await findOrCreateTeam(teamName);
      if (team) {
        team.gridCheckpoint = Math.max(team.gridCheckpoint || 0, checkpoint);
        await updateTeam(team);
      }
      return json(res, 200, { ok: true, checkpoint: team ? team.gridCheckpoint : checkpoint });
    } catch {
      return json(res, 400, { error: 'Malformed checkpoint request.' });
    }
  }

  // Endpoint 2 - Complete Floor Grid
  if (url.pathname === '/api/endpoint2/complete' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      const body = JSON.parse(raw);
      const teamName = String(body.teamName || '').trim();
      const timeElapsed = Number(body.timeElapsed || 0);
      const trapsCount = Number(body.trapsCount || 0);

      const team = await findOrCreateTeam(teamName);
      if (team) {
        team.gridCompleted = true;
        team.gridTimeElapsed = timeElapsed;
        team.gridTrapsCount = trapsCount;
        team.gridCompletedAt = new Date().toISOString();
        await updateTeam(team);
      }
      return json(res, 200, {
        ok: true,
        message: 'PARADOX CONQUERED! 20×20 Floor Grid cleared successfully.',
        teamName
      });
    } catch {
      return json(res, 400, { error: 'Malformed completion request.' });
    }
  }

  // Manual questions list for in-app reader
  if (url.pathname === '/api/manual' && req.method === 'GET') {
    const questions = await getQuestions();
    return json(res, 200, questions.map(q => ({
      id: q.id,
      title: q.title,
      prompt: q.prompt,
      code: q.code,
      summary: q.summary
    })));
  }

  // Static file serving with SPA fallback
  const safePath = normalize(url.pathname === '/' ? '/index.html' : url.pathname).replace(/^([.][.][/\\])+/, '');
  let file = join(root, 'public', safePath);

  if (!file.startsWith(join(root, 'public')) || !existsSync(file)) {
    // SPA fallback: return index.html for virtual routes
    if (!url.pathname.startsWith('/api/') && !extname(url.pathname)) {
      file = join(root, 'public', 'index.html');
    } else {
      return json(res, 404, { error: 'Not found' });
    }
  }

  res.writeHead(200, {
    'Content-Type': types[extname(file)] || 'application/octet-stream',
    'Cache-Control': extname(file) === '.pdf' ? 'public, max-age=3600' : 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': '*'
  });
  createReadStream(file).pipe(res);
}).listen(port, async () => {
  await connectMongo();
  console.log(`Borderland Trail Arena Server → http://localhost:${port}`);
});
