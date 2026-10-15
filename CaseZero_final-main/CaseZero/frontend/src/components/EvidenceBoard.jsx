import { useState } from 'react';
import { 
  Pin, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Eye, 
  FileText, 
  Camera, 
  CreditCard, 
  Ticket,
  ArrowRight,
  GitCommit
} from 'lucide-react';
import { playSound } from '../utils/sound.js';

export function EvidenceBoard({ 
  evidence = [], 
  connections = [], 
  clues = [], 
  onConnect, 
  onInspectEvidence, 
  isCompleted = false 
}) {
  const [selected, setSelected] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const foundEvidence = evidence.filter(e => !e.locked);

  const toggleSelect = (key) => {
    if (isCompleted) return;
    playSound.click();

    setSelected(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      }
      if (prev.length >= 2) {
        return [prev[1], key];
      }
      return [...prev, key];
    });
  };

  const handleConnect = async () => {
    if (selected.length !== 2 || isCompleted || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await onConnect(selected[0], selected[1]);
      if (result?.found) {
        playSound.clueUnlocked();
        setFeedback({
          type: 'success',
          text: `DEDUCTION CONFIRMED: "${result.found}"`
        });
      } else {
        playSound.click();
        setFeedback({
          type: 'info',
          text: 'Connection registered in case log, but no breakthrough deduction was formed.'
        });
      }
      setSelected([]);
    } catch (err) {
      playSound.puzzleWrong();
      setFeedback({
        type: 'error',
        text: err.message || 'Unable to connect selected evidence.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEvidenceItem = (key) => evidence.find(e => e.key === key);

  return (
    <div className="space-y-8">
      
      {/* ─── Board Header & Action Bar ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#ede5d8]/10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-[#c89b4e] uppercase font-bold">
            <Pin className="w-3.5 h-3.5 text-[#c89b4e]" />
            <span>INVESTIGATIVE REASONING WALL</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#ede5d8] mt-0.5">
            Evidence Correlation Board
          </h2>
        </div>

        {/* Deduction Connection Button */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-[#ede5d8]/60 hidden sm:block">
            {selected.length === 0 && 'SELECT 2 EXHIBITS'}
            {selected.length === 1 && 'SELECT 1 MORE EXHIBIT'}
            {selected.length === 2 && 'PAIR READY FOR TEST'}
          </div>

          <button
            onClick={handleConnect}
            disabled={selected.length !== 2 || isSubmitting || isCompleted}
            className={`px-5 py-2.5 font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
              selected.length === 2 && !isSubmitting && !isCompleted
                ? 'bg-[#c89b4e] text-[#080706] hover:bg-[#dfb368] shadow-[0_2px_15px_rgba(200,155,78,0.3)]'
                : 'border border-[#ede5d8]/15 text-[#ede5d8]/30 cursor-not-allowed'
            }`}
          >
            <span>{isSubmitting ? 'DEDUCING...' : 'LINK EXHIBITS'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 text-xs font-mono border flex items-center justify-between animate-fadeDown ${
          feedback.type === 'success'
            ? 'bg-[#c89b4e]/15 border-[#c89b4e] text-[#dfb368]'
            : feedback.type === 'error'
            ? 'bg-[#7f2222]/20 border-[#7f2222] text-red-300'
            : 'bg-[#141311] border-[#ede5d8]/20 text-[#ede5d8]/80'
        }`}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ─── THE CORRELATION CANVAS ─── */}
      <div className="relative min-h-[460px] bg-[#0c0a09] border border-[#ede5d8]/15 p-6 sm:p-10 shadow-2xl overflow-hidden">
        
        {/* Subtle Corkboard / Canvas Texture */}
        <div className="absolute inset-0 pinboard-grid opacity-35 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(6,5,4,0.7)_100%)] pointer-events-none" />

        {/* When no evidence found yet */}
        {foundEvidence.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <Pin className="w-8 h-8 text-[#ede5d8]/20" />
            <h3 className="font-serif text-xl text-[#ede5d8]/60">The Board is Bare</h3>
            <p className="font-mono text-xs text-[#ede5d8]/40 max-w-sm">
              Search the crime scene to recover physical exhibits. Once secured, they will appear here for causal correlation.
            </p>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foundEvidence.map((e) => {
              const isSelected = selected.includes(e.key);
              const isConnected = connections.some(c => c.a === e.key || c.b === e.key);

              return (
                <div
                  key={e.key}
                  onClick={() => toggleSelect(e.key)}
                  className={`relative p-5 transition-all duration-200 cursor-pointer select-none border ${
                    isSelected
                      ? 'bg-[#1c1a17] border-[#c89b4e] ring-2 ring-[#c89b4e]/40 shadow-[0_8px_30px_rgba(200,155,78,0.2)] transform -translate-y-1'
                      : 'bg-[#141311] border-[#ede5d8]/15 hover:border-[#c89b4e]/50 hover:bg-[#1a1714]'
                  }`}
                >
                  {/* Push Pin Visual */}
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                    <div className={`w-3.5 h-3.5 rounded-full border border-black/40 shadow-md ${
                      isSelected ? 'bg-[#c89b4e]' : isConnected ? 'bg-[#9c3232]' : 'bg-[#ede5d8]'
                    }`} />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#ede5d8]/50 border-b border-[#ede5d8]/10 pb-2 mb-3">
                    <span className="text-[#c89b4e] font-bold">
                      EXHIBIT #{e.key?.toUpperCase()}
                    </span>
                    <span className="uppercase text-[#ede5d8]/40">
                      {e.type}
                    </span>
                  </div>

                  {/* Title & Content */}
                  <div className="font-serif text-lg text-[#ede5d8] mb-2 leading-snug">
                    {e.title}
                  </div>
                  <p className="text-xs font-mono text-[#ede5d8]/65 line-clamp-3 leading-relaxed">
                    {e.content}
                  </p>

                  {/* Footer & Actions */}
                  <div className="pt-4 mt-3 border-t border-[#ede5d8]/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#ede5d8]/40">
                      {e.hotspot}
                    </span>
                    
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        playSound.click();
                        onInspectEvidence(e);
                      }}
                      className="text-[#c89b4e] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Eye className="w-3 h-3" />
                      <span>INSPECT</span>
                    </button>
                  </div>

                  {/* Selected Indicator Tag */}
                  {isSelected && (
                    <div className="absolute -bottom-2.5 right-4 bg-[#c89b4e] text-[#080706] text-[9px] font-mono font-bold px-2 py-0.5 shadow-md">
                      SELECTED FOR DEDUCTION
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ─── DEDUCED CLUES LEDGER ─── */}
      <div className="space-y-4 pt-4 border-t border-[#ede5d8]/10">
        <div className="flex items-center justify-between text-xs font-mono text-[#ede5d8]/50 uppercase tracking-wider">
          <span className="text-[#ede5d8] font-bold">
            Confirmed Clues & Deductions ({clues.length})
          </span>
          <span>Causal Proof Ledger</span>
        </div>

        {clues.length === 0 ? (
          <div className="p-6 bg-[#141311] border border-dashed border-[#ede5d8]/15 text-center text-xs font-mono text-[#ede5d8]/50 space-y-1">
            <div className="text-[#c89b4e] font-bold">NO CONFIRMED CLUES YET</div>
            <p>Select pairs of exhibits on the board above to test deductions and unmask hidden causal threads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clues.map((clue) => (
              <div 
                key={clue.key || clue.title}
                className="p-5 bg-[#141311] border border-[#c89b4e]/40 shadow-lg space-y-3 relative"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#c89b4e] font-bold border-b border-[#ede5d8]/10 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>DEDUCTION ESTABLISHED</span>
                  </span>
                  <span className="text-[#ede5d8]/40">CLUE #{clue.key?.toUpperCase()}</span>
                </div>

                <h3 className="font-serif text-lg text-[#ede5d8] font-semibold">
                  {clue.title}
                </h3>

                <p className="text-xs font-sans text-[#ede5d8]/75 leading-relaxed font-light">
                  {clue.description}
                </p>

                {/* Evidence links */}
                {clue.relatedEvidence && (
                  <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-[#ede5d8]/40">
                    <span>CORRELATED:</span>
                    {clue.relatedEvidence.map(key => (
                      <span key={key} className="px-1.5 py-0.5 bg-[#1f1c18] border border-[#ede5d8]/10 text-[#c89b4e]">
                        #{key.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
