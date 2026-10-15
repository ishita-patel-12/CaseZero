import { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Camera, 
  FileText, 
  CreditCard, 
  Ticket,
  Maximize2,
  Tag,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { playSound } from '../utils/sound.js';
import { getCaseMedia } from '../utils/caseMedia.js';

export function EvidenceViewerModal({ evidence, onClose, caseNumber = 'CZ-001' }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [highlightNote, setHighlightNote] = useState(false);

  if (!evidence) return null;

  const media = getCaseMedia(caseNumber);

  const handleRotate = () => {
    playSound.click();
    setRotation(prev => (prev + 90) % 360);
  };
  const handleZoomIn = () => {
    playSound.click();
    setZoom(prev => Math.min(prev + 0.25, 2.5));
  };
  const handleZoomOut = () => {
    playSound.click();
    setZoom(prev => Math.max(prev - 0.25, 0.75));
  };

  const isPhoto = evidence.key === 'photo' || evidence.type === 'photograph';
  const isDocument = evidence.key === 'schedule' || evidence.key === 'note' || evidence.type === 'document';
  const isCard = evidence.key === 'card' || evidence.type === 'digital';
  const isTicket = evidence.key === 'ticket' || evidence.type === 'object';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#080706]/92 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      {/* Inspection Shell */}
      <div 
        className="relative w-full max-w-5xl h-[88vh] flex flex-col bg-[#0e0d0c] border border-[#ede5d8]/15 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Inspection Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#ede5d8]/10 bg-[#080706]">
          <div className="flex items-center gap-4">
            <span className="stamp stamp-classified text-[10px] px-2 py-0.5">
              FORENSIC EXAMINATION
            </span>
            <div className="text-xs font-mono text-[#ede5d8]/50">
              CASE: <span className="text-[#c89b4e] font-bold">{caseNumber}</span>
              <span className="mx-2">•</span>
              EXHIBIT #{evidence.key?.toUpperCase()}
            </div>
          </div>

          {/* Inspection View Tools */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-[#ede5d8]/15 bg-[#141311] px-1 py-0.5">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.75}
                title="Zoom Out"
                className="p-1.5 text-[#ede5d8]/60 hover:text-[#ede5d8] disabled:opacity-30"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-2 text-[#c89b4e]">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 2.5}
                title="Zoom In"
                className="p-1.5 text-[#ede5d8]/60 hover:text-[#ede5d8] disabled:opacity-30"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3 bg-[#ede5d8]/10 mx-1" />
              <button
                onClick={handleRotate}
                title="Rotate 90 degrees"
                className="p-1.5 text-[#ede5d8]/60 hover:text-[#c89b4e]"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => {
                playSound.click();
                onClose();
              }}
              title="Close inspection"
              className="p-1.5 text-[#ede5d8]/50 hover:text-[#ede5d8] hover:bg-[#1f1c18] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Investigation Stage */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#0a0908]">
          
          {/* Main Inspection Viewport (Left 8 cols) */}
          <div className="lg:col-span-8 relative flex items-center justify-center p-8 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(20,18,15,1)_0%,rgba(8,7,6,1)_100%)]">
            
            <div 
              className="transition-transform duration-200 ease-out max-w-full max-h-full"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`
              }}
            >
              
              {/* 1. PHOTOGRAPH EXHIBIT */}
              {isPhoto && (
                <div className="photo-exhibit max-w-md w-full select-none">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#36332d] mb-1.5 px-0.5 border-b border-[#36332d]/20 pb-1">
                    <span>POLICE FORENSIC PHOTOGRAPHY</span>
                    <span>21:47:04 CCTV</span>
                  </div>
                  <div className="relative aspect-[4/3] bg-[#1a1714] overflow-hidden border border-black/20">
                    <img 
                      src={media.scene} 
                      alt="Crime Scene Evidence Photograph"
                      className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                    />
                    <div className="absolute top-2 left-2 text-[9px] font-mono bg-black/75 text-emerald-400 px-1.5 py-0.5">
                      REC ● 21:47:04
                    </div>
                    <div className="absolute bottom-2 right-2 stamp stamp-classified text-[8px] px-1 bg-black/80 text-red-400 border-red-500">
                      EXHIBIT #PHOTO
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-serif italic text-[#36332d] leading-snug">
                    "Visitor in grey coat carrying flat leather case toward Vault 3."
                  </div>
                </div>
              )}

              {/* 2. TORN SCHEDULE DOCUMENT */}
              {evidence.key === 'schedule' && (
                <div className="document-exhibit max-w-md p-6 sm:p-8 select-none rotate-1 shadow-2xl">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8c6724] border-b border-[#8c6724]/30 pb-2 mb-4">
                    <span className="font-bold">ALDERMERE HISTORICAL MUSEUM</span>
                    <span>DAILY ROSTER: 24-OCT</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#141311] mb-2 uppercase tracking-wide">
                    Exhibition Security & Lock-Up Protocol
                  </h3>
                  <div className="space-y-3 font-mono text-xs text-[#2b2720] leading-relaxed">
                    <div className="p-2 bg-[#dfd4c0] border-l-2 border-[#8c6724]">
                      <strong>21:00</strong> — Curator M. Halloran scheduled to inspect Vault 3 Codex seal.
                    </div>
                    <div className="p-2 bg-[#dfd4c0] border-l-2 border-[#7f2222]">
                      <strong>21:30</strong> — Automated perimeter lockdown initiated. Heavy vault gates sealed.
                    </div>
                    <div className="p-2 bg-[#dfd4c0] border-l-2 border-[#8c6724]">
                      <strong>22:30</strong> — Night guard perimeter rounds scheduled.
                    </div>
                  </div>
                  <div className="mt-6 pt-3 border-t border-dashed border-[#8c6724]/40 flex items-center justify-between text-[10px] font-mono text-[#7f2222]">
                    <span>STATUS: RECOVERED FROM WASTEBASKET</span>
                    <span className="stamp stamp-red text-[8px] px-1.5 py-0.5">CRITICAL TIMELINE</span>
                  </div>
                </div>
              )}

              {/* 3. HANDWRITTEN NOTE */}
              {evidence.key === 'note' && (
                <div className="document-exhibit max-w-md p-8 select-none -rotate-1 shadow-2xl">
                  <div className="text-[10px] font-mono text-[#8c6724] tracking-widest uppercase border-b border-[#8c6724]/30 pb-1 mb-4">
                    MUSEUM INTERNAL MEMORANDUM
                  </div>
                  <div className="font-serif text-xl sm:text-2xl text-[#1a1714] italic leading-relaxed py-4 border-b border-black/10">
                    "Vault 3 before the bells. Bring the case. — E. Halloran"
                  </div>
                  <div className="mt-4 space-y-2 text-xs font-mono text-[#36332d]">
                    <div className="flex items-center justify-between text-[11px] text-[#7f2222] font-bold">
                      <span>FORENSIC HANDWRITING ANALYSIS:</span>
                      <span>INCONSISTENCY</span>
                    </div>
                    <p className="text-[11px] text-[#4d463b] leading-normal">
                      The conspirator signed "E. Halloran". Curator Margaret Halloran’s official credential signature is "M. Halloran" with a distinct looped M.
                    </p>
                  </div>
                </div>
              )}

              {/* 4. TRAIN TICKET */}
              {isTicket && (
                <div className="ticket-exhibit max-w-md p-6 select-none rotate-2 shadow-2xl">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#4a3f31] border-b border-[#8c7b64]/40 pb-2 mb-3">
                    <span className="font-bold">MIDLAND & WESTERN RAILWAY</span>
                    <span>TICKET #4028</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2 text-xs font-mono text-[#1a1714]">
                    <div>
                      <span className="text-[9px] text-[#73634e] block uppercase">Origin</span>
                      <strong className="text-sm">Grand Central</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#73634e] block uppercase">Destination</span>
                      <strong className="text-sm">Alder Station Platform 4</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#73634e] block uppercase">Departure</span>
                      <strong className="text-sm text-[#7f2222]">22:15 PM</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#73634e] block uppercase">Fare</span>
                      <strong className="text-sm">Cash Paid</strong>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#8c7b64]/40 text-xs font-serif italic text-[#36332d] bg-[#d9cbb4] p-2">
                    Pencilled on reverse: <span className="font-bold text-[#141311]">"Ask for Voss."</span>
                  </div>
                </div>
              )}

              {/* 5. ACCESS KEYCARD */}
              {isCard && (
                <div className="keycard-exhibit max-w-sm w-80 p-6 select-none -rotate-2 text-[#ede5d8]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <div className="text-[10px] font-mono text-[#c89b4e] font-bold tracking-widest">
                      ALDERMERE ARCHIVE SECURITY
                    </div>
                    <div className="w-5 h-4 bg-amber-400/80 rounded-sm" />
                  </div>
                  <div className="flex gap-4 items-center mb-4">
                    <div className="w-16 h-20 bg-[#12100e] border border-white/20 overflow-hidden flex items-center justify-center">
                      <img 
                        src={media.suspects['s_curator']} 
                        alt="Margaret Halloran" 
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="text-sm font-serif font-bold text-white">
                        Margaret Halloran
                      </div>
                      <div className="text-[10px] text-[#c89b4e]">Chief Museum Curator</div>
                      <div className="text-[9px] text-white/50">CARD ID: A-114</div>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-2 text-[10px] font-mono text-white/60 space-y-1">
                    <div>TIER 1 MASTER VAULT ACCESS</div>
                    <div className="text-emerald-400">LAST SCANNED: 20:58 (EAST WING)</div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Sidebar: Forensic Metadata & Inspector Dossier Notes (Right 4 cols) */}
          <div className="lg:col-span-4 p-6 sm:p-8 bg-[#0e0d0c] border-t lg:border-t-0 lg:border-l border-[#ede5d8]/10 overflow-y-auto space-y-6">
            
            <div>
              <div className="text-[10px] font-mono text-[#c89b4e] tracking-[0.2em] uppercase font-bold mb-1">
                EVIDENCE SPECIFICATION
              </div>
              <h2 className="font-serif text-2xl text-[#ede5d8] leading-tight">
                {evidence.title}
              </h2>
            </div>

            {/* Content summary */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#ede5d8]/40 uppercase tracking-wider block">
                Investigator Finding
              </span>
              <p className="text-xs sm:text-sm font-sans text-[#ede5d8]/80 leading-relaxed font-light">
                {evidence.content || evidence.description}
              </p>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-3 pt-4 border-t border-[#ede5d8]/10 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#ede5d8]/40">RECOVERY LOCATION</span>
                <span className="text-[#ede5d8] font-semibold">{evidence.hotspot}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#ede5d8]/40">EXHIBIT TYPE</span>
                <span className="text-[#c89b4e] uppercase font-bold">{evidence.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#ede5d8]/40">SIGNIFICANCE</span>
                <span className="text-[#7f2222] font-bold uppercase">{evidence.importance || 'HIGH'}</span>
              </div>
            </div>

            {/* Custom Metadata if present */}
            {evidence.metadata && (
              <div className="space-y-2 pt-4 border-t border-[#ede5d8]/10">
                <span className="text-[10px] font-mono text-[#ede5d8]/40 uppercase tracking-wider block">
                  Forensic Telemetry
                </span>
                <div className="bg-[#141311] border border-[#ede5d8]/10 p-3 space-y-2 text-xs font-mono">
                  {Object.entries(evidence.metadata).map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-2">
                      <span className="text-[#ede5d8]/40 capitalize">{k}:</span>
                      <span className="text-[#ede5d8]/90 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hint / Deduction guidance */}
            <div className="p-3 bg-[#141311] border border-[#c89b4e]/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#c89b4e] font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INVESTIGATOR DEDUCTION TIP</span>
              </div>
              <p className="text-[11px] font-sans text-[#ede5d8]/70 leading-relaxed font-light">
                Use the Evidence Board to connect this exhibit with related findings to uncover concealed relationships.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
