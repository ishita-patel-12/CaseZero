import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth.js';
import { isAudioEnabled, toggleAudio } from '../utils/sound.js';
import { BRAND_ASSETS } from '../utils/caseMedia.js';
import { 
  FolderArchive, 
  KeyRound, 
  Volume2, 
  VolumeX, 
  LogOut, 
  ShieldAlert,
  Radio
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [audioOn, setAudioOn] = useState(isAudioEnabled());
  const [quickCode, setQuickCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAudioToggle = () => {
    const newState = toggleAudio();
    setAudioOn(newState);
  };

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (quickCode.trim()) {
      navigate(`/join?code=${quickCode.trim().toUpperCase()}`);
      setShowCodeInput(false);
      setQuickCode('');
    }
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <header
      className={`sticky top-0 z-40 px-6 lg:px-12 py-3.5 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#080706]/95 backdrop-blur-md border-[#ede5d8]/10 shadow-[0_8px_30px_rgba(0,0,0,0.8)]'
          : 'bg-[#0e0d0c]/80 backdrop-blur-sm border-[#ede5d8]/6'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-3.5">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <img 
              src={BRAND_ASSETS.emblem} 
              alt="CaseZero Seal" 
              className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg tracking-[0.2em] font-bold text-[#ede5d8] group-hover:text-[#c89b4e] transition-colors leading-none">
                CASEZERO
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
            <span className="text-[9px] tracking-[0.24em] uppercase text-[#ede5d8]/40 font-mono block mt-0.5">
              Investigative Command
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/cases"
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-colors ${
              isActive('/cases')
                ? 'text-[#c89b4e] border-b border-[#c89b4e]'
                : 'text-[#ede5d8]/65 hover:text-[#ede5d8]'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Case Archives</span>
          </Link>

          <Link
            to="/join"
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-colors ${
              isActive('/join')
                ? 'text-[#c89b4e] border-b border-[#c89b4e]'
                : 'text-[#ede5d8]/65 hover:text-[#ede5d8]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Enter Room</span>
          </Link>

          {/* Quick Room Code Input */}
          <div className="relative hidden md:block ml-2">
            {showCodeInput ? (
              <form onSubmit={handleQuickJoin} className="flex items-center animate-fadeIn">
                <input
                  type="text"
                  placeholder="ROOM CODE"
                  maxLength={6}
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                  autoFocus
                  className="bg-[#141311] border border-[#c89b4e] text-xs font-mono px-2.5 py-1 text-[#ede5d8] tracking-widest w-28 uppercase focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#c89b4e] text-[#080706] text-xs font-mono px-2.5 py-1 font-bold hover:bg-[#dfb368] transition-colors"
                >
                  JOIN
                </button>
                <button
                  type="button"
                  onClick={() => setShowCodeInput(false)}
                  className="bg-[#141311] border border-l-0 border-[#ede5d8]/15 text-[#ede5d8]/40 hover:text-[#ede5d8] text-xs px-2 py-1"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowCodeInput(true)}
                className="text-[11px] font-mono tracking-widest text-[#ede5d8]/40 hover:text-[#c89b4e] px-2 py-1 border border-dashed border-[#ede5d8]/15 hover:border-[#c89b4e]/40 transition-colors"
                title="Enter 6-digit room code"
              >
                #CODE
              </button>
            )}
          </div>

          <div className="h-4 w-px bg-[#ede5d8]/10 mx-2" />

          {/* Audio Feedback Toggle */}
          <button
            onClick={handleAudioToggle}
            title={audioOn ? 'Audio active (click to mute)' : 'Audio muted (click to enable)'}
            className="p-1.5 text-[#ede5d8]/40 hover:text-[#c89b4e] transition-colors"
            aria-label="Toggle investigative sound effects"
          >
            {audioOn ? <Volume2 className="w-4 h-4 text-[#c89b4e]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* User / Authentication Status */}
          {user ? (
            <div className="flex items-center gap-3 ml-2 pl-2 border-l border-[#ede5d8]/10">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-mono text-[#ede5d8] font-medium flex items-center justify-end gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{user.username}</span>
                </div>
                <div className="text-[10px] font-mono text-[#ede5d8]/40 tracking-wider">
                  {user.role === 'admin' ? 'LEAD ARCHIVIST' : 'INVESTIGATOR'}
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out of command session"
                className="p-1.5 text-[#ede5d8]/40 hover:text-[#9c3232] transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <Link
                to="/login"
                className="text-xs font-mono tracking-wider uppercase text-[#ede5d8]/60 hover:text-[#ede5d8] transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-xs font-mono tracking-wider uppercase px-3 py-1 border border-[#c89b4e]/60 text-[#c89b4e] hover:bg-[#c89b4e] hover:text-[#080706] transition-all font-semibold"
              >
                Enroll
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
