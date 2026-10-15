import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import { playSound, isAudioEnabled, toggleAudio } from '../utils/sound.js';
import { BRAND_ASSETS } from '../utils/caseMedia.js';
import { FogCanvas } from '../components/FogCanvas.jsx';
import { CaseFile } from './Cases.jsx';
import { 
  Search, 
  Compass, 
  FileText, 
  GitFork, 
  Link2, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  HelpCircle,
  Eye,
  SlidersHorizontal,
  Users
} from 'lucide-react';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function Landing() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [cases, setCases] = useState(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [caseError, setCaseError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [crossing, setCrossing] = useState(false);
  const [audioOn, setAudioOn] = useState(isAudioEnabled());

  const progressRef = useRef(0);
  const stageRef = useRef(null);
  const wordmarkRef = useRef(null);
  const cornerRef = useRef(null);

  // Fetch actual cases from the backend API (both CZ-001, CZ-002, CZ-003, and future additions)
  useEffect(() => {
    let alive = true;
    api('/cases')
      .then((data) => {
        if (!alive) return;
        setCases(Array.isArray(data) ? data : []);
        setLoadingCases(false);
      })
      .catch((err) => {
        if (!alive) return;
        setCaseError(err.message || 'Unable to connect to archive');
        setLoadingCases(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Scroll + pointer drive CSS variables directly without re-rendering React on every frame
  useEffect(() => {
    const stage = stageRef.current;
    let ticking = false;
    let mx = 0.5;
    let my = 0.5;

    const apply = () => {
      ticking = false;
      const vh = window.innerHeight || 1;
      const y = window.scrollY;
      const p = clamp(y / (vh * 1.1));
      progressRef.current = p;

      if (stage) {
        stage.style.setProperty('--img', String(smooth(0.08, 0.65, p)));
        stage.style.setProperty('--light', String(smooth(0.2, 0.85, p)));
        stage.style.setProperty('--mx', `${mx * 100}%`);
        stage.style.setProperty('--my', `${my * 100}%`);
        stage.style.setProperty('--py', `${(mx - 0.5) * -14}px`);
      }
      if (wordmarkRef.current) {
        const o = 1 - smooth(0, 0.42, y / vh);
        wordmarkRef.current.style.opacity = String(o);
        wordmarkRef.current.style.transform = `translateY(${y * -0.14}px) scale(${1 + (y / vh) * 0.04})`;
      }
      if (cornerRef.current) {
        cornerRef.current.style.opacity = String(smooth(0.35, 0.85, y / vh));
      }
    };

    const queue = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };

    const onMove = (e) => {
      mx = e.clientX / (window.innerWidth || 1);
      my = e.clientY / (window.innerHeight || 1);
      queue();
    };

    apply();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  // IntersectionObserver for staggered cinematic reveals as elements scroll into view
  useEffect(() => {
    const els = document.querySelectorAll('.cz-reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [cases]);

  // Navigate to archive smoothly when clicking Archive link in corner chrome
  const handleArchiveClick = (e) => {
    e.preventDefault();
    const el = document.getElementById('archive');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/cases');
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (code) {
      playSound('click');
      navigate(`/join?code=${code}`);
    }
  };

  const handleAudio = () => setAudioOn(toggleAudio());

  // Filter cases for the archive section
  const filteredCases = cases?.filter((c) => {
    const matchStatus =
      filter === 'all'
        ? true
        : filter === 'open'
        ? c.status === 'open'
        : c.status !== 'open';
    const matchSearch = search
      ? c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase()) ||
        c.caseNumber?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchStatus && matchSearch;
  });

  return (
    <div className="relative bg-[#08090B] text-[#E8E3D9] selection:bg-[#B83A32]/40">
      {/* ── Fixed Atmospheric Stage (Detective Desk revealed beneath parting fog) ── */}
      <div
        ref={stageRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
        style={{ '--img': 0, '--light': 0, '--mx': '50%', '--my': '50%', '--py': '0px' }}
      >
        {/* Universal detective desk background, revealed through pointer-following aperture */}
        <img
          src={BRAND_ASSETS.deskHero}
          alt=""
          className="absolute inset-[-4%] w-[108%] h-[108%] object-cover grayscale contrast-125 brightness-75"
          style={{
            opacity: 'calc(var(--img) * 0.45)',
            transform: 'translateX(var(--py))',
            WebkitMaskImage:
              'radial-gradient(circle at var(--mx) var(--my), #000 0%, rgba(0,0,0,0.55) 24%, rgba(0,0,0,0.12) 58%, transparent 82%)',
            maskImage:
              'radial-gradient(circle at var(--mx) var(--my), #000 0%, rgba(0,0,0,0.55) 24%, rgba(0,0,0,0.12) 58%, transparent 82%)',
          }}
        />
        {/* Soft light penetrating the darkness */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 'calc(var(--light) * 0.85)',
            background:
              'radial-gradient(ellipse 42% 65% at 68% 12%, rgba(201,189,167,0.16), transparent 70%), linear-gradient(110deg, transparent 50%, rgba(201,189,167,0.06) 62%, transparent 70%)',
          }}
        />
        {/* The interactive procedural fog canvas */}
        <FogCanvas progressRef={progressRef} className="absolute inset-0 cz-flicker" />
      </div>

      <div className="cz-vignette" />
      <div className="cz-grain" />

      {/* ── Fixed Corner Navigation Chrome ── */}
      <div
        ref={cornerRef}
        className="fixed top-0 inset-x-0 z-40 px-5 sm:px-10 py-5 flex items-center justify-between pointer-events-auto"
        style={{ opacity: 0 }}
      >
        <Link to="/" className="flex items-center gap-3" aria-label="CaseZero Home">
          <img src={BRAND_ASSETS.emblem} alt="" className="w-6 h-6 opacity-85" />
          <span className="font-display text-xl tracking-[0.28em] text-[#E8E3D9]/90">CASEZERO</span>
        </Link>
        <nav className="flex items-center gap-5 sm:gap-7 font-mono text-[10px] tracking-[0.22em] uppercase text-[#93969B]">
          <a
            href="#archive"
            onClick={handleArchiveClick}
            className="cz-underline hover:text-[#E8E3D9] transition-colors"
          >
            Archive
          </a>
          <Link to="/join" className="cz-underline hover:text-[#E8E3D9] transition-colors hidden sm:inline">
            Join Room
          </Link>
          {user ? (
            <button onClick={logout} className="cz-underline hover:text-[#E8E3D9] transition-colors">
              {user.username} · Exit
            </button>
          ) : (
            <Link to="/login" className="cz-underline hover:text-[#E8E3D9] transition-colors">
              Log in
            </Link>
          )}
          <button
            onClick={handleAudio}
            aria-pressed={audioOn}
            className="cz-underline hover:text-[#E8E3D9] transition-colors"
          >
            Sound {audioOn ? 'on' : 'off'}
          </button>
        </nav>
      </div>

      <main className="relative z-10">
        {/* ══════════════════════════════════════════════════════════════════
            CHAPTER 01 — THE AWAKENING
            Opening scene with dark atmosphere, wordmark, and interactive fog
            ══════════════════════════════════════════════════════════════════ */}
        <section className="relative h-[100svh] flex flex-col items-center justify-center text-center px-6">
          <div ref={wordmarkRef} className="will-change-transform">
            <h1
              className="font-display text-[22vw] sm:text-[15vw] lg:text-[12rem] leading-[0.85] tracking-[0.08em] text-[#E8E3D9] cz-reveal is-in"
              style={{ textShadow: '0 0 70px rgba(232,227,217,0.09)' }}
            >
              CASEZERO
            </h1>
            <p className="mt-6 font-mono text-[10px] sm:text-xs tracking-[0.5em] text-[#93969B] uppercase">
              Every detail leaves a trace.
            </p>
          </div>
          <div className="absolute bottom-9 inset-x-0 flex flex-col items-center gap-3 font-mono text-[9px] tracking-[0.45em] text-[#93969B]/70 uppercase">
            <span>Scroll to uncover</span>
            <span className="block w-px h-10 bg-gradient-to-b from-[#93969B]/60 to-transparent cz-breath" />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            CHAPTER 02 — ENTER THE UNKNOWN
            Cinematic introduction to the CaseZero universe & 4 investigation acts
            ══════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen px-6 sm:px-12 lg:px-24 py-28 sm:py-36 overflow-hidden">
          {/* Subtle ambient light pool */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 w-[85vw] max-w-5xl h-[700px] opacity-25"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(200,155,78,0.12), transparent 75%)',
            }}
          />

          <div className="max-w-6xl mx-auto space-y-32 sm:space-y-44">
            {/* ── Main Manifesto Declaration ── */}
            <div className="max-w-4xl space-y-8">
              <div className="cz-reveal flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-[#B83A32] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B83A32] animate-pulse" />
                <span>CASEZERO DOSSIER PROTOCOL // ENTER THE UNKNOWN</span>
              </div>

              <h2
                className="cz-reveal font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.08] text-[#E8E3D9]"
                style={{ transitionDelay: '120ms' }}
              >
                Some stories aren’t meant to be told.{' '}
                <span className="italic text-[#C9BDA7] font-normal block sm:inline">
                  They’re meant to be solved.
                </span>
              </h2>

              <p
                className="cz-reveal max-w-2xl font-sans font-light text-base sm:text-lg lg:text-xl leading-relaxed text-[#E8E3D9]/75"
                style={{ transitionDelay: '240ms' }}
              >
                Every case begins with a question. A missing truth. An account that doesn’t quite fit.
                Inside CaseZero, you step into the investigation: examine the evidence, question the
                details, connect the clues, and decide what really happened.
              </p>

              <div
                className="cz-reveal pt-4 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[10px] tracking-[0.25em] text-[#93969B]/70 uppercase"
                style={{ transitionDelay: '340ms' }}
              >
                <span>SYS // LATENT RECONSTRUCTION</span>
                <span className="hidden sm:inline">·</span>
                <span>PHYSICAL & DOCUMENTAL EXHIBITS</span>
                <span className="hidden sm:inline">·</span>
                <span>IRREVOCABLE OUTCOMES</span>
              </div>
            </div>

            {/* ── ACT 01: INVESTIGATE ── */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="cz-reveal flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-[#c89b4e] uppercase">
                  <span className="px-1.5 py-0.5 border border-[#c89b4e]/40 bg-[#c89b4e]/10">ACT 01</span>
                  <span>IMMERSIVE RECONSTRUCTION</span>
                </div>
                <h3
                  className="cz-reveal font-serif text-3xl sm:text-5xl leading-[1.1] text-[#E8E3D9]"
                  style={{ transitionDelay: '100ms' }}
                >
                  Enter the Crime Scene
                </h3>
                <p
                  className="cz-reveal font-mono text-xs tracking-[0.3em] text-[#B83A32] uppercase"
                  style={{ transitionDelay: '180ms' }}
                >
                  OBSERVE WHAT OTHERS MISS.
                </p>
                <p
                  className="cz-reveal font-sans font-light text-sm sm:text-base leading-relaxed text-[#E8E3D9]/70 max-w-xl"
                  style={{ transitionDelay: '260ms' }}
                >
                  Every investigation opens inside a physical world preserved at the moment of rupture.
                  Swept under storm, sealed from within, or abandoned in haste. You navigate the
                  environment directly — inspecting unlatched shutters, stopped pendulums, and
                  discarded traces left behind before the room was disturbed.
                </p>
              </div>

              {/* Forensic Viewfinder Ornament */}
              <div
                className="cz-reveal lg:col-span-5 relative"
                style={{ transitionDelay: '200ms' }}
              >
                <div className="relative border border-[#ede5d8]/15 bg-[#141311]/90 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                  <div className="flex justify-between items-center font-mono text-[9px] tracking-[0.25em] text-[#93969B] uppercase border-b border-[#ede5d8]/10 pb-3 mb-5">
                    <span>SECTOR GRID // SCANNER</span>
                    <span className="text-[#c89b4e] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE APERTURE
                    </span>
                  </div>

                  <div className="relative aspect-[4/3] bg-[#08090B] border border-[#ede5d8]/10 overflow-hidden flex items-center justify-center">
                    {/* Viewfinder crosshairs */}
                    <div className="absolute inset-4 border border-[#c89b4e]/20 pointer-events-none" />
                    <div className="absolute w-8 h-px bg-[#c89b4e]/50" />
                    <div className="absolute h-8 w-px bg-[#c89b4e]/50" />

                    {/* Corner bracket markers */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#c89b4e]" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#c89b4e]" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#c89b4e]" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#c89b4e]" />

                    {/* Forensic sweep radar pulse */}
                    <div className="relative flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-[#c89b4e] bg-[#c89b4e]/10 flex items-center justify-center hotspot-active">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#c89b4e]" />
                      </div>
                      <span className="font-mono text-[8px] tracking-[0.3em] text-[#c89b4e] uppercase bg-[#08090B]/90 px-2 py-0.5 border border-[#c89b4e]/40">
                        LATENT EXHIBIT LOCATED
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-3 font-mono text-[8px] text-[#93969B]/60 tracking-widest">
                      51°30'26"N · 0°07'39"W
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#ede5d8]/10 flex justify-between font-mono text-[9px] text-[#93969B] uppercase">
                    <span>HOTSPOT IDENTIFICATION</span>
                    <span className="text-[#E8E3D9]/80 font-bold">PRIMARY CRIME SCENE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ACT 02: DISCOVER ── */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Typewritten Document Exhibit Ornament */}
              <div
                className="cz-reveal lg:col-span-5 order-2 lg:order-1"
                style={{ transitionDelay: '200ms' }}
              >
                <div className="relative bg-[#C9BDA7] text-[#08090B] p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.85)] rotate-[-1.5deg]">
                  <div className="flex justify-between items-center font-mono text-[9px] tracking-[0.2em] text-[#08090B]/60 uppercase border-b border-[#08090B]/20 pb-3 mb-4">
                    <span>EXHIBIT TAG #094-DOC</span>
                    <span className="text-[#B83A32] font-bold">CHAIN OF CUSTODY</span>
                  </div>

                  <div className="space-y-3 font-serif text-sm sm:text-base leading-snug">
                    <p className="italic text-[#08090B]/90">
                      “The entry records the regular night delivery. Additional notes establish that the
                      seal was intact when placed upon the writing desk.”
                    </p>
                    <p className="text-xs font-mono tracking-wider text-[#08090B]/70">
                      OBSERVATION: Second ring mark on tray indicates drink was returned after opening.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#08090B]/20 flex items-center justify-between">
                    <span className="stamp stamp-red text-[9px] px-2 py-0.5">
                      FALSIFIED RECORD
                    </span>
                    <span className="font-mono text-[9px] text-[#08090B]/60 tracking-wider">
                      RECOVERED EVIDENCE
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6 order-1 lg:order-2 lg:pl-8">
                <div className="cz-reveal flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-[#c89b4e] uppercase">
                  <span className="px-1.5 py-0.5 border border-[#c89b4e]/40 bg-[#c89b4e]/10">ACT 02</span>
                  <span>FORENSIC LOGGING</span>
                </div>
                <h3
                  className="cz-reveal font-serif text-3xl sm:text-5xl leading-[1.1] text-[#E8E3D9]"
                  style={{ transitionDelay: '100ms' }}
                >
                  Search Hidden Evidence
                </h3>
                <p
                  className="cz-reveal font-mono text-xs tracking-[0.3em] text-[#B83A32] uppercase"
                  style={{ transitionDelay: '180ms' }}
                >
                  EVERY CLUE HAS A CONTEXT.
                </p>
                <p
                  className="cz-reveal font-sans font-light text-sm sm:text-base leading-relaxed text-[#E8E3D9]/70 max-w-xl"
                  style={{ transitionDelay: '260ms' }}
                >
                  Nothing in a case file is decorative. Discarded railway stubs, altered medical
                  ledgers, broken brass folio clasps, and charred codicil fragments in the grate. What
                  appears accidental under casual glance becomes critical evidence when logged under
                  forensic inspection.
                </p>
              </div>
            </div>

            {/* ── ACT 03: CONNECT ── */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="cz-reveal flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-[#c89b4e] uppercase">
                  <span className="px-1.5 py-0.5 border border-[#c89b4e]/40 bg-[#c89b4e]/10">ACT 03</span>
                  <span>THE DEDUCTION BOARD</span>
                </div>
                <h3
                  className="cz-reveal font-serif text-3xl sm:text-5xl leading-[1.1] text-[#E8E3D9]"
                  style={{ transitionDelay: '100ms' }}
                >
                  Link Evidence & Uncover Clues
                </h3>
                <p
                  className="cz-reveal font-mono text-xs tracking-[0.3em] text-[#B83A32] uppercase"
                  style={{ transitionDelay: '180ms' }}
                >
                  THE TRUTH IS NEVER JUST ONE PIECE OF EVIDENCE.
                </p>
                <p
                  className="cz-reveal font-sans font-light text-sm sm:text-base leading-relaxed text-[#E8E3D9]/70 max-w-xl"
                  style={{ transitionDelay: '260ms' }}
                >
                  An alibi in the conservatory means nothing in isolation. On the pinboard, you connect
                  disparate exhibits with crimson threads. Correlate timestamps, identify tampering,
                  and reveal forensic deductions that crack open the narrative and dismantle false
                  claims.
                </p>
              </div>

              {/* Pinboard Thread Connection Ornament */}
              <div
                className="cz-reveal lg:col-span-5 relative"
                style={{ transitionDelay: '200ms' }}
              >
                <div className="relative border border-[#ede5d8]/15 bg-[#121110] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] pinboard-grid">
                  <div className="flex justify-between items-center font-mono text-[9px] tracking-[0.25em] text-[#93969B] uppercase border-b border-[#ede5d8]/10 pb-3 mb-6">
                    <span>EVIDENCE BOARD // MATRIX</span>
                    <span className="text-[#c89b4e]">CORRELATION VERIFIED</span>
                  </div>

                  <div className="space-y-4">
                    {/* Exhibit Node A */}
                    <div className="p-3 bg-[#1c1a17] border border-[#ede5d8]/20 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#B83A32] shadow-[0_0_8px_#B83A32]" />
                        <span className="font-mono text-[10px] text-[#ede5d8] font-bold">
                          #EX-07 Estate Payment Ledger
                        </span>
                      </div>
                      <span className="font-mono text-[8px] text-[#93969B] uppercase">Diverted Funds</span>
                    </div>

                    {/* Crimson Connecting Thread */}
                    <div className="relative py-2 flex items-center justify-center">
                      <div className="w-px h-8 bg-[#B83A32] shadow-[0_0_6px_#B83A32]" />
                      <span className="absolute bg-[#08090B] px-2 py-0.5 border border-[#B83A32]/60 font-mono text-[8px] text-[#B83A32] uppercase tracking-wider">
                        CRIMSON LINK
                      </span>
                    </div>

                    {/* Exhibit Node B */}
                    <div className="p-3 bg-[#1c1a17] border border-[#ede5d8]/20 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#B83A32] shadow-[0_0_8px_#B83A32]" />
                        <span className="font-mono text-[10px] text-[#ede5d8] font-bold">
                          #EX-09 Black Sealing Wax
                        </span>
                      </div>
                      <span className="font-mono text-[8px] text-[#93969B] uppercase">Heraldic Stamp</span>
                    </div>
                  </div>

                  {/* Unlocked Clue Badge */}
                  <div className="mt-5 p-3 bg-[#c89b4e]/10 border border-[#c89b4e]/40 flex items-center gap-3">
                    <span className="text-[#c89b4e] font-serif text-lg leading-none">✦</span>
                    <div>
                      <div className="font-mono text-[8px] text-[#c89b4e] uppercase tracking-widest font-bold">
                        UNLOCKED CLUE RECORD
                      </div>
                      <div className="font-sans text-xs text-[#ede5d8] font-medium">
                        The Legal Folio & Audit Motive Exposed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ACT 04: DECIDE ── */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Branching Verdict Outcome Ornament */}
              <div
                className="cz-reveal lg:col-span-5 order-2 lg:order-1"
                style={{ transitionDelay: '200ms' }}
              >
                <div className="border border-[#ede5d8]/15 bg-[#141311] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] space-y-4">
                  <div className="flex justify-between items-center font-mono text-[9px] tracking-[0.25em] text-[#93969B] uppercase border-b border-[#ede5d8]/10 pb-3 mb-4">
                    <span>NARRATIVE ENGINE // FORKS</span>
                    <span className="text-[#B83A32]">4 MULTIPLE ENDINGS</span>
                  </div>

                  {/* Outcome list */}
                  <div className="space-y-3 font-mono text-[10px]">
                    <div className="p-2.5 border border-[#ede5d8]/10 bg-[#0e0d0c] text-[#93969B] flex items-center justify-between opacity-60">
                      <span>OUTCOME A · The Wrong Heir</span>
                      <span className="text-[8px] uppercase">Flawed Charge</span>
                    </div>

                    <div className="p-2.5 border border-[#ede5d8]/10 bg-[#0e0d0c] text-[#93969B] flex items-center justify-between opacity-60">
                      <span>OUTCOME B · Convenient Diagnosis</span>
                      <span className="text-[8px] uppercase">Circumstantial</span>
                    </div>

                    <div className="p-2.5 border border-[#c89b4e]/50 bg-[#c89b4e]/10 text-[#ede5d8] flex items-center justify-between shadow-[0_0_15px_rgba(200,155,78,0.15)]">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✔</span>
                        <span className="font-bold text-[#c89b4e]">OUTCOME C · The True Deduction</span>
                      </div>
                      <span className="text-[8px] uppercase text-[#c89b4e] font-bold">Case Closed</span>
                    </div>

                    <div className="p-2.5 border border-[#ede5d8]/10 bg-[#0e0d0c] text-[#93969B] flex items-center justify-between opacity-60">
                      <span>OUTCOME D · Partial Recovery</span>
                      <span className="text-[8px] uppercase">Unresolved Death</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#ede5d8]/10 flex items-center justify-between font-mono text-[9px] text-[#93969B] uppercase">
                    <span>FINAL CONFRONTATION</span>
                    <span className="stamp stamp-gold text-[8px] px-2 py-0.5">IRREVOCABLE</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6 order-1 lg:order-2 lg:pl-8">
                <div className="cz-reveal flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-[#c89b4e] uppercase">
                  <span className="px-1.5 py-0.5 border border-[#c89b4e]/40 bg-[#c89b4e]/10">ACT 04</span>
                  <span>THE VERDICT</span>
                </div>
                <h3
                  className="cz-reveal font-serif text-3xl sm:text-5xl leading-[1.1] text-[#E8E3D9]"
                  style={{ transitionDelay: '100ms' }}
                >
                  Solve Puzzles & Decide the Ending
                </h3>
                <p
                  className="cz-reveal font-mono text-xs tracking-[0.3em] text-[#B83A32] uppercase"
                  style={{ transitionDelay: '180ms' }}
                >
                  YOUR CONCLUSION CHANGES EVERYTHING.
                </p>
                <p
                  className="cz-reveal font-sans font-light text-sm sm:text-base leading-relaxed text-[#E8E3D9]/70 max-w-xl"
                  style={{ transitionDelay: '260ms' }}
                >
                  Decipher encrypted codicils and reconstruct staged mechanisms through deduction
                  puzzles. When the final confrontation arrives, there are no scripted guardrails.
                  Your deductions dictate the narrative branch — leading to justice, a premature close,
                  or the wrong accusation entirely.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            CHAPTER 03 — THE CASE ARCHIVE
            Seamless transition directly into the live case collection
            ══════════════════════════════════════════════════════════════════ */}
        <section id="archive" className="relative min-h-screen px-6 sm:px-12 lg:px-24 pt-24 pb-36">
          {/* Ambient header glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-25"
            style={{
              background:
                'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(201,189,167,0.14), transparent 70%)',
            }}
          />

          {/* ── Transition Header ── */}
          <div className="relative max-w-6xl mx-auto mb-20 text-center space-y-4">
            <div className="cz-reveal flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.4em] text-[#B83A32] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B83A32]" />
              <span>CLASSIFIED DOSSIER VAULT</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B83A32]" />
            </div>

            <h2
              className="cz-reveal font-display text-7xl sm:text-9xl tracking-[0.06em] leading-[0.85] text-[#E8E3D9]"
              style={{ transitionDelay: '100ms' }}
            >
              THE ARCHIVE
            </h2>

            <p
              className="cz-reveal font-serif italic text-2xl sm:text-3xl lg:text-4xl text-[#E8E3D9]/90 max-w-2xl mx-auto"
              style={{ transitionDelay: '200ms' }}
            >
              Multiple cases. Countless unanswered questions.
            </p>

            <p
              className="cz-reveal font-mono text-xs tracking-[0.3em] text-[#93969B] uppercase pt-2"
              style={{ transitionDelay: '280ms' }}
            >
              Choose your investigation.
            </p>
          </div>

          {/* ── Archive Controls: Search, Filter, Room Code ── */}
          <div className="relative max-w-6xl mx-auto mb-16 flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#ede5d8]/10 font-mono text-[10px] tracking-[0.25em] uppercase">
            {/* Filter buttons */}
            <div className="flex items-center gap-6">
              {[
                { key: 'all', label: `All Files (${cases?.length ?? 0})` },
                { key: 'open', label: 'Open Dossiers' },
                { key: 'sealed', label: 'Sealed / Restricted' },
              ].map((b) => (
                <button
                  key={b.key}
                  onClick={() => setFilter(b.key)}
                  className={`cz-underline pb-1 transition-colors ${
                    filter === b.key ? 'text-[#E8E3D9] font-bold' : 'text-[#93969B] hover:text-[#E8E3D9]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Search and Room Join */}
            <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2 border-b border-[#303239] focus-within:border-[#C9BDA7] py-1 transition-colors">
                <Search className="w-3.5 h-3.5 text-[#93969B]" />
                <input
                  type="text"
                  placeholder="SEARCH FILES"
                  aria-label="Search case files"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-36 bg-transparent text-[#E8E3D9] placeholder:text-[#93969B]/50 focus:outline-none"
                />
              </div>

              {/* Multiplayer room connector */}
              <form onSubmit={handleJoin} className="flex items-center gap-2">
                <label htmlFor="landing-room-code" className="sr-only">Room Code</label>
                <input
                  id="landing-room-code"
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  className="w-28 bg-transparent border-b border-[#303239] focus:border-[#C9BDA7] py-1 text-center text-[#E8E3D9] placeholder:text-[#93969B]/50 focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  className="cz-underline text-[#C9BDA7] hover:text-[#E8E3D9] pb-1 transition-colors"
                >
                  Join →
                </button>
              </form>
            </div>
          </div>

          {/* ── Case Cards List ── */}
          {loadingCases && (
            <div className="py-32 text-center font-mono text-[11px] tracking-[0.4em] text-[#93969B] uppercase cz-breath">
              Decrypting archive files…
            </div>
          )}

          {caseError && !loadingCases && (
            <div className="max-w-md mx-auto py-24 text-center space-y-5">
              <p className="font-mono text-[10px] tracking-[0.4em] text-[#B83A32] uppercase">
                Archive Connection Failure
              </p>
              <p className="font-serif text-2xl text-[#E8E3D9]">Could not load case dossiers.</p>
              <p className="font-mono text-xs text-[#93969B]">{caseError}</p>
              <button
                onClick={() => window.location.reload()}
                className="cz-underline font-mono text-[11px] tracking-[0.3em] uppercase text-[#C9BDA7] pb-1"
              >
                Retry Decryption
              </button>
            </div>
          )}

          {!loadingCases && !caseError && (
            <div className="relative max-w-6xl mx-auto space-y-28 lg:space-y-36">
              {filteredCases?.map((c, i) => (
                <CaseFile key={c._id || c.caseNumber} c={c} index={i} />
              ))}

              {filteredCases?.length === 0 && (
                <div className="py-24 text-center space-y-3">
                  <p className="font-mono text-[10px] tracking-[0.4em] text-[#93969B] uppercase">
                    No dossier matches query
                  </p>
                  <p className="font-serif italic text-xl text-[#E8E3D9]/70">
                    Try another search term or reset filters.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ── Screen Fade Threshold ── */}
      {crossing && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[70] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(201,189,167,0.16) 0%, #08090B 38%)',
            animation: 'czFadeScreen 800ms ease forwards',
          }}
        />
      )}
    </div>
  );
}
