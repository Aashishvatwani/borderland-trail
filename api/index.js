import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));

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

let cachedQuestions = null;

async function getQuestions() {
  if (cachedQuestions && cachedQuestions.length > 0) return cachedQuestions;
  try {
    cachedQuestions = require('../data/questions.json');
    if (Array.isArray(cachedQuestions) && cachedQuestions.length > 0) return cachedQuestions;
  } catch {}

  try {
    const raw = await readFile(join(root, 'data', 'questions.json'), 'utf8');
    cachedQuestions = JSON.parse(raw);
    return cachedQuestions;
  } catch (err) {
    return [];
  }
}

let memoryTeams = [
  {
    "id": "team-001",
    "name": "The Wildcards",
    "endpoint1Questions": [1, 2],
    "endpoint1Solved": [],
    "endpoint1Completed": false,
    "gridCheckpoint": 0,
    "gridCompleted": false,
    "createdAt": "2026-09-12T10:00:00.000Z"
  }
];

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
    return cachedDb;
  } catch (err) {
    console.warn('Serverless Mongo Connection error, fallback to memory:', err.message);
    return null;
  }
}

async function getTeams() {
  const db = await getDb();
  if (db) return db.collection('teams').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return memoryTeams;
}

async function findOrCreateTeam(name) {
  const cleanName = String(name || '').trim();
  if (!cleanName) return null;
  const db = await getDb();

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
    let t = memoryTeams.find(item => item.name && item.name.toLowerCase() === cleanName.toLowerCase());
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
      memoryTeams.unshift(t);
    }
    return t;
  }
}

async function updateTeam(team) {
  const db = await getDb();
  if (db) {
    const { _id, ...cleanTeam } = team;
    await db.collection('teams').updateOne({ name: team.name }, { $set: cleanTeam }, { upsert: true });
  } else {
    const idx = memoryTeams.findIndex(t => t.name.toLowerCase() === team.name.toLowerCase());
    if (idx >= 0) memoryTeams[idx] = team;
    else memoryTeams.unshift(team);
  }
}

function pickTwoRandomQuestions(total = 20) {
  const q1 = Math.floor(Math.random() * total) + 1;
  let q2 = Math.floor(Math.random() * total) + 1;
  while (q2 === q1) {
    q2 = Math.floor(Math.random() * total) + 1;
  }
  return [q1, q2];
}

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

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/^\/api/, '');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health
  if (pathname === '/health' || pathname === '') {
    const questions = await getQuestions();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, questionsLoaded: questions.length }));
    return;
  }

  // Teams
  if (pathname === '/teams' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(await getTeams()));
    return;
  }

  // Body parser helper
  async function parseBody() {
    if (req.body && typeof req.body === 'object') return req.body;
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  // Endpoint 1: session
  if (pathname === '/endpoint1/session' && req.method === 'POST') {
    const body = await parseBody();
    const teamName = String(body.teamName || '').trim();
    if (!teamName) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Team name is required.' }));
    }

    const team = await findOrCreateTeam(teamName);
    const questions = await getQuestions();

    if (!Array.isArray(team.endpoint1Questions) || team.endpoint1Questions.length < 2) {
      team.endpoint1Questions = pickTwoRandomQuestions(questions.length);
      team.endpoint1Solved = team.endpoint1Solved || [];
      await updateTeam(team);
    }

    const assignedQuestions = team.endpoint1Questions.map(id => {
      const q = questions.find(item => item.id === id);
      return {
        id: q.id,
        title: q.title,
        prompt: q.prompt,
        code: q.code
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ok: true,
      teamName: team.name,
      questions: assignedQuestions,
      solvedIds: team.endpoint1Solved || [],
      completed: !!team.endpoint1Completed
    }));
  }

  // Endpoint 1: verify
  if (pathname === '/endpoint1/verify' && req.method === 'POST') {
    const body = await parseBody();
    const teamName = String(body.teamName || '').trim();
    const questionId = Number(body.questionId);
    const answer = String(body.answer || '').trim();

    if (!teamName || !questionId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Team name and question ID required.' }));
    }

    const team = await findOrCreateTeam(teamName);
    const questions = await getQuestions();
    const q = questions.find(item => item.id === questionId);
    if (!q) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Question not found.' }));
    }

    const isCorrect = verifyAnswer(q, answer);

    if (isCorrect) {
      team.endpoint1Solved = Array.from(new Set([...(team.endpoint1Solved || []), questionId]));
      const allSolved = (team.endpoint1Questions || []).every(id => team.endpoint1Solved.includes(id));
      if (allSolved) {
        team.endpoint1Completed = true;
      }
      await updateTeam(team);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        ok: true,
        correct: true,
        message: '✓ VERIFIED: Accurate computation. Protocol accepted.',
        questionId,
        solvedIds: team.endpoint1Solved,
        allSolved
      }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        ok: true,
        correct: false,
        error: '✗ MISMATCH: The reported result does not match the processor/protocol rules.',
        questionId
      }));
    }
  }

  // Endpoint 2: session
  if (pathname === '/endpoint2/session' && req.method === 'POST') {
    const body = await parseBody();
    const teamName = String(body.teamName || '').trim();
    if (!teamName) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Team name is required.' }));
    }
    const team = await findOrCreateTeam(teamName);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ok: true,
      teamName: team.name,
      checkpoint: team.gridCheckpoint || 0,
      completed: !!team.gridCompleted
    }));
  }

  // Endpoint 2: checkpoint
  if (pathname === '/endpoint2/checkpoint' && req.method === 'POST') {
    const body = await parseBody();
    const teamName = String(body.teamName || '').trim();
    const checkpoint = Number(body.checkpoint || 0);

    const team = await findOrCreateTeam(teamName);
    if (team) {
      team.gridCheckpoint = Math.max(team.gridCheckpoint || 0, checkpoint);
      await updateTeam(team);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, checkpoint: team ? team.gridCheckpoint : checkpoint }));
  }

  // Endpoint 2: complete
  if (pathname === '/endpoint2/complete' && req.method === 'POST') {
    const body = await parseBody();
    const teamName = String(body.teamName || '').trim();
    const timeElapsed = Number(body.timeElapsed || 0);
    const trapsCount = Number(body.trapsCount || 0);

    const team = await findOrCreateTeam(teamName);
    if (team) {
      team.gridCompleted = true;
      team.gridTimeElapsed = timeElapsed;
      team.gridTrapsCount = trapsCount;
      await updateTeam(team);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ok: true,
      message: 'PARADOX CONQUERED! 20×20 Floor Grid cleared successfully.',
      teamName
    }));
  }

  // Manual list
  if (pathname === '/manual' && req.method === 'GET') {
    const questions = await getQuestions();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(questions.map(q => ({
      id: q.id,
      title: q.title,
      prompt: q.prompt,
      code: q.code,
      summary: q.summary
    }))));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
}
