import { useState } from 'react';
import { 
  Puzzle as PuzzleIcon, 
  Check, 
  HelpCircle, 
  Lightbulb, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { playSound } from '../utils/sound.js';

export function PuzzleConsole({ 
  puzzles = [], 
  onSolve, 
  isCompleted = false 
}) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittingPuzzle, setSubmittingPuzzle] = useState(null);
  const [feedback, setFeedback] = useState({});

  if (!puzzles || puzzles.length === 0) {
    return (
      <div className="p-12 text-center bg-[#141311] border border-[#ede5d8]/10 space-y-3">
        <PuzzleIcon className="w-8 h-8 text-[#ede5d8]/30 mx-auto" />
        <h3 className="font-serif text-xl text-[#ede5d8]">No Puzzles Pending</h3>
        <p className="text-xs font-mono text-[#ede5d8]/50">All deductive challenges for this case have been established.</p>
      </div>
    );
  }

  const handleSelectOption = (puzzleId, optionIdx) => {
    playSound.click();
    setSelectedAnswers(prev => ({ ...prev, [puzzleId]: optionIdx }));
    setFeedback(prev => ({ ...prev, [puzzleId]: null }));
  };

  const handleSubmit = async (puzzle) => {
    const selectedOption = selectedAnswers[puzzle._id];
    if (selectedOption === undefined || puzzle.solved || isCompleted) return;

    setSubmittingPuzzle(puzzle._id);
    setFeedback(prev => ({ ...prev, [puzzle._id]: null }));

    try {
      const res = await onSolve(puzzle._id, selectedOption);
      if (res.correct) {
        playSound.puzzleSuccess();
        setFeedback(prev => ({
          ...prev,
          [puzzle._id]: {
            type: 'success',
            text: 'DEDUCTION CONFIRMED. Your hypothesis reconciles the physical timeline with forensic certainty.'
          }
        }));
      } else {
        playSound.puzzleWrong();
        setFeedback(prev => ({
          ...prev,
          [puzzle._id]: {
            type: 'error',
            text: res.hint 
              ? `HYPOTHESIS REJECTED. Forensic discrepancy detected. Clue Hint: "${res.hint}"`
              : 'HYPOTHESIS REJECTED. This explanation contradicts the physical evidence timestamps.'
          }
        }));
      }
    } catch (err) {
      playSound.puzzleWrong();
      setFeedback(prev => ({
        ...prev,
        [puzzle._id]: {
          type: 'error',
          text: err.message || 'Submission error.'
        }
      }));
    } finally {
      setSubmittingPuzzle(null);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ede5d8]/10">
        <div>
          <div className="text-[10px] font-mono tracking-[0.2em] text-[#c89b4e] uppercase font-bold">
            CRIME RECONSTRUCTION // LOGICAL DEDUCTIONS
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#ede5d8] mt-0.5">
            Deductive Challenges
          </h2>
        </div>

        <div className="text-xs font-mono text-[#ede5d8]/60">
          SOLVED: <span className="text-emerald-400 font-bold">{puzzles.filter(p => p.solved).length} / {puzzles.length}</span>
        </div>
      </div>

      {/* Puzzles List */}
      <div className="space-y-12">
        {puzzles.map((p, pIdx) => {
          const isSolved = p.solved;
          const currentAnswer = selectedAnswers[p._id];
          const puzzleFb = feedback[p._id];

          return (
            <div 
              key={p._id || pIdx}
              className={`p-6 sm:p-8 border transition-all ${
                isSolved 
                  ? 'bg-[#141311] border-[#c89b4e]/40 shadow-xl'
                  : 'bg-[#141311] border-[#ede5d8]/15 shadow-2xl'
              }`}
            >
              
              {/* Puzzle Header Bar */}
              <div className="flex items-center justify-between border-b border-[#ede5d8]/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#c89b4e] font-bold">
                    PUZZLE {String(pIdx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[#ede5d8]/20">•</span>
                  <span className="text-xs font-mono text-[#ede5d8]/50 uppercase">
                    TYPE: {p.type || 'DEDUCTION'}
                  </span>
                </div>

                <div>
                  {isSolved ? (
                    <div className="stamp text-[10px] px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/50">
                      DEDUCTION CONFIRMED
                    </div>
                  ) : (
                    <div className="stamp stamp-classified text-[10px] px-2 py-0.5">
                      UNRESOLVED
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Narrative Framing */}
              <div className="space-y-3 mb-8">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#ede5d8] leading-tight font-semibold">
                  {p.title}
                </h3>
                <p className="font-sans text-sm sm:text-base text-[#ede5d8]/80 leading-relaxed font-light">
                  {p.question}
                </p>
              </div>

              {/* Choices Presentation */}
              <div className="space-y-3 mb-6">
                {p.options?.map((opt, optIdx) => {
                  const isChecked = currentAnswer === optIdx;
                  
                  return (
                    <div
                      key={optIdx}
                      onClick={() => !isSolved && !isCompleted && handleSelectOption(p._id, optIdx)}
                      className={`p-4 border transition-all flex items-start gap-4 select-none ${
                        isSolved
                          ? 'border-[#ede5d8]/10 bg-[#0e0d0c] opacity-80 cursor-default'
                          : isChecked
                          ? 'border-[#c89b4e] bg-[#1c1a17] shadow-md cursor-pointer'
                          : 'border-[#ede5d8]/10 bg-[#0e0d0c] hover:border-[#ede5d8]/30 hover:bg-[#161412] cursor-pointer'
                      }`}
                    >
                      {/* Letter Marker */}
                      <div className={`w-6 h-6 shrink-0 flex items-center justify-center font-mono text-xs font-bold border ${
                        isChecked 
                          ? 'bg-[#c89b4e] text-[#080706] border-[#c89b4e]' 
                          : 'border-[#ede5d8]/20 text-[#ede5d8]/50'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>

                      <div className="flex-1 text-sm font-sans text-[#ede5d8] leading-normal pt-0.5">
                        {opt}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {puzzleFb && (
                <div className={`p-4 text-xs font-mono border mb-6 flex items-start gap-2.5 animate-fadeIn ${
                  puzzleFb.type === 'success'
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                    : 'bg-[#7f2222]/20 border-[#7f2222] text-red-300'
                }`}>
                  <div className="mt-0.5">
                    {puzzleFb.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                  <span className="leading-relaxed">{puzzleFb.text}</span>
                </div>
              )}

              {/* Submit CTA */}
              {!isSolved && (
                <div className="pt-4 border-t border-[#ede5d8]/10 flex items-center justify-between">
                  <div className="text-xs font-mono text-[#ede5d8]/40">
                    {currentAnswer !== undefined ? 'HYPOTHESIS SELECTED' : 'CHOOSE AN EXPLANATION'}
                  </div>

                  <button
                    onClick={() => handleSubmit(p)}
                    disabled={currentAnswer === undefined || submittingPuzzle === p._id || isCompleted}
                    className={`px-6 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
                      currentAnswer !== undefined && submittingPuzzle !== p._id && !isCompleted
                        ? 'bg-[#c89b4e] text-[#080706] hover:bg-[#dfb368] shadow-[0_2px_15px_rgba(200,155,78,0.25)]'
                        : 'border border-[#ede5d8]/15 text-[#ede5d8]/30 cursor-not-allowed'
                    }`}
                  >
                    <span>{submittingPuzzle === p._id ? 'TESTING HYPOTHESIS...' : 'SUBMIT DEDUCTION'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
