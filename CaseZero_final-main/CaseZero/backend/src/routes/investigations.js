import { Router } from 'express';
import crypto from 'crypto';
import { Case, Evidence, Clue, Puzzle, Node, Investigation } from '../models/index.js';
import guard from '../middleware/auth.js';
import { broadcastToRoom } from '../socket.js';

const r = Router(), puzzles = Router();
r.use(guard); puzzles.use(guard);

const h = f => (q, s, n) => f(q, s, n).catch(n);
const fail = (status, error) => Promise.reject({ status, error });

function generateRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const mine = async q => {
  const inv = await Investigation.findById(q.params.id);
  if (!inv) return fail(404, 'Investigation not found');
  const userId = q.user.id;
  const isOwner = inv.userId?.toString() === userId;
  const isHost = inv.hostId?.toString() === userId;
  const isParticipant = inv.participants?.some(p => p.userId?.toString() === userId);

  if (!isOwner && !isHost && !isParticipant) {
    if (inv.status === 'active' || inv.status === 'lobby') {
      inv.participants.push({
        userId,
        username: q.user.username,
        role: 'detective',
        joinedAt: new Date(),
        ready: true,
        currentAction: 'Viewing case file'
      });
      await inv.save();
    } else {
      return fail(403, 'You do not have access to this investigation');
    }
  }
  return inv;
};

const view = async inv => {
  const cId = inv.caseId;
  const [caseDoc, evs, clues, pz, node] = await Promise.all([
    Case.findById(cId).lean(),
    Evidence.find({ caseId: cId }).lean(),
    Clue.find({ caseId: cId }).lean(),
    Puzzle.find({ caseId: cId }).select('-answer').lean(),
    Node.findOne({ caseId: cId, key: inv.currentNode }).lean()
  ]);

  const timeline = (caseDoc?.timeline || []).map(t => ({
    ...t,
    unlocked: !t.unlockedBy || inv.evidence.includes(t.unlockedBy) || inv.clues.includes(t.unlockedBy)
  }));

  const suspects = (caseDoc?.suspects || []).map(s => {
    const relatedEvidence = evs
      .filter(e => inv.evidence.includes(e.key) && (
        e.content?.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]) ||
        e.content?.toLowerCase().includes(s.name.toLowerCase().split(' ')[1] || '---') ||
        e.title?.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]) ||
        e.title?.toLowerCase().includes(s.role.toLowerCase())
      ))
      .map(e => ({ key: e.key, title: e.title }));

    return {
      ...s,
      relatedEvidence
    };
  });

  const totalEvidence = evs.length;
  const foundEvidence = inv.evidence.length;
  const totalClues = clues.length;
  const foundClues = inv.clues.length;
  const totalPuzzles = pz.length;
  const solvedPuzzles = inv.puzzles.length;
  const progressPercent = totalEvidence + totalClues + totalPuzzles > 0
    ? Math.round(((foundEvidence + foundClues + solvedPuzzles) / (totalEvidence + totalClues + totalPuzzles)) * 100)
    : 0;

  return {
    investigation: inv,
    case: caseDoc ? {
      _id: caseDoc._id,
      title: caseDoc.title,
      caseNumber: caseDoc.caseNumber,
      briefing: caseDoc.briefing || caseDoc.description,
      description: caseDoc.description,
      difficulty: caseDoc.difficulty,
      estimatedTime: caseDoc.estimatedTime,
      theme: caseDoc.theme,
      possibleOutcomes: caseDoc.possibleOutcomes
    } : null,
    evidence: evs.map(e => inv.evidence.includes(e.key) ? e : { key: e.key, hotspot: e.hotspot, locked: true }),
    clues: clues.filter(x => inv.clues.includes(x.key)),
    allCluesCount: clues.length,
    puzzles: pz.map(p => ({ ...p, solved: inv.puzzles.includes(p.key), attempts: inv.attempts[p.key] || 0 })),
    node: node && {
      ...node,
      choices: node.choices.map(x => ({
        text: x.text,
        to: x.to,
        requiresClue: x.requiresClue,
        locked: !!x.requiresClue && !inv.clues.includes(x.requiresClue)
      }))
    },
    timeline,
    suspects,
    stats: {
      totalEvidence,
      foundEvidence,
      totalClues,
      foundClues,
      totalPuzzles,
      solvedPuzzles,
      progressPercent
    }
  };
};

// GET /api/investigations - list user's investigations
r.get('/', h(async (q, s) => {
  const invs = await Investigation.find({
    $or: [
      { userId: q.user.id },
      { hostId: q.user.id },
      { 'participants.userId': q.user.id }
    ]
  }).populate('caseId', 'title caseNumber difficulty theme').sort('-updatedAt');
  s.json(invs);
}));

