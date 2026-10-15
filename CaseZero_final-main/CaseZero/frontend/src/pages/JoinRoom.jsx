import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import { playSound } from '../utils/sound.js';
import { getCaseMedia } from '../utils/caseMedia.js';
import { 
  KeyRound, 
  Users, 
  ArrowRight, 
  Radio, 
  ShieldCheck, 
  Lock,
  ArrowLeft
} from 'lucide-react';

export function JoinRoom() {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialCode && initialCode.length === 6) {
      checkCode(initialCode);
    }
  }, [initialCode]);

  const checkCode = async (targetCode) => {
    if (!targetCode || targetCode.length < 6) return;
    setLoading(true);
    setError('');
    setPreview(null);
    try {
      const data = await api(`/investigations/code/${targetCode.trim().toUpperCase()}`);
      setPreview(data);
      playSound.clueUnlocked();
    } catch (err) {
      setError(err.message || 'Investigation room code not found or closed.');
      playSound.puzzleWrong?.();
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(val);
    if (val.length === 6) {
      checkCode(val);
    } else {
      setPreview(null);
      setError('');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/join?code=${code}`)}`);
      return;
    }
    if (code.length !== 6 || joining) return;

    setJoining(true);
    setError('');
    playSound.dossierOpen();

    try {
      const res = await api('/investigations/join', {
        method: 'POST',
        body: { roomCode: code }
      });
      navigate(`/investigation/${res.investigationId}`);
    } catch (err) {
      setError(err.message || 'Failed to enter investigation room.');
      setJoining(false);
    }
  };

  const media = preview?.caseNumber ? getCaseMedia(preview.caseNumber) : null;

  return (
    <main className="min-h-[85vh] max-w-4xl mx-auto px-6 py-16 flex flex-col justify-center">
      
      <div className="space-y-10">
        
        {/* Header Title */}
        <div className="border-b border-[#ede5d8]/10 pb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-[#c89b4e] uppercase font-bold mb-2">
            <Radio className="w-3.5 h-3.5 text-[#c89b4e] animate-pulse" />
            <span>ENCRYPTED RADIO RELAY</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#ede5d8] tracking-tight">
            Enter Investigation
          </h1>
          <p className="font-sans text-sm text-[#ede5d8]/60 mt-2 max-w-lg font-light">
            Tune to an active crime room frequency to synchronize evidence and collaborate with your investigative team.
          </p>
        </div>

        {/* Room Code Entry - Large Typography */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono tracking-widest text-[#ede5d8]/50 uppercase">
              ROOM CODE (6 CHARACTERS)
            </label>
            {loading && (
              <span className="text-xs font-mono text-[#c89b4e] animate-pulse">
                VALIDATING FREQUENCY...
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              autoFocus
              maxLength={6}
              value={code}
              onChange={handleCodeChange}
              placeholder="e.g. K7M4QX"
              className="w-full bg-[#141311] border-2 border-[#ede5d8]/20 focus:border-[#c89b4e] text-center font-mono text-4xl sm:text-6xl tracking-[0.3em] py-6 text-[#c89b4e] uppercase focus:outline-none transition-colors"
            />
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 bg-[#7f2222]/20 border border-[#7f2222] text-xs font-mono text-red-300">
              <span className="font-bold">FREQUENCY NOT FOUND: </span>
              {error}
            </div>
          )}
        </div>

        {/* Validated Case Preview Section */}
        {preview && (
          <div className="bg-[#141311] border border-[#c89b4e]/40 p-6 sm:p-8 animate-fadeUp space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
                CONNECTION ESTABLISHED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {media?.scene && (
                <div className="sm:col-span-4 aspect-[4/3] bg-black overflow-hidden border border-[#ede5d8]/15">
                  <img
                    src={media.scene}
                    alt={preview.caseTitle}
                    className="w-full h-full object-cover grayscale contrast-125"
                  />
                </div>
              )}

              <div className={`${media?.scene ? 'sm:col-span-8' : 'sm:col-span-12'} space-y-2`}>
                <div className="text-xs font-mono text-[#c89b4e]">
                  {preview.caseNumber} • ROOM #{preview.roomCode}
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#ede5d8]">
                  {preview.caseTitle}
                </h2>
                <div className="flex items-center gap-2 text-xs font-mono text-[#ede5d8]/60 pt-1">
                  <Users className="w-3.5 h-3.5 text-[#c89b4e]" />
                  <span>{preview.participantCount} INVESTIGATOR{preview.participantCount === 1 ? '' : 'S'} PRESENT</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-4 bg-[#c89b4e] text-[#080706] font-mono text-xs font-bold tracking-widest uppercase hover:bg-[#dfb368] transition-colors flex items-center justify-center gap-2"
              >
                <span>{joining ? 'LINKING FREQUENCY...' : 'JOIN CASE ROOM'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="pt-6 border-t border-[#ede5d8]/10 flex items-center justify-between text-xs font-mono text-[#ede5d8]/40">
          <Link to="/cases" className="hover:text-[#ede5d8] uppercase">
            ← Browse Case Archives
          </Link>
          <span>CASEZERO PROTOCOL V2</span>
        </div>

      </div>

    </main>
  );
}
