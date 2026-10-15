import { useState } from 'react';
import { 
  User, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Eye,
  Link2,
  Fingerprint
} from 'lucide-react';
import { playSound } from '../utils/sound.js';
import { getSuspectAvatar } from '../utils/caseMedia.js';

export function SuspectsView({ suspects = [], onInspectEvidence, caseNumber = 'CZ-001' }) {
  const [selectedId, setSelectedId] = useState(suspects[0]?.id || null);

  if (!suspects || suspects.length === 0) {
    return (
      <div className="p-12 text-center bg-[#141311] border border-[#ede5d8]/10 space-y-3">
        <User className="w-8 h-8 text-[#ede5d8]/30 mx-auto" />
        <h3 className="font-serif text-xl text-[#ede5d8]">Suspect Records Sealed</h3>
        <p className="text-xs font-mono text-[#ede5d8]/50">No suspect dossiers have been linked to this case file.</p>
      </div>
    );
  }

  const current = suspects.find(s => s.id === selectedId) || suspects[0];
  const avatarUrl = getSuspectAvatar(caseNumber, current.id);

  const getSuspicionStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'stamp-red text-[#a83636] border-[#7f2222]';
      case 'high':
        return 'stamp-gold text-[#dfb368] border-[#c89b4e]';
      default:
        return 'text-[#ede5d8]/60 border-[#ede5d8]/20 bg-[#141311]';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ede5d8]/10">
        <div>
          <div className="text-[10px] font-mono tracking-[0.2em] text-[#c89b4e] uppercase font-bold">
            PERSONS OF INTEREST // DOSSIER REGISTRY
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#ede5d8] mt-0.5">
            Interrogation & Alibi Records
          </h2>
        </div>
        <div className="text-xs font-mono text-[#ede5d8]/50">
          RECORD COUNT: <span className="text-[#c89b4e] font-bold">{suspects.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ─── LEFT: MINIMAL SUSPECT SELECTOR (4 COLS) ─── */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#ede5d8]/40 block px-1">
            SELECT INVESTIGATIVE DOSSIER
          </span>

          <div className="space-y-2">
            {suspects.map((s) => {
              const isSelected = s.id === current.id;
              const photo = getSuspectAvatar(caseNumber, s.id);

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    playSound.click();
                    setSelectedId(s.id);
                  }}
                  className={`w-full text-left p-3 border transition-all flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-[#1c1a17] border-[#c89b4e] shadow-lg'
                      : 'bg-[#141311] border-[#ede5d8]/10 hover:border-[#ede5d8]/30 hover:bg-[#1a1714]'
                  }`}
                >
                  {/* Photo thumbnail */}
                  <div className="w-12 h-12 bg-black border border-[#ede5d8]/20 shrink-0 overflow-hidden">
                    <img
                      src={photo}
                      alt={s.name}
                      className="w-full h-full object-cover grayscale contrast-125"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-serif text-base truncate ${isSelected ? 'text-[#c89b4e] font-bold' : 'text-[#ede5d8]'}`}>
                        {s.name}
                      </h4>
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 border ${
                        s.suspicionLevel === 'Critical' ? 'text-red-400 border-red-800' :
                        s.suspicionLevel === 'High' ? 'text-amber-400 border-amber-800' :
                        'text-[#ede5d8]/40 border-white/10'
                      }`}>
                        {s.suspicionLevel}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#ede5d8]/50 truncate mt-0.5">
                      {s.role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT: DETAILED POLICE ARCHIVE DOSSIER (8 COLS) ─── */}
        <div className="lg:col-span-8 bg-[#141311] border border-[#ede5d8]/15 shadow-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
          
          {/* Dossier Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#ede5d8]/10">
            <div className="flex gap-6 items-start">
              
              {/* Large Suspect Photo Mugshot */}
              <div className="relative w-28 h-36 sm:w-36 sm:h-44 bg-black border border-[#ede5d8]/30 shrink-0 shadow-xl overflow-hidden group">
                <img
                  src={avatarUrl}
                  alt={current.name}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[8px] font-mono text-center py-0.5 text-[#ede5d8]/70 border-t border-white/10">
                  FILE ID #{current.id.toUpperCase()}
                </div>
              </div>

              {/* Identity & Department Record */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#c89b4e] tracking-widest uppercase font-bold">
                    SUBJECT DOSSIER
                  </span>
                  <div className={`stamp text-[9px] px-2 py-0.5 ${getSuspicionStyle(current.suspicionLevel)}`}>
                    SUSPICION: {current.suspicionLevel?.toUpperCase()}
                  </div>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl text-[#ede5d8] leading-tight">
                  {current.name}
                </h3>
                
                <p className="text-sm font-mono text-[#c89b4e] font-semibold">
                  {current.role}
                </p>

                <div className="pt-2 text-xs font-mono text-[#ede5d8]/50">
                  STATUS: QUESTIONED UNDER OATH • CREDENTIALS CHECKED
                </div>
              </div>

            </div>
          </div>

          {/* Dossier Grid: Alibi, Motive, Opportunity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Alibi */}
            <div className="space-y-2 p-4 bg-[#0e0d0c] border border-[#ede5d8]/10">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#c89b4e] font-bold block">
                01. STATED ALIBI
              </span>
              <p className="font-sans text-xs text-[#ede5d8]/80 leading-relaxed font-light">
                {current.alibi || 'No official statement on record.'}
              </p>
            </div>

            {/* Motive */}
            <div className="space-y-2 p-4 bg-[#0e0d0c] border border-[#ede5d8]/10">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#7f2222] font-bold block">
                02. SUSPECTED MOTIVE
              </span>
              <p className="font-sans text-xs text-[#ede5d8]/80 leading-relaxed font-light">
                {current.motive || 'No explicit financial or personal motive established.'}
              </p>
            </div>

            {/* Opportunity */}
            <div className="space-y-2 p-4 bg-[#0e0d0c] border border-[#ede5d8]/10">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#c89b4e] font-bold block">
                03. PHYSICAL OPPORTUNITY
              </span>
              <p className="font-sans text-xs text-[#ede5d8]/80 leading-relaxed font-light">
                {current.opportunity || 'Access limitations currently under review.'}
              </p>
            </div>

          </div>

          {/* Investigator Notes */}
          {current.notes && (
            <div className="p-4 bg-[#1c1a17] border-l-2 border-[#c89b4e] space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#c89b4e] font-bold block">
                CHIEF DETECTIVE FIELD OBSERVATION:
              </span>
              <p className="font-serif text-sm sm:text-base text-[#ede5d8]/90 italic leading-relaxed font-light">
                "{current.notes}"
              </p>
            </div>
          )}

          {/* Connected Evidence Tags */}
          {current.relatedEvidence && current.relatedEvidence.length > 0 && (
            <div className="pt-4 border-t border-[#ede5d8]/10 space-y-3">
              <div className="text-[10px] font-mono text-[#ede5d8]/40 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#c89b4e]" />
                <span>EXHIBITS LINKED TO THIS SUSPECT ({current.relatedEvidence.length})</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {current.relatedEvidence.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onInspectEvidence?.({ key: item.key, title: item.title })}
                    className="px-3 py-1.5 bg-[#0e0d0c] border border-[#ede5d8]/15 hover:border-[#c89b4e] text-xs font-mono text-[#ede5d8]/80 hover:text-[#c89b4e] flex items-center gap-2 transition-colors"
                  >
                    <span>EXHIBIT #{item.key?.toUpperCase()}: {item.title}</span>
                    <Eye className="w-3 h-3 text-[#c89b4e]" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
