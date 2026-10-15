import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from './api.js';
import { useAuth } from './auth.js';

const Err = ({ m }) => m ? <p role="alert" className="text-rust my-3">{m}</p> : null;
const btn = 'border border-amber px-5 py-2 text-amber hover:bg-amber hover:text-ink transition disabled:opacity-40 disabled:cursor-not-allowed';
const themes = { archive: 'from-[#3a2a17]', manor: 'from-[#1f2a33]', darkroom: 'from-[#3a1714]' };

export function Landing() {
  return (
    <main className="min-h-[85vh] grid place-items-center text-center px-6 bg-[radial-gradient(ellipse_at_50%_30%,#3a2a17,transparent_60%)]">
      <div>
        <h1 className="font-type text-6xl md:text-8xl tracking-[.25em] text-paper">CASEZERO</h1>
        <p className="mt-6 text-xl italic text-paper/70">Every clue tells a story. Every decision changes the truth.</p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link className={btn} to="/cases">Investigate a case</Link>
          <Link className="px-5 py-2 border border-paper/30" to="/cases">Explore cases</Link>
        </div>
      </div>
    </main>
  );
}

export function Auth({ mode }) {
  const { login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ username: '', email: '', password: '' }); const [err, setErr] = useState('');
  const submit = async e => { e.preventDefault(); setErr(''); try { login(await api('/auth/' + mode, { method: 'POST', body: f })); nav('/cases'); } catch (x) { setErr(x.message); } };
  const field = (k, label, type = 'text') => <label className="block mb-4">{label}<input required type={type} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} className="block w-full mt-1 bg-panel border border-paper/20 px-3 py-2" /></label>;
  return (
    <main className="max-w-sm mx-auto py-16 px-6">
      <h1 className="font-type text-2xl mb-6">{mode === 'login' ? 'Log in' : 'Open your case file'}</h1>
      <form onSubmit={submit}>{mode === 'register' && field('username', 'Username')}{field('email', 'Email', 'email')}{field('password', 'Password', 'password')}<Err m={err} /><button className={btn}>{mode === 'login' ? 'Log in' : 'Register'}</button></form>
    </main>
  );
}

function useLoad(path) {
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api(path).then(setD).catch(e => setErr(e.message)); }, [path]);
  return [d, err];
}

export function Cases() {
  const [cases, err] = useLoad('/cases');
  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="font-type text-3xl mb-8">Case library</h1><Err m={err} />
      {!cases && !err && <p>Loading case files…</p>}
      <div className="grid md:grid-cols-3 gap-6">
        {cases?.map(c => (
          <Link key={c._id} to={`/cases/${c._id}`} className="group border border-paper/20 bg-panel">
            <div className={`h-40 bg-gradient-to-br ${themes[c.theme]} to-[#141210] grid place-items-center font-type text-paper/40 text-5xl`}>{c.caseNumber}</div>
            <div className="p-5"><h2 className="text-xl text-amber group-hover:underline">{c.title}</h2>
              <p className="text-sm text-paper/70 mt-2">{c.description}</p>
              <p className="text-xs text-paper/50 mt-3 font-type">{c.difficulty}, {c.estimatedTime}, {c.evidenceCount} evidence, {c.puzzleCount} puzzles, {c.possibleOutcomes} outcomes</p>
              {c.status !== 'open' && <p className="mt-2 text-rust text-sm">Sealed: {c.status}</p>}</div>
          </Link>))}
      </div>
    </main>
  );
}

export function CaseDetail() {
  const { id } = useParams(); const { user } = useAuth(); const nav = useNavigate();
  const [c, err] = useLoad('/cases/' + id); const [e2, setE2] = useState('');
  const start = async () => { if (!user) return nav('/login'); try { nav('/investigation/' + (await api('/investigations', { method: 'POST', body: { caseId: id } }))._id); } catch (x) { setE2(x.message); } };
  if (err) return <Err m={err} />;
  if (!c) return <p className="p-8">Opening file…</p>;
  return (
    <main className="max-w-3xl mx-auto p-8">
      <p className="font-type text-rust border border-rust inline-block px-2 rotate-[-3deg]">CLASSIFIED</p>
      <h1 className="text-4xl mt-4">{c.title}</h1><p className="font-type text-paper/50">{c.caseNumber}</p>
      <p className="mt-6 text-lg">{c.briefing || c.description}</p>
      <p className="mt-4 font-type text-sm text-paper/60">{c.difficulty}, {c.estimatedTime}, {c.evidenceCount} evidence, {c.puzzleCount} puzzles, {c.possibleOutcomes} possible endings</p>
      <Err m={e2} />
      <button className={btn + ' mt-8'} disabled={c.status !== 'open'} onClick={start}>{c.status === 'open' ? 'Start investigation' : 'Sealed'}</button>
    </main>
  );
}