// GET /api/investigations/code/:code - preview room code
r.get('/code/:code', h(async (q, s) => {
  const code = q.params.code.trim().toUpperCase();
  const inv = await Investigation.findOne({ roomCode: code }).populate('caseId', 'title caseNumber difficulty theme');
  if (!inv) return fail(404, 'Room code not found or expired');
  s.json({
    investigationId: inv._id,
    roomCode: inv.roomCode,
    status: inv.status,
    caseTitle: inv.caseId?.title,
    caseNumber: inv.caseId?.caseNumber,
    participantCount: inv.participants?.length || 1
  });
}));

// POST /api/investigations - create new investigation (solo or multiplayer room)
r.post('/', h(async (q, s) => {
  const { caseId, isMultiplayer = true, forceNew = false } = q.body;
  if (!(await Case.findById(caseId))) return fail(404, 'Case not found');

  // If not forcing a new investigation and not explicitly asking for multiplayer room, reuse active
  if (!forceNew && !isMultiplayer) {
    const existing = await Investigation.findOne({
      userId: q.user.id,
      caseId,
      status: 'active'
    });
    if (existing) return s.status(200).json(existing);
  }

  // Ensure unique room code
  let roomCode = generateRoomCode();
  let attempts = 0;
  while (await Investigation.exists({ roomCode, status: 'active' })) {
    roomCode = generateRoomCode();
    attempts++;
    if (attempts > 10) break;
  }

  const inv = await Investigation.create({
    userId: q.user.id,
    hostId: q.user.id,
    caseId,
    roomCode,
    status: 'active',
    participants: [{
      userId: q.user.id,
      username: q.user.username,
      role: 'lead_detective',
      joinedAt: new Date(),
      ready: true,
      currentAction: 'Opened case dossier'
    }]
  });

  s.status(201).json(inv);
}));

// POST /api/investigations/join - join room by code
r.post('/join', h(async (q, s) => {
  const code = (q.body.roomCode || '').trim().toUpperCase();
  if (!code) return fail(400, 'Room code required');

  const inv = await Investigation.findOne({ roomCode: code, status: 'active' });
  if (!inv) return fail(404, 'Active investigation with this room code was not found');

  const exists = inv.participants.some(p => p.userId?.toString() === q.user.id);
  if (!exists) {
    inv.participants.push({
      userId: q.user.id,
      username: q.user.username,
      role: 'detective',
      joinedAt: new Date(),
      ready: true,
      currentAction: 'Joined investigation room'
    });
    await inv.save();

    broadcastToRoom(inv._id.toString(), 'player_joined', {
      userId: q.user.id,
      username: q.user.username,
      message: `${q.user.username} joined the investigation.`
    });
    const updatedView = await view(inv);
    broadcastToRoom(inv._id.toString(), 'investigation_updated', updatedView);
  }

  s.json({ investigationId: inv._id, roomCode: inv.roomCode });
}));

// GET /api/investigations/:id
r.get('/:id', h(async (q, s) => {
  const inv = await mine(q);
  s.json(await view(inv));
}));

// POST /api/investigations/:id/evidence - log evidence
r.post('/:id/evidence', h(async (q, s) => {
  const inv = await mine(q);
  const ev = await Evidence.findOne({ caseId: inv.caseId, key: q.body.key });
  if (!ev) return fail(404, 'Nothing found there');

  let newlyFound = false;
  if (!inv.evidence.includes(q.body.key)) {
    inv.evidence.push(q.body.key);
    newlyFound = true;
    await inv.save();
  }

  const updatedView = await view(inv);

  if (newlyFound) {
    broadcastToRoom(inv._id.toString(), 'evidence_discovered', {
      evidenceKey: ev.key,
      evidenceTitle: ev.title,
      evidenceType: ev.type,
      discoveredBy: q.user.username,
      timestamp: new Date()
    });
    broadcastToRoom(inv._id.toString(), 'investigation_updated', updatedView);
  }

  s.json(updatedView);
}));

// POST /api/investigations/:id/connect - connect evidence
r.post('/:id/connect', h(async (q, s) => {
  const inv = await mine(q), { a, b } = q.body;
  if (!inv.evidence.includes(a) || !inv.evidence.includes(b) || a === b) {
    return fail(400, 'Choose two discovered evidence items');
  }
  if (inv.connections.some(c => (c.a === a && c.b === b) || (c.a === b && c.b === a))) {
    return fail(409, 'Already connected');
  }

  const clue = await Clue.findOne({ caseId: inv.caseId, relatedEvidence: { $all: [a, b] } });
  inv.connections.push({
    a,
    b,
    clue: clue?.key || null,
    connectedBy: q.user.username,
    createdAt: new Date()
  });

  let newlyUnlockedClue = false;
  if (clue && !inv.clues.includes(clue.key)) {
    inv.clues.push(clue.key);
    newlyUnlockedClue = true;
  }
  await inv.save();

  const updatedView = await view(inv);

  broadcastToRoom(inv._id.toString(), 'evidence_connected', {
    a,
    b,
    clueTitle: clue?.title || null,
    connectedBy: q.user.username,
    newClue: newlyUnlockedClue
  });

  if (newlyUnlockedClue && clue) {
    broadcastToRoom(inv._id.toString(), 'clue_unlocked', {
      clueKey: clue.key,
      clueTitle: clue.title,
      clueDescription: clue.description,
      unlockedBy: q.user.username
    });
  }

  broadcastToRoom(inv._id.toString(), 'investigation_updated', updatedView);

  s.json({ ...updatedView, found: clue?.title || null });
}));

