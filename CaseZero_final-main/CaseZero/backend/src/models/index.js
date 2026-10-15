import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const ref = { type: Schema.Types.ObjectId, ref: 'Case', index: true };

export const User = model('User', new Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['player', 'admin'], default: 'player' }
}, { timestamps: true }));

export const Case = model('Case', new Schema({
  title: String,
  caseNumber: String,
  description: String,
  briefing: String,
  difficulty: String,
  estimatedTime: String,
  theme: String,
  status: { type: String, default: 'open' },
  possibleOutcomes: Number,
  suspects: [{
    id: String,
    name: String,
    role: String,
    avatar: String,
    alibi: String,
    motive: String,
    opportunity: String,
    notes: String,
    suspicionLevel: { type: String, default: 'Medium' }
  }],
  timeline: [{
    id: String,
    time: String,
    title: String,
    description: String,
    unlockedBy: String // evidence key or clue key, or null if initially visible
  }]
}, { timestamps: true }));

export const Evidence = model('Evidence', new Schema({
  caseId: ref,
  key: String,
  title: String,
  description: String,
  type: String,
  content: String,
  hotspot: String,
  importance: String,
  metadata: Object
}));

export const Clue = model('Clue', new Schema({
  caseId: ref,
  key: String,
  title: String,
  description: String,
  type: { type: String, default: 'critical' },
  relatedEvidence: [String]
}));

export const Puzzle = model('Puzzle', new Schema({
  caseId: ref,
  key: String,
  title: String,
  type: String,
  question: String,
  options: [String],
  answer: Number,
  hints: [String],
  grantsClue: String
}));

export const Node = model('NarrativeNode', new Schema({
  caseId: ref,
  key: String,
  title: String,
  content: String,
  ending: Boolean,
  outcome: String,
  choices: [{ text: String, to: String, requiresClue: String }]
}));

export const Investigation = model('Investigation', new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  caseId: ref,
  roomCode: { type: String, uppercase: true, trim: true, index: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User' },
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    username: String,
    role: { type: String, default: 'detective' },
    joinedAt: { type: Date, default: Date.now },
    ready: { type: Boolean, default: true },
    currentAction: { type: String, default: 'Reviewing case briefing' }
  }],
  currentNode: { type: String, default: 'start' },
  evidence: [String],
  clues: [String],
  puzzles: [String],
  attempts: { type: Object, default: {} },
  connections: [{
    a: String,
    b: String,
    clue: String,
    connectedBy: String,
    createdAt: { type: Date, default: Date.now }
  }],
  decisions: [{
    text: String,
    decidedBy: String,
    createdAt: { type: Date, default: Date.now }
  }],
  status: { type: String, default: 'active' }, // 'active', 'completed'
  outcome: String,
  chat: [{
    senderId: String,
    senderName: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true, minimize: false }));