export function Investigation() {
  const { id } = useParams(); const [d, setD] = useState(null); const [tab, setTab] = useState('scene');
  const [err, setErr] = useState(''); const [msg, setMsg] = useState(''); const [sel, setSel] = useState([]);
  useEffect(() => { api('/investigations/' + id).then(setD).catch(x => setErr(x.message)); }, [id]);
  const act = async (fn, note) => { setErr(''); try { const r = await fn(); setD(r); if (note) setMsg(note(r)); } catch (x) { setErr(x.message); } };
  if (err && !d) return <Err m={err} />;
  if (!d) return <p className="p-8">Loading investigation…</p>;
  const { investigation: inv, evidence, clues, puzzles, node } = d, found = evidence.filter(e => !e.locked), done = inv.status === 'completed';
  const title = k => evidence.find(e => e.key === k)?.title || k;
  const tabs = [['scene', 'Scene'], ['board', 'Evidence board'], ['puzzles', 'Puzzles'], ['story', 'Story']];
  const post = (p, body) => api(`/investigations/${id}${p}`, { method: 'POST', body });
  return (
    <div className="min-h-screen">
      <nav className="flex items-center gap-6 px-6 py-3 border-b border-paper/15">
        <Link to="/cases" className="font-type text-amber tracking-widest">CASEZERO</Link>
        {tabs.map(([k, l]) => <button key={k} onClick={() => { setTab(k); setMsg(''); }} aria-current={tab === k} className={tab === k ? 'text-amber underline' : 'text-paper/70'}>{l}</button>)}
        <span className="ml-auto text-sm text-paper/60 font-type">{found.length}/{evidence.length} evidence, {clues.length} clues</span>
      </nav>
      <main className="max-w-5xl mx-auto p-6">
        <Err m={err} />{msg && <p role="status" className="text-amber mb-4">{msg}</p>}
        {done && <p className="stamp inline-block border-2 border-rust text-rust font-type px-3 py-1 mb-4">CASE CLOSED: {inv.outcome}</p>}

        {tab === 'scene' && <div className="grid md:grid-cols-2 gap-4">
          {evidence.map(e => e.locked
            ? <button key={e.key} disabled={done} className="text-left border border-dashed border-amber/50 p-5 hover:bg-amber/10" onClick={() => act(() => post('/evidence', { key: e.key }), () => 'Evidence logged.')}>Search: {e.hotspot}</button>
            : <article key={e.key} className="bg-paper text-ink p-5 shadow-lg"><p className="font-type text-xs text-rust">{e.type}, found at {e.hotspot}</p><h2 className="text-lg font-bold">{e.title}</h2><p className="mt-2 font-type text-sm">{e.content}</p></article>)}
        </div>}

        {tab === 'board' && <div>
          <p className="mb-4 text-paper/70">Select two evidence cards, then connect them. Real links reveal clues.</p>
          <div className="flex flex-wrap gap-3">{found.map(e => <button key={e.key} aria-pressed={sel.includes(e.key)} onClick={() => setSel(s => s.includes(e.key) ? s.filter(x => x !== e.key) : [...s.slice(-1), e.key])} className={`bg-paper text-ink px-4 py-3 shadow ${sel.includes(e.key) ? 'ring-4 ring-amber' : ''}`}>{e.title}</button>)}</div>
          {!found.length && <p>Nothing on the board yet. Search the scene first.</p>}
          <button className={btn + ' mt-5'} disabled={sel.length < 2 || done} onClick={() => { act(() => post('/connect', { a: sel[0], b: sel[1] }), r => r.found ? 'Clue discovered: ' + r.found : 'No meaningful link. Try another pair.'); setSel([]); }}>Connect evidence</button>
          <ul className="mt-6 space-y-2">{inv.connections.map((c, i) => <li key={i} className="border-l-2 border-rust pl-3">{title(c.a)} and {title(c.b)}{c.clue && <b className="text-amber">: {clues.find(x => x.key === c.clue)?.title}</b>}</li>)}</ul>
          {clues.length > 0 && <h3 className="mt-8 font-type">Clues</h3>}{clues.map(c => <p key={c.key} className="mt-2"><b className="text-amber">{c.title}.</b> {c.description}</p>)}
        </div>}

        {tab === 'puzzles' && puzzles.map(p => <section key={p._id} className="border border-paper/20 p-5 mb-4 bg-panel">
          <h2 className="text-xl text-amber">{p.title} {p.solved && '(solved)'}</h2><p className="my-3">{p.question}</p>
          {p.options.map((o, i) => <button key={i} disabled={p.solved || done} className="block w-full text-left border border-paper/20 p-3 mb-2 hover:border-amber disabled:opacity-50" onClick={() => act(() => api(`/puzzles/${p._id}/solve`, { method: 'POST', body: { investigationId: id, answer: i } }), r => r.correct ? 'Correct. A new clue is unlocked.' : 'That does not fit the evidence.' + (r.hint ? ' Hint: ' + r.hint : ''))}>{o}</button>)}
          <p className="text-xs text-paper/50">Attempts: {p.attempts}</p></section>)}

        {tab === 'story' && node && <section>
          <h2 className="text-3xl">{node.title}</h2><p className="my-4 text-lg max-w-prose">{node.content}</p>
          {!done && node.choices.map((c, i) => <button key={i} disabled={c.locked} className={btn + ' block mb-3'} onClick={() => act(() => post('/choice', { index: i }))}>{c.text}{c.locked && ' (locked: needs a clue)'}</button>)}
          {done && <Link className={btn} to="/cases">Back to library</Link>}
        </section>}
      </main>
    </div>
  );
}
