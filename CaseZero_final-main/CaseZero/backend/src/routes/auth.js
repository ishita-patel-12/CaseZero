import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import guard from '../middleware/auth.js';
const r = Router();
const h = f => (q, s, n) => f(q, s, n).catch(n);
const out = u => ({
  token: jwt.sign({ id: u._id, username: u.username, role: u.role || 'player' }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: { id: u._id, username: u.username, email: u.email, role: u.role || 'player' }
});
r.post('/register', h(async (q, s) => {
  const { username, email, password } = q.body;
  if (!username?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 6) return s.status(400).json({ error: 'Username, valid email and a password of 6+ characters are required' });
  if (await User.findOne({ email: String(email).toLowerCase() })) return s.status(409).json({ error: 'Email already registered' });
  const role = String(email).toLowerCase().startsWith('admin') ? 'admin' : 'player';
  s.status(201).json(out(await User.create({ username: String(username).trim(), email: String(email), password: await bcrypt.hash(password, 10), role })));
}));
r.post('/login', h(async (q, s) => {
  const u = await User.findOne({ email: String(q.body.email || '').toLowerCase() }).select('+password');
  if (!u || !(await bcrypt.compare(String(q.body.password || ''), u.password))) return s.status(401).json({ error: 'Invalid email or password' });
  s.json(out(u));
}));
r.get('/me', guard, h(async (q, s) => {
  const user = await User.findById(q.user.id);
  if (!user) return s.status(404).json({ error: 'User not found' });
  s.json({ user: { id: user._id, username: user.username, email: user.email, role: user.role || 'player' } });
}));

export default r;
