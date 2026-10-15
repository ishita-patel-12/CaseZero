import { Router } from 'express';
import { Case, Evidence, Puzzle } from '../models/index.js';
import guard from '../middleware/auth.js';
const r = Router();
const h = f => (q, s, n) => f(q, s, n).catch(n);
const withCounts = async c => ({ ...c.toObject(), evidenceCount: await Evidence.countDocuments({ caseId: c._id }), puzzleCount: await Puzzle.countDocuments({ caseId: c._id }) });
const adminGuard = (q, s, next) => {
  if (q.user?.role !== 'admin') {
    return s.status(403).json({ error: 'Administrative authorization required to modify case archives' });
  }
  next();
};

r.get('/', h(async (q, s) => s.json(await Promise.all((await Case.find().sort('caseNumber')).map(withCounts)))));
r.get('/:id', h(async (q, s) => { const c = await Case.findById(q.params.id); c ? s.json(await withCounts(c)) : s.status(404).json({ error: 'Case not found' }); }));
r.post('/', guard, adminGuard, h(async (q, s) => s.status(201).json(await Case.create(q.body))));
r.put('/:id', guard, adminGuard, h(async (q, s) => s.json(await Case.findByIdAndUpdate(q.params.id, q.body, { new: true }))));
r.delete('/:id', guard, adminGuard, h(async (q, s) => { await Case.findByIdAndDelete(q.params.id); s.status(204).end(); }));

export default r;
