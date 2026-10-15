import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  FileCheck, 
  FolderArchive, 
  X, 
  RotateCcw, 
  Users, 
  HelpCircle, 
  Share2 
} from 'lucide-react';
import { playSound } from '../utils/sound.js';

export function CaseClosedModal({ 
  outcome, 
  stats = {}, 
  participants = [], 
  caseTitle, 
  caseNumber, 
  onClose 
}) {
  useEffect(() => {
    playSound.puzzleSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c89b4e', '#ede5d8', '#822727']
      });
    } catch {
      // safe fallback
    }
  }, []);

  const isTrueEnding = outcome?.toLowerCase().includes('case closed') || outcome?.toLowerCase().includes('conviction') || outcome?.toLowerCase().includes('truth');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#171513] border-2 border-[#c89b4e]/50 rounded-lg shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-[#ede5d8]/50 hover:text-[#ede5d8] transition-colors"
          aria-label="Close debrief"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Stamps */}
        <div className="flex flex-col items-center">
          <div className="stamp stamp-red text-xs px-3 py-1 mb-2">
            OFFICIAL CASE CONCLUSION
          </div>
          <span className="text-xs font-mono tracking-widest text-[#ede5d8]/50 uppercase">
            {caseNumber} • {caseTitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#ede5d8] mt-2">
            {isTrueEnding ? 'TRUTH ESTABLISHED' : 'CASE CONCLUDED'}
          </h2>
        </div>

        {/* Outcome Briefing */}
        <div className="p-5 rounded bg-[#12100e] border border-[#ede5d8]/10 text-left">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#c89b4e] block mb-1">
            FINAL VERDICT DISPOSITION
          </span>
          <p className="font-serif text-base sm:text-lg text-[#ede5d8]/90 leading-relaxed">
            {outcome || 'The team concluded its investigation and submitted final exhibits to the department.'}
          </p>
        </div>

        {/* Investigation Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded bg-[#12100e] border border-[#ede5d8]/5">
            <span className="text-[10px] font-mono text-[#ede5d8]/40 uppercase block">Evidence</span>
            <span className="font-mono text-xl font-bold text-[#c89b4e]">
              {stats.foundEvidence || 0} / {stats.totalEvidence || 0}
            </span>
          </div>
          <div className="p-3 rounded bg-[#12100e] border border-[#ede5d8]/5">
            <span className="text-[10px] font-mono text-[#ede5d8]/40 uppercase block">Clues Linked</span>
            <span className="font-mono text-xl font-bold text-emerald-400">
              {stats.foundClues || 0}
            </span>
          </div>
          <div className="p-3 rounded bg-[#12100e] border border-[#ede5d8]/5">
            <span className="text-[10px] font-mono text-[#ede5d8]/40 uppercase block">Puzzles Solved</span>
            <span className="font-mono text-xl font-bold text-[#dfb368]">
              {stats.solvedPuzzles || 0}
            </span>
          </div>
          <div className="p-3 rounded bg-[#12100e] border border-[#ede5d8]/5">
            <span className="text-[10px] font-mono text-[#ede5d8]/40 uppercase block">Detectives</span>
            <span className="font-mono text-xl font-bold text-[#ede5d8]">
              {participants.length || 1}
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded border border-[#ede5d8]/20 text-xs font-mono uppercase tracking-wider text-[#ede5d8]/80 hover:bg-[#1f1c18] transition-colors"
          >
            Review Evidence Board
          </button>
          <Link
            to="/cases"
            className="w-full sm:w-auto px-6 py-2.5 rounded bg-[#c89b4e] text-[#12100e] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#dfb368] transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <FolderArchive className="w-4 h-4" />
            Return to Case Library
          </Link>
        </div>
      </div>
    </div>
  );
}
