import { useState, useRef } from 'react';
import { playSound } from '../utils/sound.js';
import { getCaseMedia } from '../utils/caseMedia.js';
import { 
  Search, 
  Eye, 
  Check, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize2,
  HelpCircle,
  ShieldCheck,
  Compass
} from 'lucide-react';

export function CrimeSceneView({
  caseNumber = 'CZ-001',
  sceneTitle,
  evidence = [],
  onSearchHotspot,
  onInspectEvidence,
  isCompleted
}) {
  const media = getCaseMedia(caseNumber);
  const [activeHotspotKey, setActiveHotspotKey] = useState(null);
  const [searchingKey, setSearchingKey] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [justDiscoveredKey, setJustDiscoveredKey] = useState(null);
  const sceneRef = useRef(null);

  // Map backend evidence to scene hotspots
  // Hotspot definitions from caseMedia:
  // 'Wastebasket by the desk' -> schedule
  // 'Camera monitor' -> photo
  // 'Open drawer' -> note
  // 'Coat rack' -> ticket
  // 'Display case' -> card
  const hotspotsConfig = media.hotspots || {};

  const handleHotspotClick = async (evItem) => {
    if (isCompleted) {
      if (!evItem.locked) {
        onInspectEvidence(evItem);
      }
      return;
    }

    if (!evItem.locked) {
      // Already found -> Inspect directly
      playSound.click();
      onInspectEvidence(evItem);
      return;
    }

    // Unsearched -> Conduct investigation sweep
    setSearchingKey(evItem.key);
    playSound.click();

    setTimeout(async () => {
      await onSearchHotspot(evItem.key);
      setSearchingKey(null);
      setJustDiscoveredKey(evItem.key);
      setTimeout(() => setJustDiscoveredKey(null), 4000);
    }, 500);
  };

  const discoveredCount = evidence.filter(e => !e.locked).length;
  const totalCount = evidence.length;

  return (
    <div className="space-y-6">
      
      {/* ─── Crime Scene Header & Controls ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ede5d8]/10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-[#c89b4e] uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PRIMARY CRIME SCENE{sceneTitle ? ` // ${String(sceneTitle).toUpperCase()}` : ''}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#ede5d8] mt-0.5">
            Forensic Room Investigation
          </h2>
        </div>

        {/* Scene Status & Zoom Controls */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141311] border border-[#ede5d8]/15 text-[#ede5d8]/80">
            <Search className="w-3.5 h-3.5 text-[#c89b4e]" />
            <span>EXHIBITS: </span>
            <span className="text-[#c89b4e] font-bold">{discoveredCount} / {totalCount}</span>
          </div>

          <div className="flex items-center border border-[#ede5d8]/15 bg-[#141311]">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 1.75))}
              className="p-1.5 text-[#ede5d8]/60 hover:text-[#ede5d8] hover:bg-[#1f1c18] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[#ede5d8]/10" />
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 1))}
              className="p-1.5 text-[#ede5d8]/60 hover:text-[#ede5d8] hover:bg-[#1f1c18] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[#ede5d8]/10" />
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-[#ede5d8]/60 hover:text-[#ede5d8] hover:bg-[#1f1c18] transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── THE PHYSICAL CRIME SCENE VIEWPORT ─── */}
      <div 
        ref={sceneRef}
        className="relative aspect-[16/9] w-full overflow-hidden bg-[#080706] border border-[#ede5d8]/15 shadow-2xl select-none group"
      >
        
        {/* Crime Scene Photo with Zoom */}
        <div 
          className="w-full h-full transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={media.scene}
            alt="Physical Crime Scene"
            className="w-full h-full object-cover contrast-110 brightness-95"
          />

          {/* Forensic Hotspots Pinned on Real Scene Coordinates */}
          {evidence.map((e, idx) => {
            const config = hotspotsConfig[e.hotspot] || {
              pinX: 20 + idx * 16,
              pinY: 45 + (idx % 2) * 20,
              label: e.hotspot,
              sublabel: 'Forensic inspection point'
            };

            const isDiscovered = !e.locked;
            const isHovered = activeHotspotKey === e.key;
            const isSearching = searchingKey === e.key;

            return (
              <div
                key={e.key}
                style={{
                  left: `${config.pinX}%`,
                  top: `${config.pinY}%`
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                onMouseEnter={() => {
                  setActiveHotspotKey(e.key);
                  playSound.click();
                }}
                onMouseLeave={() => setActiveHotspotKey(null)}
                onClick={() => handleHotspotClick(e)}
              >
                {/* Visual Marker */}
                <div className="relative flex items-center justify-center">
                  
                  {isDiscovered ? (
                    /* Discovered Exhibit Marker (Crime Tent Style) */
                    <div 
                      className={`flex items-center gap-1.5 px-2 py-1 bg-[#141311]/95 text-[#ede5d8] border border-[#c89b4e]/80 shadow-[0_4px_16px_rgba(0,0,0,0.8)] transition-transform duration-200 ${
                        isHovered ? 'scale-110 border-[#dfb368]' : 'scale-100'
                      }`}
                    >
                      <div className="w-4 h-4 bg-[#c89b4e] text-[#080706] font-mono font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <span className="text-[10px] font-mono tracking-wider font-semibold text-[#c89b4e] hidden sm:inline">
                        EXHIBIT #{e.key?.toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    /* Unsearched Hotspot Marker (Forensic Radar Pulse) */
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-[#c89b4e]/20 border border-[#c89b4e] flex items-center justify-center hotspot-active">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#c89b4e]" />
                      </div>
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#080706]/90 border border-[#c89b4e]/50 px-1.5 py-0.5 text-[9px] font-mono text-[#c89b4e] whitespace-nowrap shadow-lg">
                        SWEEP
                      </div>
                    </div>
                  )}

                  {/* Searching spinner animation */}
                  {isSearching && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                      <div className="w-5 h-5 border-2 border-[#c89b4e] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 w-64 bg-[#080706]/95 border border-[#ede5d8]/20 p-3 shadow-2xl z-40 pointer-events-none animate-fadeUp">
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#ede5d8]/50 border-b border-[#ede5d8]/10 pb-1 mb-1.5">
                        <span>HOTSPOT #{idx + 1}</span>
                        <span className={isDiscovered ? 'text-emerald-400 font-bold' : 'text-[#c89b4e]'}>
                          {isDiscovered ? 'LOGGED' : 'UNEXAMINED'}
                        </span>
                      </div>
                      <div className="font-serif text-sm font-semibold text-[#ede5d8]">
                        {config.label || e.hotspot}
                      </div>
                      <div className="text-[10px] font-mono text-[#ede5d8]/60 mt-0.5">
                        {config.sublabel}
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-[#ede5d8]/10 text-[10px] font-mono text-[#c89b4e] flex items-center gap-1 font-bold">
                        {isDiscovered ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>CLICK TO INSPECT EXHIBIT</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-3 h-3" />
                            <span>CLICK TO CONDUCT SWEEP</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

        </div>

        {/* Scene HUD Overlays */}
        <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-1.5">
          <div className="stamp stamp-classified text-[10px] px-2 py-0.5 bg-black/70">
            SECURITY SURVEILLANCE // CAMERA B
          </div>
          <div className="text-[10px] font-mono text-[#ede5d8]/50 bg-black/60 px-2 py-0.5">
            COORDINATE: 42°19'N 71°04'W
          </div>
        </div>

        <div className="absolute bottom-4 right-4 pointer-events-none z-10 text-[10px] font-mono text-[#ede5d8]/50 bg-black/60 px-2.5 py-1 border border-white/10">
          HOVER HOTSPOT TO LOCATE • CLICK TO INVESTIGATE
        </div>

      </div>

      {/* ─── DISCOVERED EVIDENCE TRAY ─── */}
      <div className="space-y-4 pt-4 border-t border-[#ede5d8]/10">
        <div className="flex items-center justify-between text-xs font-mono text-[#ede5d8]/60">
          <span className="uppercase tracking-wider font-semibold text-[#ede5d8]/80">
            Recovered Scene Exhibits ({discoveredCount} / {totalCount})
          </span>
          <span className="text-[10px] text-[#ede5d8]/40">
            Click any recovered exhibit to launch full forensic inspection mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidence.map((e, idx) => {
            if (e.locked) {
              return (
                <div
                  key={e.key}
                  onClick={() => handleHotspotClick(e)}
                  className="p-4 border border-dashed border-[#ede5d8]/15 bg-[#141311]/50 hover:border-[#c89b4e]/50 hover:bg-[#141311] cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#c89b4e] block font-bold">
                      UNSEARCHED • POINT #{idx + 1}
                    </span>
                    <span className="font-serif text-sm text-[#ede5d8]/70 block">
                      {e.hotspot}
                    </span>
                  </div>
                  <Search className="w-4 h-4 text-[#ede5d8]/30" />
                </div>
              );
            }

            // Discovered exhibit card item
            return (
              <div
                key={e.key}
                onClick={() => {
                  playSound.click();
                  onInspectEvidence(e);
                }}
                className="group p-4 bg-[#141311] border border-[#ede5d8]/15 hover:border-[#c89b4e] transition-all cursor-pointer shadow-lg space-y-2 relative"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#ede5d8]/50 border-b border-[#ede5d8]/10 pb-1.5">
                  <span className="text-[#c89b4e] font-bold">
                    EXHIBIT #{e.key?.toUpperCase()}
                  </span>
                  <span className="uppercase text-[#8c6724]">
                    {e.type}
                  </span>
                </div>

                <div className="font-serif text-base text-[#ede5d8] group-hover:text-[#c89b4e] transition-colors leading-snug">
                  {e.title}
                </div>

                <p className="text-xs font-mono text-[#ede5d8]/60 line-clamp-2">
                  {e.content}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#ede5d8]/40 pt-1">
                  <span>FOUND: {e.hotspot}</span>
                  <span className="text-[#c89b4e] font-semibold flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>INSPECT</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
