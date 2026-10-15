import { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Send, 
  MessageSquare, 
  Circle, 
  Radio, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { playSound } from '../utils/sound.js';

export function TeamPresenceSidebar({ 
  roomCode, 
  participants = [], 
  presenceList = [], 
  chat = [], 
  currentUserId, 
  onSendMessage 
}) {
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'team'
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      playSound.click();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;

    const messageText = text.trim();
    setText('');
    setIsSending(true);

    try {
      await onSendMessage(messageText);
      playSound.click();
    } catch {
      setText(messageText);
    } finally {
      setIsSending(false);
    }
  };

  // Combine DB participants with real-time socket presence
  const activeMembersMap = new Map();
  presenceList.forEach(p => {
    if (p.userId) activeMembersMap.set(p.userId, p);
  });

  const memberCards = (participants || []).map(p => {
    const isOnline = activeMembersMap.has(p.userId?.toString?.() || p.userId);
    const liveEntry = activeMembersMap.get(p.userId?.toString?.() || p.userId);
    return {
      userId: p.userId,
      username: p.username || 'Detective',
      isOnline,
      currentAction: liveEntry?.currentAction || p.currentAction || 'Connected'
    };
  });

  return (
    <div className="w-full lg:w-80 flex flex-col bg-[#171513] border border-[#ede5d8]/10 rounded-2xl shadow-2xl overflow-hidden h-[600px] lg:h-[calc(100vh-140px)] sticky top-20">
      {/* Header: Room Code */}
      <div className="p-4 bg-[#12100e] border-b border-[#ede5d8]/8 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-mono tracking-widest uppercase text-[#ede5d8]/35 block mb-0.5">
            ROOM FREQUENCY
          </span>
          <span className="font-mono text-lg font-bold tracking-[0.2em] text-[#c89b4e]">
            {roomCode || 'SOLO'}
          </span>
        </div>
        {roomCode && (
          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all ${
              copied
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400'
                : 'border-[#ede5d8]/12 bg-[#1f1c18] text-[#ede5d8]/70 hover:border-[#c89b4e] hover:text-[#c89b4e]'
            }`}
            title="Copy room code to clipboard"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5" /><span>Copied!</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5 text-[#c89b4e]" /><span>Invite</span></>
            )}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#ede5d8]/8 bg-[#141210]">
        {[
          { key: 'chat', icon: MessageSquare, label: `Radio (${chat.length})` },
          { key: 'team', icon: Users,         label: `Team (${memberCards.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-[11px] font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.key
                ? 'text-[#c89b4e] border-b-2 border-[#c89b4e] bg-[#171513]'
                : 'text-[#ede5d8]/45 hover:text-[#ede5d8] hover:bg-[#1a1714]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Body */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {chat.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#ede5d8]/40">
                <Radio className="w-8 h-8 mb-2 opacity-30 text-[#c89b4e]" />
                <p className="font-serif italic text-sm">Secure frequency open.</p>
                <p className="text-[11px] font-mono mt-1">Coordinate with your investigation partner.</p>
              </div>
            ) : (
              chat.map((msg, i) => {
                const isMe = msg.senderId === currentUserId;
                const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#ede5d8]/40 mb-1 px-1">
                      <span className="font-bold text-[#ede5d8]/70">{msg.senderName}</span>
                      <span>•</span>
                      <span>{timeStr}</span>
                    </div>
                    <div className={`p-2.5 rounded-lg max-w-[85%] text-xs font-mono leading-relaxed ${
                      isMe 
                        ? 'bg-[#c89b4e]/15 border border-[#c89b4e]/30 text-[#ede5d8]' 
                        : 'bg-[#12100e] border border-[#ede5d8]/10 text-[#ede5d8]/90'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSend} className="p-2.5 bg-[#12100e] border-t border-[#ede5d8]/8 flex gap-2">
            <input
              type="text"
              placeholder="Broadcast observation..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-[#1a1714] border border-[#ede5d8]/12 rounded-lg px-3 py-2 text-xs font-mono text-[#ede5d8] focus:outline-none focus:border-[#c89b4e] transition-colors"
            />
            <button
              type="submit"
              disabled={!text.trim() || isSending}
              className="p-2 rounded-lg bg-[#c89b4e] text-[#12100e] hover:bg-[#dfb368] disabled:opacity-40 transition-colors shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
          {memberCards.map((m, i) => (
            <div 
              key={i} 
              className="p-3 rounded-xl bg-[#12100e] border border-[#ede5d8]/8 flex items-center gap-3 group hover:border-[#ede5d8]/15 transition-colors"
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-[#1f1c18] border border-[#ede5d8]/15 flex items-center justify-center font-serif text-sm font-bold text-[#c89b4e]">
                  {m.username.charAt(0)}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#12100e] transition-colors ${
                  m.isOnline ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}>
                  {m.isOnline && <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="font-serif font-bold text-xs text-[#ede5d8] truncate">{m.username}</h5>
                  <span className={`text-[9px] font-mono ${m.isOnline ? 'text-emerald-400' : 'text-[#ede5d8]/30'}`}>
                    {m.isOnline ? 'LIVE' : 'AWAY'}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[#c89b4e]/70 truncate mt-0.5">
                  ● {m.currentAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