// POST /api/investigations/:id/choice - branch narrative
r.post('/:id/choice', h(async (q, s) => {
  const inv = await mine(q);
  if (inv.status !== 'active') return fail(400, 'Investigation is closed');

  const node = await Node.findOne({ caseId: inv.caseId, key: inv.currentNode });
  const ch = node?.choices[q.body.index];
  if (!ch) return fail(400, 'Invalid choice');
  if (ch.requiresClue && !inv.clues.includes(ch.requiresClue)) {
    return fail(403, 'You need more evidence or a confirmed clue to take this path');
  }

  inv.decisions.push({
    text: ch.text,
    decidedBy: q.user.username,
    createdAt: new Date()
  });
  inv.currentNode = ch.to;

  const next = await Node.findOne({ caseId: inv.caseId, key: ch.to });
  if (next?.ending) {
    inv.status = 'completed';
    inv.outcome = next.outcome;
  }
  await inv.save();

  const updatedView = await view(inv);

  broadcastToRoom(inv._id.toString(), 'decision_made', {
    decisionText: ch.text,
    decidedBy: q.user.username,
    currentNode: ch.to,
    isEnding: !!next?.ending,
    outcome: next?.outcome || null
  });

  if (next?.ending) {
    broadcastToRoom(inv._id.toString(), 'case_completed', {
      outcome: next.outcome,
      title: next.title,
      content: next.content
    });
  }

  broadcastToRoom(inv._id.toString(), 'investigation_updated', updatedView);

  s.json(updatedView);
}));

// POST /api/investigations/:id/complete - manually close case
r.post('/:id/complete', h(async (q, s) => {
  const inv = await mine(q);
  inv.status = 'completed';
  inv.outcome ||= 'Case closed without a final verdict';
  await inv.save();

  const updatedView = await view(inv);
  broadcastToRoom(inv._id.toString(), 'case_completed', {
    outcome: inv.outcome
  });
  broadcastToRoom(inv._id.toString(), 'investigation_updated', updatedView);

  s.json(updatedView);
}));

// POST /api/investigations/:id/chat - add team chat message
r.post('/:id/chat', h(async (q, s) => {
  const inv = await mine(q);
  const text = (q.body.text || '').trim();
  if (!text) return fail(400, 'Message text required');

  const msg = {
    senderId: q.user.id,
    senderName: q.user.username,
    text: text.slice(0, 500),
    timestamp: new Date()
  };

  inv.chat.push(msg);
  await inv.save();

  broadcastToRoom(inv._id.toString(), 'chat_message', msg);
  s.json(msg);
}));

// POST /api/investigations/:id/presence - update player current action
r.post('/:id/presence', h(async (q, s) => {
  const inv = await mine(q);
  const action = (q.body.action || '').trim().slice(0, 80);

  const participant = inv.participants.find(p => p.userId?.toString() === q.user.id);
  if (participant) {
    participant.currentAction = action || 'Investigating';
    await inv.save();
  }

  broadcastToRoom(inv._id.toString(), 'presence_update', {
    userId: q.user.id,
    username: q.user.username,
    action
  });

  s.json({ success: true });
}));

// POST /api/puzzles/:id/solve
puzzles.post('/:id/solve', h(async (q, s) => {
  const inv = await Investigation.findById(q.body.investigationId);
  if (!inv) return fail(404, 'Investigation not found');

  const p = await Puzzle.findOne({ _id: q.params.id, caseId: inv.caseId });
  if (!p) return fail(404, 'Puzzle not found');

  const ok = Number(q.body.answer) === p.answer;
  inv.attempts = { ...inv.attempts, [p.key]: (inv.attempts[p.key] || 0) + 1 };

  let grantedNewClue = null;
  if (ok && !inv.puzzles.includes(p.key)) {
    inv.puzzles.push(p.key);
    if (p.grantsClue && !inv.clues.includes(p.grantsClue)) {
      inv.clues.push(p.grantsClue);
      const clueDoc = await Clue.findOne({ caseId: inv.caseId, key: p.grantsClue });
      grantedNewClue = clueDoc?.title || p.grantsClue;
    }
  }
  await inv.save();

  const hint = !ok && inv.attempts[p.key] >= 2 ? p.hints[0] : undefined;
  const updatedView = await view(inv);

  if (ok) {
    broadcastToRoom(inv._id.toString(), 'puzzle_solved', {
      puzzleKey: p.key,
      puzzleTitle: p.title,
      solvedBy: q.user.username,
      grantedClue: grantedNewClue
    });
    broadcastToRoom(inv._id.toString(), 'investigation_updated', updatedView);
  }

  s.json({ correct: ok, hint, ...updatedView });
}));

export default r;
export { puzzles };
