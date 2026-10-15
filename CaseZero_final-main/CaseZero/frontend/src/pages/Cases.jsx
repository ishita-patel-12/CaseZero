import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { playSound } from '../utils/sound.js';
import { getCaseMedia } from '../utils/caseMedia.js';

// Presentation-only treatments. Selected by backend `coverVariant` when present,
// otherwise by position, so cases never all look identical.
const VARIANTS = {
  museum: {
    label: 'Museum file',
    tone: 'sepia(0.35) contrast(1.1) brightness(0.8)',
    wash: 'linear-gradient(160deg, rgba(113,131,138,0.18), rgba(8,9,11,0.82))',
    accent: '#C9BDA7',
  },
  negative: {
    label: 'Negative file',
    tone: 'grayscale(1) invert(0.9) hue-rotate(185deg) contrast(1.15) brightness(0.7)',
    wash: 'linear-gradient(200deg, rgba(20,40,70,0.35), rgba(4,6,10,0.9))',
    accent: '#71838A',
  },
  archive: {
    label: 'Archive file',
    tone: 'grayscale(1) contrast(1.25) brightness(0.75)',
    wash: 'linear-gradient(170deg, rgba(201,189,167,0.08), rgba(8,9,11,0.85))',
    accent: '#C9BDA7',
  },
};
const ORDER = ['archive', 'museum', 'negative'];

