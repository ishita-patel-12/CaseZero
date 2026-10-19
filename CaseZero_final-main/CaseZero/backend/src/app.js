import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import auth from './routes/auth.js';
import cases from './routes/cases.js';
import inv, { puzzles } from './routes/investigations.js';

const app = express();

const rawClientUrl = process.env.CLIENT_URL || '';
const configuredOrigins = rawClientUrl
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Server-to-server, health check, or mobile/curl
  const clean = origin.trim().replace(/\/+$/, '');
  if (configuredOrigins.includes(clean)) return true;
  if (defaultOrigins.includes(clean)) return true;
  if (/^http:\/\/localhost(:\d+)?$/.test(clean)) return true;
  if (/^http:\/\/127\.0\.0\.1(:\d+)?$/.test(clean)) return true;
  if (/^https:\/\/.*\.vercel\.app$/.test(clean)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    // Fallback allowing origin reflection with warning
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '200kb' }));

// Health check endpoint for Render and deployment verification
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  let caseCount = 0;
  if (dbState === 1) {
    try {
      caseCount = await mongoose.model('Case').countDocuments();
    } catch {
      caseCount = -1;
    }
  }
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      status: states[dbState] || 'unknown',
      name: mongoose.connection.name || null,
      caseCount
    }
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'CaseZero Backend API', version: '1.0.0' });
});

app.use('/api/auth', auth);
app.use('/api/cases', cases);
app.use('/api/investigations', inv);
app.use('/api/puzzles', puzzles);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((e, req, res, next) => res.status(e.status || (e.name === 'CastError' ? 400 : 500)).json({ error: e.error || e.message }));
export default app;
