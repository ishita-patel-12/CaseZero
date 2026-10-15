import express from 'express';
import cors from 'cors';
import auth from './routes/auth.js';
import cases from './routes/cases.js';
import inv, { puzzles } from './routes/investigations.js';
const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true); // Dev flexibility
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '200kb' }));

app.use('/api/auth', auth);
app.use('/api/cases', cases);
app.use('/api/investigations', inv);
app.use('/api/puzzles', puzzles);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((e, req, res, next) => res.status(e.status || (e.name === 'CastError' ? 400 : 500)).json({ error: e.error || e.message }));
export default app;