export function CaseFile({ c, index }) {
  const navigate = useNavigate();
  const media = getCaseMedia(c.caseNumber);
  const isOpen = c.status === 'open';
  const variantKey = VARIANTS[c.coverVariant] ? c.coverVariant : ORDER[index % ORDER.length];
  const v = VARIANTS[variantKey];
  const flip = index % 2 === 1;
  const target = `/cases/${c._id || 'cz-001'}`;

  const open = (e) => {
    if (!isOpen) return;
    e.preventDefault();
    playSound('dossierOpen');
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      navigate(target);
      return;
    }
    // The file opens: cover expands, then the real route loads.
    const el = e.currentTarget;
    el.classList.add('is-opening');
    setTimeout(() => navigate(target), 650);
  };

  const Wrapper = isOpen ? Link : 'div';
  const wrapperProps = isOpen ? { to: target, onClick: open } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative block ${flip ? 'lg:ml-[14%]' : 'lg:mr-[14%]'} ${
        isOpen ? 'cursor-pointer' : 'cursor-not-allowed'
      } case-file`}
    >
      <div className={`relative grid grid-cols-1 lg:grid-cols-12 items-end ${flip ? 'lg:[direction:rtl]' : ''}`}>
        {/* Photograph, the file's cover */}
        <div className="lg:col-span-7 relative aspect-[16/10] overflow-hidden bg-[#08090B] [direction:ltr] shadow-[0_40px_90px_rgba(0,0,0,0.75)] transition-transform duration-700 ease-out group-hover:-translate-y-1.5 group-[.is-opening]:scale-[1.08] group-[.is-opening]:opacity-0">
          <img
            src={media.hero}
            alt={c.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ease-out group-hover:scale-[1.05]"
            style={{ filter: v.tone }}
          />
          <div className="absolute inset-0" style={{ background: v.wash }} />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.7)]" />
          <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: v.accent }}>
            {v.label}
          </div>
          <div className="absolute bottom-4 left-4 font-display text-6xl sm:text-8xl tracking-wider text-[#E8E3D9]/90 leading-none">
            {c.caseNumber}
          </div>
          {isOpen ? (
            <div className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.25em] uppercase text-[#B83A32] border border-[#B83A32]/60 px-2 py-1 rotate-2">
              Open
            </div>
          ) : (
            <div className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.25em] uppercase text-[#93969B] border border-[#303239] px-2 py-1">
              Sealed
            </div>
          )}
        </div>

        {/* Typewritten label, overlapping the photograph */}
        <div className="lg:col-span-6 lg:col-start-7 lg:-ml-10 relative z-10 -mt-6 lg:mt-0 lg:mb-10 [direction:ltr] mx-4 lg:mx-0">
          <div className="bg-[#C9BDA7] text-[#08090B] p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover:translate-y-[-4px] group-hover:rotate-0 rotate-[0.6deg]">
            <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] tracking-[0.2em] uppercase text-[#08090B]/60 border-b border-[#08090B]/20 pb-3 mb-4">
              <span>{c.difficulty || 'Unrated'}</span>
              {c.estimatedTime && <span>Est. {c.estimatedTime}</span>}
              {c.location && <span>{c.location}</span>}
              {c.year && <span>{c.year}</span>}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.05] font-semibold">{c.title}</h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-[#08090B]/75 line-clamp-3">
              {c.briefing || c.description}
            </p>
            <div className="mt-5 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase">
              <span className="text-[#08090B]/55">
                {(c.evidenceCount ?? 5)} exhibits · {(c.suspects?.length ?? 4)} suspects · {(c.possibleOutcomes ?? 3)} endings
              </span>
              <span className={isOpen ? 'text-[#B83A32]' : 'text-[#08090B]/40'}>
                {isOpen ? 'Open file →' : 'Coming soon'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

export function Cases() {
  const [cases, setCases] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api('/cases')
      .then((data) => { setCases(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const filteredCases = cases?.filter((c) => {
    const matchStatus = filter === 'all' ? true : filter === 'open' ? c.status === 'open' : c.status !== 'open';
    const matchSearch = search
      ? c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase()) ||
        c.caseNumber?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchStatus && matchSearch;
  });

  return (
    <main className="relative min-h-screen px-6 lg:px-16 pt-16 pb-32 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{ background: 'radial-gradient(ellipse 60% 70% at 70% 0%, rgba(201,189,167,0.09), transparent 70%)' }}
      />

      <header className="relative max-w-6xl mx-auto mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <p className="font-mono text-[10px] tracking-[0.4em] text-[#B83A32] uppercase mb-4">
            Classified division
          </p>
          <h1 className="font-display text-7xl sm:text-9xl tracking-[0.06em] leading-[0.85] text-[#E8E3D9]">
            The Archive
          </h1>
        </div>
        <div className="flex items-end gap-6 font-mono text-[10px] tracking-[0.25em] uppercase">
          <input
            type="text"
            placeholder="Search files"
            aria-label="Search case files"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-40 bg-transparent border-b border-[#303239] focus:border-[#C9BDA7] py-2 text-[#E8E3D9] placeholder:text-[#93969B]/60 focus:outline-none transition-colors"
          />
          {[
            { key: 'all', label: `All ${cases?.length ?? 0}` },
            { key: 'open', label: 'Open' },
            { key: 'sealed', label: 'Sealed' },
          ].map((b) => (
            <button
              key={b.key}
              onClick={() => setFilter(b.key)}
              className={`cz-underline pb-1 transition-colors ${
                filter === b.key ? 'text-[#E8E3D9]' : 'text-[#93969B] hover:text-[#E8E3D9]'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </header>

      {loading && (
        <div className="py-32 text-center font-mono text-[11px] tracking-[0.4em] text-[#93969B] uppercase cz-breath">
          Decrypting archive…
        </div>
      )}

      {error && !loading && (
        <div className="max-w-md mx-auto py-24 text-center space-y-5">
          <p className="font-mono text-[10px] tracking-[0.4em] text-[#B83A32] uppercase">Investigation interrupted</p>
          <p className="font-serif text-2xl text-[#E8E3D9]">Connection to the archive was lost.</p>
          <p className="font-mono text-xs text-[#93969B]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="cz-underline font-mono text-[11px] tracking-[0.3em] uppercase text-[#C9BDA7] pb-1"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="relative max-w-6xl mx-auto space-y-28 lg:space-y-36">
          {filteredCases?.map((c, i) => (
            <CaseFile key={c._id || c.caseNumber} c={c} index={i} />
          ))}
          {filteredCases?.length === 0 && (
            <div className="py-24 text-center">
              <p className="font-mono text-[10px] tracking-[0.4em] text-[#93969B] uppercase">No file matches</p>
              <p className="mt-2 font-serif italic text-xl text-[#E8E3D9]/70">Try a different case number.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
