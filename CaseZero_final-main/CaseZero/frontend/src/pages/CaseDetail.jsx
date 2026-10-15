import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import { playSound } from '../utils/sound.js';
import { getCaseMedia, getSuspectAvatar } from '../utils/caseMedia.js';

export function CaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    api(`/cases/${id}`)
      .then(data => {
        setCaseData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleStartInvestigation = async (isMultiplayer = false) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/cases/${id}`)}`);
      return;
    }

    setLaunching(true);
    playSound.dossierOpen();

    try {
      const res = await api('/investigations', {
        method: 'POST',
        body: { 
          caseId: id,
          isMultiplayer,
          forceNew: isMultiplayer
        }
      });
      navigate(`/investigation/${res._id}`);
    } catch (err) {
      setError(err.message);
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center p-6 text-center">
        <p className="font-mono text-[11px] tracking-[0.4em] text-[#93969B] uppercase cz-breath">
          Opening case file…
        </p>
      </main>
    );
  }

  if (error || !caseData) {
    return (
      <main className="max-w-xl mx-auto px-6 py-28 text-center space-y-5">
        <p className="font-mono text-[10px] tracking-[0.4em] text-[#B83A32] uppercase">Investigation interrupted</p>
        <h2 className="font-serif text-3xl text-[#E8E3D9]">This file could not be opened.</h2>
        <p className="font-mono text-xs text-[#93969B]">{error || 'Case records could not be loaded.'}</p>
        <Link to="/cases" className="cz-underline inline-block font-mono text-[11px] tracking-[0.3em] uppercase text-[#C9BDA7] pb-1">
          ← Return to archive
        </Link>
      </main>
    );
  }

  const media = getCaseMedia(caseData.caseNumber);
  const isOpen = caseData.status === 'open';
  const meta = [caseData.location, caseData.year, caseData.difficulty, caseData.estimatedTime && `Est. ${caseData.estimatedTime}`].filter(Boolean);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Atmosphere: the case photograph, dimmed under light */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[78vh]">
        <img src={media.scene} alt="" className="w-full h-full object-cover grayscale contrast-125 brightness-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090B]/60 via-transparent to-[#08090B]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090B] via-[#08090B]/55 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-16 pt-10 pb-32">
        <Link
          to="/cases"
          className="cz-underline inline-block font-mono text-[10px] tracking-[0.3em] uppercase text-[#93969B] hover:text-[#E8E3D9] transition-colors pb-1"
        >
          ← Archive
        </Link>

        {/* Title block */}
        <header className="mt-24 sm:mt-40 max-w-3xl cz-page-in">
          <p className="font-mono text-[10px] tracking-[0.4em] text-[#B83A32] uppercase mb-5">
            {caseData.caseNumber} · Unsolved
          </p>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl leading-[0.98] text-[#E8E3D9]">
            {caseData.title}
          </h1>
          {meta.length > 0 && (
            <p className="mt-6 font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#93969B]">
              {meta.join('  ·  ')}
            </p>
          )}
        </header>

        {/* Briefing */}
        <section className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-14">
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] tracking-[0.4em] text-[#93969B] uppercase mb-5">Briefing</p>
            <p className="font-serif text-2xl sm:text-3xl leading-[1.4] text-[#E8E3D9]/90">
              {caseData.briefing || caseData.description}
            </p>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9 space-y-6 font-mono text-[11px] tracking-[0.2em] uppercase text-[#93969B]">
            <div className="flex justify-between border-b border-[#303239] pb-3">
              <span>Exhibits</span><span className="text-[#E8E3D9]">{caseData.evidenceCount ?? 5}</span>
            </div>
            <div className="flex justify-between border-b border-[#303239] pb-3">
              <span>Possible endings</span><span className="text-[#E8E3D9]">{caseData.possibleOutcomes ?? 3}</span>
            </div>
            <div className="flex justify-between border-b border-[#303239] pb-3">
              <span>Persons of interest</span><span className="text-[#E8E3D9]">{caseData.suspects?.length ?? 0}</span>
            </div>
          </aside>
        </section>

        {/* Persons of interest: photographs, not profile cards */}
        {caseData.suspects && caseData.suspects.length > 0 && (
          <section className="mt-24">
            <p className="font-mono text-[10px] tracking-[0.4em] text-[#93969B] uppercase mb-8">Persons of interest</p>
            <div className="flex flex-wrap gap-x-10 gap-y-12">
              {caseData.suspects.map((s, i) => (
                <figure key={s.id} className="w-36 sm:w-44" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * (1 + i * 0.4)}deg)` }}>
                  <div className="bg-[#C9BDA7] p-1.5 pb-6 shadow-[0_18px_40px_rgba(0,0,0,0.7)]">
                    <img
                      src={getSuspectAvatar(caseData.caseNumber, s.id)}
                      alt={s.name}
                      className="w-full aspect-[4/5] object-cover grayscale contrast-125"
                    />
                  </div>
                  <figcaption className="mt-3">
                    <div className="font-serif text-lg text-[#E8E3D9] leading-tight">{s.name}</div>
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#93969B]">{s.role}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Begin */}
        <section className="mt-28 border-t border-[#303239] pt-12">
          {isOpen ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              <button
                onClick={() => handleStartInvestigation(false)}
                disabled={launching}
                className="group inline-flex items-center justify-center gap-4 border border-[#E8E3D9]/35 hover:border-[#B83A32] px-10 py-4 font-mono text-xs tracking-[0.35em] uppercase text-[#E8E3D9] transition-colors disabled:opacity-50"
              >
                {launching ? 'Opening scene…' : 'Begin investigation'}
                <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
              </button>
              <button
                onClick={() => handleStartInvestigation(true)}
                disabled={launching}
                className="cz-underline self-start sm:self-auto font-mono text-[11px] tracking-[0.3em] uppercase text-[#C9BDA7] hover:text-[#E8E3D9] transition-colors pb-1 disabled:opacity-50"
              >
                Open a shared room
              </button>
            </div>
          ) : (
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#93969B]">
              This file is sealed in archival storage.
            </p>
          )}
          <div className="mt-10 font-mono text-[10px] tracking-[0.3em] uppercase text-[#93969B]">
            Have a room code?{' '}
            <Link to="/join" className="cz-underline text-[#C9BDA7] hover:text-[#E8E3D9] pb-0.5">Join an existing room</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
