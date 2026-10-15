import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import { connectSocket, getSocket } from '../socket.js';
import { playSound } from '../utils/sound.js';

// Subcomponents
import { EvidenceBoard } from '../components/EvidenceBoard.jsx';
import { EvidenceViewerModal } from '../components/EvidenceViewerModal.jsx';
import { SuspectsView } from '../components/SuspectsView.jsx';
import { TimelineView } from '../components/TimelineView.jsx';
import { PuzzleConsole } from '../components/PuzzleConsole.jsx';
import { NarrativeConsole } from '../components/NarrativeConsole.jsx';
import { TeamPresenceSidebar } from '../components/TeamPresenceSidebar.jsx';
import { CaseClosedModal } from '../components/CaseClosedModal.jsx';
import { CrimeSceneView } from '../components/CrimeSceneView.jsx';

// Icons
import { 
  FolderSearch, 
  Search, 
  Pin, 
  Users, 
  Clock, 
  Puzzle, 
  GitBranch, 
  Award, 
  Radio, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  ChevronRight, 
  Wifi, 
  WifiOff 
} from 'lucide-react';

export function InvestigationWorkspace() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('scene');
  const [inspectingEvidence, setInspectingEvidence] = useState(null);
  const [showCaseClosedModal, setShowCaseClosedModal] = useState(false);

  // Live real-time state
  const [liveToast, setLiveToast] = useState(null);
  const [presenceList, setPresenceList] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Fetch investigation data
  const loadInvestigation = useCallback(async () => {
    try {
      const res = await api(`/investigations/${id}`);
      setData(res);
      setLoading(false);
      if (res.investigation?.status === 'completed') {
        setShowCaseClosedModal(true);
      }
    } catch (err) {
      setError(err.message || 'Unable to open investigation file.');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvestigation();
  }, [loadInvestigation]);

  // Socket.IO Setup & Event Subscriptions
  useEffect(() => {
    const token = localStorage.getItem('cz_token');
    const socket = connectSocket(token);

    const onConnect = () => {
      setSocketConnected(true);
      socket.emit('join_investigation', { investigationId: id });
    };

    const onDisconnect = () => {
      setSocketConnected(false);
    };

    const onPresenceSync = ({ members }) => {
      if (members) setPresenceList(members);
    };

    const onInvestigationUpdated = (updatedView) => {
      setData(updatedView);
    };

    const onEvidenceDiscovered = (payload) => {
      playSound.evidenceFound();
      setLiveToast({
        type: 'evidence',
        title: 'NEW EVIDENCE LOGGED',
        message: `${payload.discoveredBy || 'Teammate'} discovered "${payload.evidenceTitle}"`
      });
      setTimeout(() => setLiveToast(null), 5000);
    };

    const onClueUnlocked = (payload) => {
      playSound.clueUnlocked();
      setLiveToast({
        type: 'clue',
        title: 'BREAKTHROUGH CLUE UNLOCKED',
        message: `"${payload.clueTitle}" — ${payload.unlockedBy} connected the evidence`
      });
      setTimeout(() => setLiveToast(null), 6000);
    };

    const onPuzzleSolved = (payload) => {
      playSound.puzzleSuccess();
      setLiveToast({
        type: 'puzzle',
        title: 'PUZZLE SOLVED',
        message: `${payload.solvedBy} deduced the solution for "${payload.puzzleTitle}"`
      });
      setTimeout(() => setLiveToast(null), 5000);
    };

    const onDecisionMade = (payload) => {
      playSound.dossierOpen();
      setLiveToast({
        type: 'story',
        title: 'STORY BRANCH ADVANCED',
        message: `${payload.decidedBy} selected: "${payload.decisionText}"`
      });
      setTimeout(() => setLiveToast(null), 5000);
    };

    const onCaseCompleted = (payload) => {
      setShowCaseClosedModal(true);
      playSound.puzzleSuccess();
    };

    const onChatMessage = (msg) => {
      setData(prev => {
        if (!prev) return prev;
        const exists = prev.investigation?.chat?.some(c => c.timestamp === msg.timestamp && c.text === msg.text);
        if (exists) return prev;
        return {
          ...prev,
          investigation: {
            ...prev.investigation,
            chat: [...(prev.investigation?.chat || []), msg]
          }
        };
      });
      if (msg.senderId !== user?.id) {
        playSound.click();
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('presence_sync', onPresenceSync);
    socket.on('investigation_updated', onInvestigationUpdated);
    socket.on('evidence_discovered', onEvidenceDiscovered);
    socket.on('clue_unlocked', onClueUnlocked);
    socket.on('puzzle_solved', onPuzzleSolved);
    socket.on('decision_made', onDecisionMade);
    socket.on('case_completed', onCaseCompleted);
    socket.on('chat_message', onChatMessage);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.emit('leave_investigation', { investigationId: id });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('presence_sync', onPresenceSync);
      socket.off('investigation_updated', onInvestigationUpdated);
      socket.off('evidence_discovered', onEvidenceDiscovered);
      socket.off('clue_unlocked', onClueUnlocked);
      socket.off('puzzle_solved', onPuzzleSolved);
      socket.off('decision_made', onDecisionMade);
      socket.off('case_completed', onCaseCompleted);
      socket.off('chat_message', onChatMessage);
    };
  }, [id, user]);

  // Update presence status when switching tabs
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    playSound.click();

    const actionMap = {
      scene: 'Searching crime scene hotspots',
      board: 'Reviewing correlation pinboard',
      suspects: 'Cross-examining suspect dossiers',
      timeline: 'Inspecting chronology of events',
      puzzles: 'Working on deductive challenges',
      story: 'Deliberating case decision'
    };

    const actionText = actionMap[tabKey] || 'Investigating';
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('presence_update', { investigationId: id, action: actionText });
    }
    // Also save via REST in case
    api(`/investigations/${id}/presence`, {
      method: 'POST',
      body: { action: actionText }
    }).catch(() => {});
  };

  // Actions
  const handleSearchHotspot = async (evidenceKey) => {
    playSound.click();
    try {
      const updated = await api(`/investigations/${id}/evidence`, {
        method: 'POST',
        body: { key: evidenceKey }
      });
      setData(updated);
      const ev = updated.evidence.find(e => e.key === evidenceKey);
      if (ev && !ev.locked) {
        setInspectingEvidence(ev);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConnectEvidence = async (a, b) => {
    const updated = await api(`/investigations/${id}/connect`, {
      method: 'POST',
      body: { a, b }
    });
    setData(updated);
    return updated;
  };

  const handleSolvePuzzle = async (puzzleId, answerIdx) => {
    const res = await api(`/puzzles/${puzzleId}/solve`, {
      method: 'POST',
      body: { investigationId: id, answer: answerIdx }
    });
    setData(res);
    return res;
  };

  const handleMakeDecision = async (choiceIndex) => {
    const updated = await api(`/investigations/${id}/choice`, {
      method: 'POST',
      body: { index: choiceIndex }
    });
    setData(updated);
    if (updated.investigation?.status === 'completed') {
      setShowCaseClosedModal(true);
    }
  };

  const handleSendMessage = async (text) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('send_chat', { investigationId: id, text });
    } else {
      await api(`/investigations/${id}/chat`, {
        method: 'POST',
        body: { text }
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-[#c89b4e]/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-[#c89b4e]/40 animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="absolute inset-4 rounded-full border-2 border-[#c89b4e] border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-serif text-xs font-bold text-[#c89b4e]">CZ</div>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#93969B] mb-1 cz-breath">
          Reconstructing scene…
        </p>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="p-6 rounded bg-[#822727]/20 border border-[#822727] text-red-200 text-sm font-mono mb-6">
          <AlertCircle className="w-8 h-8 text-[#822727] mx-auto mb-2" />
          <p className="font-bold mb-1">INVESTIGATION INTERRUPTED</p>
          <p>{error}</p>
        </div>
        <Link to="/cases" className="text-xs font-mono text-[#c89b4e] hover:underline uppercase">
          ← Return to Case Archives
        </Link>
      </main>
    );
  }

  const { investigation: inv, case: caseInfo, evidence = [], clues = [], puzzles = [], node, timeline = [], suspects = [], stats = {} } = data || {};
  const isCompleted = inv?.status === 'completed';

  const tabs = [
    { key: 'scene', label: 'Scene Search', icon: Search, count: evidence.filter(e => !e.locked).length + '/' + evidence.length },
    { key: 'board', label: 'Evidence Board', icon: Pin, count: inv?.connections?.length || 0 },
    { key: 'suspects', label: 'Suspects', icon: Users, count: suspects.length },
    { key: 'timeline', label: 'Chronology', icon: Clock, count: timeline.filter(t => t.unlocked).length + '/' + timeline.length },
    { key: 'puzzles', label: 'Deductions', icon: Puzzle, count: puzzles.filter(p => p.solved).length + '/' + puzzles.length },
    { key: 'story', label: 'Case Decision', icon: GitBranch, alert: !isCompleted && node?.choices?.some(c => !c.locked) }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#12100e]">
      {/* Real-time Broadcast Toast */}
      {liveToast && (
        <div className="animate-toast fixed top-16 right-4 sm:right-6 z-50 p-4 bg-[#1a1714] border border-[#c89b4e]/70 shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-start gap-3 max-w-xs sm:max-w-sm">
          <div className="w-8 h-8 rounded-full bg-[#c89b4e]/15 border border-[#c89b4e]/40 flex items-center justify-center text-[#c89b4e] shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs font-mono flex-1">
            <span className="font-bold text-[#c89b4e] block mb-0.5 tracking-wider">{liveToast.title}</span>
            <span className="text-[#ede5d8]/75 leading-relaxed">{liveToast.message}</span>
          </div>
          <button onClick={() => setLiveToast(null)} className="text-[#ede5d8]/30 hover:text-[#ede5d8] text-xs shrink-0">✕</button>
        </div>
      )}

      {/* Top Investigation Command Bar */}
      <header className="sticky top-0 z-30 bg-[#171513]/95 backdrop-blur border-b border-[#ede5d8]/10 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Case identification */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1f1c18] border border-[#ede5d8]/20 flex items-center justify-center font-serif text-sm font-bold text-[#c89b4e]">
              {caseInfo?.caseNumber || 'CZ'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#c89b4e] uppercase font-bold">
                  {caseInfo?.caseNumber}
                </span>
                <span className="text-[#ede5d8]/30">•</span>
                <span className="text-[10px] font-mono text-[#ede5d8]/50 uppercase">
                  {caseInfo?.difficulty || 'MODERATE'}
                </span>
                {isCompleted && (
                  <span className="text-[9px] font-mono px-1.5 rounded bg-[#822727]/40 text-red-300 border border-[#822727]">
                    CASE CLOSED
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-serif font-bold text-[#ede5d8] leading-tight">
                {caseInfo?.title}
              </h1>
            </div>
          </div>

          {/* Center Progress & Stats */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Investigation state: what the team actually knows (real counts) */}
            <div className="hidden sm:flex items-center gap-5 text-[10px] tracking-[0.2em] uppercase text-[#93969B]">
              <span><span className="text-[#E8E3D9] font-semibold">{evidence.filter(e => !e.locked).length}</span> evidence</span>
              <span><span className="text-[#E8E3D9] font-semibold">{inv?.connections?.length || 0}</span> connections</span>
              <span><span className="text-[#B83A32] font-semibold">{clues.length}</span> leads</span>
            </div>

            {/* Socket connection indicator */}
            <div 
              title={socketConnected ? 'Real-time WebSocket Live' : 'Connecting to socket server...'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12100e] border border-[#ede5d8]/10 text-[11px]"
            >
              {socketConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-bold hidden sm:inline">LIVE SYNC</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-amber-400 font-bold hidden sm:inline">CONNECTING</span>
                </>
              )}
            </div>

            {/* Case Closed Button */}
            {isCompleted && (
              <button
                onClick={() => setShowCaseClosedModal(true)}
                className="px-3 py-1 rounded bg-[#822727] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#a33838] transition-colors"
              >
                Debrief
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pt-3 border-t border-[#ede5d8]/10 mt-3 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;

            return (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-mono tracking-wider uppercase transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-[#c89b4e] text-[#12100e] font-bold shadow-md'
                    : 'text-[#ede5d8]/55 hover:text-[#ede5d8] hover:bg-[#1f1c18]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.count && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-[#12100e]/25 text-[#12100e]' : 'bg-[#12100e] text-[#c89b4e]'
                  }`}>
                    {t.count}
                  </span>
                )}
                {t.alert && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-[#12100e] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Investigation Command Stage */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left & Center Main Stage */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* TAB 1: CRIME SCENE HOTSPOT VIEW */}
          {activeTab === 'scene' && (
            <CrimeSceneView
              caseNumber={caseInfo?.caseNumber || 'CZ-001'}
              sceneTitle={caseInfo?.sceneTitle || caseInfo?.location}
              evidence={evidence}
              onSearchHotspot={handleSearchHotspot}
              onInspectEvidence={(ev) => setInspectingEvidence(ev)}
              isCompleted={isCompleted}
            />
          )}

          {/* TAB 2: CORRELATION EVIDENCE BOARD */}
          {activeTab === 'board' && (
            <EvidenceBoard
              evidence={evidence}
              connections={inv?.connections || []}
              clues={clues}
              onConnect={handleConnectEvidence}
              onInspectEvidence={(ev) => setInspectingEvidence(ev)}
              isCompleted={isCompleted}
            />
          )}

          {/* TAB 3: SUSPECTS VIEW */}
          {activeTab === 'suspects' && (
            <SuspectsView
              suspects={suspects}
              onInspectEvidence={(ev) => setInspectingEvidence(ev)}
            />
          )}

          {/* TAB 4: CHRONOLOGICAL TIMELINE */}
          {activeTab === 'timeline' && (
            <TimelineView
              timeline={timeline}
            />
          )}

          {/* TAB 5: DEDUCTIVE PUZZLES */}
          {activeTab === 'puzzles' && (
            <PuzzleConsole
              puzzles={puzzles}
              onSolve={handleSolvePuzzle}
              isCompleted={isCompleted}
            />
          )}

          {/* TAB 6: STORY / BRANCHING DECISIONS */}
          {activeTab === 'story' && (
            <NarrativeConsole
              node={node}
              decisions={inv?.decisions || []}
              clues={clues}
              onChoice={handleMakeDecision}
              isCompleted={isCompleted}
              onReviewEnding={() => setShowCaseClosedModal(true)}
            />
          )}
        </div>

        {/* Right Sidebar: Teammates & Radio Chat */}
        <TeamPresenceSidebar
          roomCode={inv?.roomCode}
          participants={inv?.participants || []}
          presenceList={presenceList}
          chat={inv?.chat || []}
          currentUserId={user?.id}
          onSendMessage={handleSendMessage}
        />
      </main>

      {/* Modal 1: Evidence Inspector */}
      {inspectingEvidence && (
        <EvidenceViewerModal
          evidence={inspectingEvidence}
          onClose={() => setInspectingEvidence(null)}
        />
      )}

      {/* Modal 2: Case Closed Debrief */}
      {showCaseClosedModal && (
        <CaseClosedModal
          outcome={inv?.outcome || 'Case completed.'}
          stats={stats}
          participants={inv?.participants || []}
          caseTitle={caseInfo?.title}
          caseNumber={caseInfo?.caseNumber}
          onClose={() => setShowCaseClosedModal(false)}
        />
      )}
    </div>
  );
}
