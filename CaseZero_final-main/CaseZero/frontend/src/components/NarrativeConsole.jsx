import { useState } from 'react';
import { 
  GitBranch, 
  Lock, 
  ArrowRight, 
  Award, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { playSound } from '../utils/sound.js';

export function NarrativeConsole({ 
  node, 
  decisions = [], 
  clues = [], 
  onChoice, 
  isCompleted = false, 
  onReviewEnding 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!node) {
    return (
      <div className="p-12 text-center bg-[#141311] border border-[#ede5d8]/10 space-y-3">
        <GitBranch className="w-8 h-8 text-[#ede5d8]/30 mx-auto" />
        <h3 className="font-serif text-xl text-[#ede5d8]">Narrative Concluded</h3>
        <p className="text-xs font-mono text-[#ede5d8]/50">The investigation file has arrived at its final resolution.</p>
      </div>
    );
  }

  const handleMakeChoice = async (choiceIdx) => {
    if (isCompleted || isSubmitting) return;

    setIsSubmitting(true);
    playSound.dossierOpen();
    try {
      await onChoice(choiceIdx);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ede5d8]/10">
        <div>
          <div className="text-[10px] font-mono tracking-[0.2em] text-[#c89b4e] uppercase font-bold">
            INVESTIGATION SCENARIO // BRANCHING DILEMMA
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#ede5d8] mt-0.5">
            Case Narrative & Decision Stage
          </h2>
        </div>

        <div>
          {node.ending ? (
            <div className="stamp stamp-red text-xs px-2.5 py-0.5">
              VERDICT REACHED
            </div>
          ) : (
            <div className="text-xs font-mono text-[#c89b4e] font-semibold">
              DECISION ACTIVE
            </div>
          )}
        </div>
      </div>

      {/* Main Narrative Stage */}
      <div className="bg-[#141311] border border-[#ede5d8]/15 p-6 sm:p-10 shadow-2xl space-y-8">
        
        {/* Scenario Title & Content */}
        <div className="space-y-4">
          <div className="text-xs font-mono text-[#ede5d8]/40 tracking-wider">
            SCENARIO NODE: #{node.key?.toUpperCase() || 'STAGE'}
          </div>
          <h3 className="font-serif text-3xl sm:text-4xl text-[#ede5d8] leading-tight font-semibold">
            {node.title}
          </h3>
          <p className="font-serif text-lg sm:text-xl text-[#ede5d8]/85 leading-relaxed font-light italic bg-[#0e0d0c] p-6 border-l-2 border-[#c89b4e]">
            "{node.content}"
          </p>
        </div>

        {/* Narrative Choices (if not an ending) */}
        {!node.ending && !isCompleted ? (
          <div className="space-y-4 pt-4 border-t border-[#ede5d8]/10">
            <div className="text-xs font-mono tracking-widest text-[#c89b4e] uppercase font-bold">
              THE TEAM MUST CHOOSE:
            </div>

            <div className="space-y-3">
              {node.choices?.map((ch, idx) => {
                const isLocked = ch.locked;

                return (
                  <button
                    key={idx}
                    disabled={isLocked || isSubmitting}
                    onClick={() => handleMakeChoice(idx)}
                    className={`w-full text-left p-5 border transition-all flex items-center justify-between gap-4 ${
                      isLocked
                        ? 'bg-[#0e0d0c] border-[#ede5d8]/10 opacity-50 cursor-not-allowed text-[#ede5d8]/40'
                        : 'bg-[#181614] border-[#ede5d8]/20 hover:border-[#c89b4e] hover:bg-[#1f1c18] shadow-md group cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Letter Marker */}
                      <div className={`w-7 h-7 shrink-0 flex items-center justify-center font-mono text-xs font-bold border ${
                        isLocked
                          ? 'border-[#ede5d8]/15 bg-black/40 text-[#ede5d8]/30'
                          : 'border-[#c89b4e]/50 bg-[#141311] text-[#c89b4e] group-hover:border-[#c89b4e]'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>

                      <div className="space-y-1">
                        <div className="font-serif text-lg font-semibold text-[#ede5d8] group-hover:text-[#c89b4e] transition-colors leading-snug">
                          {ch.text}
                        </div>
                        {isLocked && (
                          <div className="text-[11px] font-mono text-[#c89b4e] flex items-center gap-1.5 font-bold">
                            <Lock className="w-3 h-3" />
                            <span>REQUIRES CONFIRMED CLUE: #{ch.requiresClue?.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isLocked && (
                      <ArrowRight className="w-4 h-4 text-[#c89b4e] group-hover:translate-x-1.5 transition-transform shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Ending Result Card */
          <div className="p-6 bg-[#0e0d0c] border border-[#c89b4e]/40 space-y-4">
            <div className="text-xs font-mono text-[#c89b4e] uppercase font-bold tracking-widest">
              CASE CONCLUSION ESTABLISHED
            </div>
            <p className="font-serif text-lg text-[#ede5d8] leading-relaxed">
              {node.outcome || 'Case reached conclusion.'}
            </p>
            <div className="pt-2">
              <button
                onClick={onReviewEnding}
                className="px-6 py-3 bg-[#c89b4e] text-[#080706] font-mono text-xs font-bold tracking-widest uppercase hover:bg-[#dfb368] transition-colors flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>INSPECT CASE CLOSED REPORT</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Decision Trail */}
      {decisions.length > 0 && (
        <div className="p-6 bg-[#141311] border border-[#ede5d8]/10 space-y-3">
          <div className="text-xs font-mono text-[#ede5d8]/50 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#c89b4e]" />
            <span>RECORDED DECISION TRAIL ({decisions.length})</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#ede5d8]/10">
            {decisions.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono text-[#ede5d8]/75">
                <span className="font-serif text-base text-[#ede5d8]">
                  {typeof d === 'string' ? d : d.text}
                </span>
                {typeof d === 'object' && d.decidedBy && (
                  <span className="text-[10px] text-[#ede5d8]/40">
                    decided by {d.decidedBy}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
