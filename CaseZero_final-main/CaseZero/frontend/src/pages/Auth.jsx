import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import { playSound } from '../utils/sound.js';
import { BRAND_ASSETS } from '../utils/caseMedia.js';

export function Auth({ mode: initialMode = 'login' }) {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/cases';
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playSound.click();

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await api(endpoint, { method: 'POST', body: formData });
      login(res);
      playSound.stamp();
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Authentication credentials rejected.');
      playSound.puzzleWrong?.();
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    playSound.click();
    setMode('login');
    if (type === 'detective') {
      setFormData({ username: 'Detective Holmes', email: 'detective@casezero.io', password: 'password123' });
    } else {
      setFormData({ username: 'Lead Investigator', email: 'admin@casezero.io', password: 'password123' });
    }
  };

  const field = 'w-full bg-transparent border-b border-[#303239] focus:border-[#C9BDA7] py-3 text-sm font-mono text-[#E8E3D9] placeholder:text-[#93969B]/40 focus:outline-none transition-colors';
  const label = 'block font-mono text-[10px] tracking-[0.3em] uppercase text-[#93969B] mb-1';

  return (
    <main className="relative min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12">
      {/* Threshold: the archive desk, dark */}
      <div className="hidden lg:block lg:col-span-6 xl:col-span-7 relative overflow-hidden">
        <img
          src={BRAND_ASSETS.deskHero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#08090B]/50 to-[#08090B]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-[#08090B]/70" />
        <div className="absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,0.8)]" />
        <div className="relative z-10 h-full flex flex-col justify-between p-14">
          <p className="font-mono text-[10px] tracking-[0.4em] text-[#B83A32] uppercase">Restricted terminal</p>
          <blockquote className="max-w-md font-serif italic text-4xl xl:text-5xl leading-[1.15] text-[#E8E3D9]/90">
            Every clue connects. Every action is logged into the case record.
          </blockquote>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#93969B] uppercase">Authorization required</p>
        </div>
      </div>

      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-8 sm:px-16 py-16 w-full max-w-xl mx-auto">
        <div className="space-y-10 cz-page-in">
          <div>
            <p className="font-mono text-[10px] tracking-[0.4em] text-[#93969B] uppercase mb-4">Credential check</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#E8E3D9] leading-[1.05]">
              {mode === 'login' ? 'Investigator access' : 'Open a detective file'}
            </h1>
            <p className="mt-3 font-sans text-sm font-light text-[#E8E3D9]/55">
              {mode === 'login'
                ? 'Authenticate to resume active investigations and team frequencies.'
                : 'Enroll your name in the investigative roster.'}
            </p>
          </div>

          <div className="flex gap-8 font-mono text-[11px] tracking-[0.3em] uppercase">
            {[['login', 'Log in'], ['register', 'Enroll']].map(([m, l]) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className={`pb-2 border-b transition-colors ${
                  mode === m ? 'text-[#E8E3D9] border-[#B83A32]' : 'text-[#93969B] border-transparent hover:text-[#E8E3D9]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" className="border-l-2 border-[#B83A32] pl-4 font-mono text-xs leading-relaxed text-[#E8E3D9]/80">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {mode === 'register' && (
              <div>
                <label className={label}>Call-sign / name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Detective Holmes"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={field}
                />
              </div>
            )}
            <div>
              <label className={label}>Email</label>
              <input
                type="email"
                required
                placeholder="investigator@casezero.io"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className={label}>Passphrase</label>
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#93969B] hover:text-[#E8E3D9]"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={field}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center gap-4 border border-[#E8E3D9]/35 hover:border-[#B83A32] px-9 py-3.5 font-mono text-xs tracking-[0.35em] uppercase text-[#E8E3D9] transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying…' : mode === 'login' ? 'Confirm credentials' : 'Enroll'}
              <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
            </button>
          </form>

          <div className="pt-6 border-t border-[#303239] space-y-3">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#93969B] block">Test clearances</span>
            <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] tracking-[0.25em] uppercase">
              <button type="button" onClick={() => handleFillDemo('detective')} className="cz-underline text-[#C9BDA7] hover:text-[#E8E3D9] pb-0.5">
                Detective (player)
              </button>
              <button type="button" onClick={() => handleFillDemo('admin')} className="cz-underline text-[#C9BDA7] hover:text-[#E8E3D9] pb-0.5">
                Lead archivist (admin)
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
