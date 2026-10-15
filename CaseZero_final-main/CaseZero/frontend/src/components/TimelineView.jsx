import { Clock, Lock, Check, ArrowDown, Sparkles } from 'lucide-react';

export function TimelineView({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-12 text-center bg-[#141311] border border-[#ede5d8]/10 space-y-3">
        <Clock className="w-8 h-8 text-[#ede5d8]/30 mx-auto" />
        <h3 className="font-serif text-xl text-[#ede5d8]">Chronology Incomplete</h3>
        <p className="text-xs font-mono text-[#ede5d8]/50">
          Recover more physical evidence to reconstruct the sequence of events.
        </p>
      </div>
    );
  }

  const unlockedCount = timeline.filter(t => t.unlocked).length;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ede5d8]/10">
        <div>
          <div className="text-[10px] font-mono tracking-[0.2em] text-[#c89b4e] uppercase font-bold">
            FORENSIC CHRONOLOGY // CAUSAL SEQUENCE
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#ede5d8] mt-0.5">
            Chronology of Events
          </h2>
        </div>

        <div className="text-xs font-mono text-[#ede5d8]/60 flex items-center gap-2">
          <span>RECONSTRUCTED: </span>
          <span className="text-[#c89b4e] font-bold">{unlockedCount} / {timeline.length} TIMESTAMPS</span>
        </div>
      </div>

      {/* Cinematic Vertical Flow (NO BOXES) */}
      <div className="relative max-w-4xl mx-auto py-6">
        
        {/* Continuous Center-Left Thread */}
        <div className="absolute left-6 sm:left-28 top-4 bottom-4 w-px bg-gradient-to-b from-[#c89b4e]/60 via-[#ede5d8]/20 to-[#c89b4e]/30" />

        <div className="space-y-12">
          {timeline.map((item, idx) => {
            const isPivotal = item.time === '21:30' || item.time === '21:47' || item.time === '22:15';

            return (
              <div 
                key={item.id || idx}
                className={`relative flex items-start gap-6 sm:gap-12 group ${
                  item.unlocked ? 'opacity-100' : 'opacity-40'
                }`}
              >
                
                {/* 1. Large Timestamp (Left) */}
                <div className="w-16 sm:w-24 text-right shrink-0">
                  <div className={`font-mono text-sm sm:text-base font-bold tracking-wider ${
                    isPivotal ? 'text-[#c89b4e]' : 'text-[#ede5d8]/80'
                  }`}>
                    {item.time}
                  </div>
                  {item.date && (
                    <span className="text-[9px] font-mono text-[#ede5d8]/40 block uppercase">
                      {item.date}
                    </span>
                  )}
                </div>

                {/* 2. Timeline Marker Node */}
                <div className="relative z-10 shrink-0 mt-1">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                    item.unlocked
                      ? isPivotal
                        ? 'bg-[#c89b4e] border-[#ede5d8] shadow-[0_0_12px_rgba(200,155,78,0.8)]'
                        : 'bg-[#141311] border-[#c89b4e]'
                      : 'bg-[#080706] border-[#ede5d8]/30'
                  }`}>
                    {item.unlocked && (
                      <div className="w-1 h-1 rounded-full bg-[#080706]" />
                    )}
                  </div>
                </div>

                {/* 3. Event Description (No Box, Pure Typography & Dividers) */}
                <div className="flex-1 pb-4 border-b border-[#ede5d8]/10 space-y-2">
                  
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className={`font-serif text-lg sm:text-2xl leading-tight ${
                      isPivotal ? 'text-[#ede5d8] font-bold' : 'text-[#ede5d8]'
                    }`}>
                      {item.unlocked ? item.title : 'Incident Timestamp Classified'}
                    </h3>

                    <div className="text-[10px] font-mono">
                      {item.unlocked ? (
                        <span className="text-emerald-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                          <Check className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="text-[#c89b4e] tracking-wider uppercase flex items-center gap-1">
                          <Lock className="w-3 h-3" /> REQUIRES EXHIBIT #{item.unlockedBy?.toUpperCase() || 'SEARCH'}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.unlocked ? (
                    <p className="font-sans text-sm text-[#ede5d8]/75 leading-relaxed font-light">
                      {item.description}
                    </p>
                  ) : (
                    <div className="text-xs font-mono text-[#ede5d8]/30 italic">
                      [CLASSIFIED // Forensic examination of the crime scene required to deduce this event]
                    </div>
                  )}

                  {/* Connected exhibit marker */}
                  {item.unlocked && item.unlockedBy && (
                    <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-[#c89b4e]">
                      <span>CORROBORATED BY:</span>
                      <span className="px-1.5 py-0.5 bg-[#141311] border border-[#c89b4e]/30 uppercase font-bold">
                        EXHIBIT #{item.unlockedBy.toUpperCase()}
                      </span>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
