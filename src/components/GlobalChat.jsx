import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ChevronRight, ChevronLeft, Shield, Sparkles, User, Circle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const INITIAL_MESSAGES = [
  { id: 1, user: 'Satoshi_King', badge: 'WHALE', text: 'LFG! 🚀 Just won 0.098 ETH on FLIPO!', time: '2m ago', color: '#FFDF00' },
  { id: 2, user: 'DegenApe_99', badge: 'PRO', text: 'RUGO candle pumping hard today! 📈', time: '1m ago', color: '#2EBD85' },
  { id: 3, user: 'Robinhooder_1', badge: 'DEGEN', text: 'BOLO hit 14x risk drop, crazy multiplier 🔥', time: '30s ago', color: '#9DA6B4' },
  { id: 4, user: 'Whale_Watcher', badge: 'WHALE', text: 'Robinhood Chain speed is fast ⚡', time: '10s ago', color: '#FFDF00' }
];

export default function GlobalChat({ username, isConnected, triggerToast }) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef(null);
  const channelRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (chatBottomRef.current && isOpen) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // ─── DUAL REALTIME ENGINE: Web API BroadcastChannel + Supabase Realtime ───
  useEffect(() => {
    // 1. Native Browser P2P BroadcastChannel (Works 100% across browser windows & tabs instantly)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('onyis_global_chat_channel');
        broadcastChannelRef.current = bc;

        bc.onmessage = (event) => {
          const payload = event.data;
          if (payload && payload.id) {
            setMessages(prev => {
              if (prev.some(m => String(m.id) === String(payload.id))) return prev;
              const updated = [...prev.slice(-50), {
                ...payload,
                isMe: payload.user === `@${username}`
              }];
              try {
                localStorage.setItem('onyis_chat_history_v2', JSON.stringify(updated.slice(-30)));
              } catch (e) {}
              return updated;
            });
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization notice:', err);
      }
    }

    // 2. Storage event listener for cross-window sync
    const handleStorageChange = (e) => {
      if (e.key === 'onyis_chat_history_v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed.map(m => ({
              ...m,
              isMe: m.user === `@${username}`
            })));
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Initial load from localStorage
    try {
      const saved = localStorage.getItem('onyis_chat_history_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.map(m => ({
            ...m,
            isMe: m.user === `@${username}`
          })));
        }
      }
    } catch (e) {}

    // 3. Supabase Realtime Channel (If Supabase is configured)
    if (supabase) {
      try {
        const channel = supabase.channel('room:global_chat', {
          config: { broadcast: { self: true } }
        });

        channelRef.current = channel;

        channel.on('broadcast', { event: 'chat_msg' }, ({ payload }) => {
          if (!payload || !payload.id) return;
          setMessages(prev => {
            if (prev.some(m => String(m.id) === String(payload.id))) return prev;
            return [...prev.slice(-50), {
              ...payload,
              isMe: payload.user === `@${username}`
            }];
          });
        });

        channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_chat' }, payload => {
          const newM = payload.new;
          if (!newM) return;
          const formattedMsg = {
            id: newM.id,
            user: newM.username,
            badge: newM.badge || 'DEGEN',
            text: newM.message,
            time: new Date(newM.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: newM.color || '#9DA6B4',
            isMe: newM.username === `@${username}`
          };

          setMessages(prev => {
            if (prev.some(m => String(m.id) === String(formattedMsg.id))) return prev;
            return [...prev.slice(-50), formattedMsg];
          });
        });

        channel.subscribe();

        // Initial DB fetch
        supabase
          .from('global_chat')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30)
          .then(({ data, error }) => {
            if (!error && data && data.length > 0) {
              const sorted = data.reverse().map(m => ({
                id: m.id,
                user: m.username,
                badge: m.badge || 'DEGEN',
                text: m.message,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                color: m.color || '#9DA6B4',
                isMe: m.username === `@${username}`
              }));
              setMessages(sorted);
            }
          })
          .catch(() => {});
      } catch (err) {
        console.warn('Supabase realtime init notice:', err);
      }
    }

    return () => {
      if (broadcastChannelRef.current) {
        try { broadcastChannelRef.current.close(); } catch (e) {}
      }
      window.removeEventListener('storage', handleStorageChange);
      if (channelRef.current && supabase) {
        try { supabase.removeChannel(channelRef.current); } catch (e) {}
      }
    };
  }, [username]);

  // Ambient background chat activity loop
  useEffect(() => {
    const interval = setInterval(() => {
      const mockDegens = [
        { name: 'Pepe_HODL', badge: 'DEGEN', text: 'who is flipping HEADS right now?', color: '#9DA6B4' },
        { name: '0xAlpha_G', badge: 'PRO', text: 'RUGO rugged at 2.45x lol', color: '#2EBD85' },
        { name: 'MoonShot_Pro', badge: 'WHALE', text: 'Just deposited on Robinhood Vault ⚡', color: '#FFDF00' },
        { name: 'EthMaxi_77', badge: 'DEGEN', text: 'ONYIS UX is clean 🔥', color: '#9DA6B4' }
      ];

      const randomMsg = mockDegens[Math.floor(Math.random() * mockDegens.length)];
      const newMsg = {
        id: `ambient-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        user: randomMsg.name,
        badge: randomMsg.badge,
        text: randomMsg.text,
        time: 'Just now',
        color: randomMsg.color
      };

      setMessages(prev => [...prev.slice(-40), newMsg]);
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    const myUsername = `@${username}`;

    const myMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      user: myUsername,
      badge: 'VIP',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: '#E5C158',
      isMe: true
    };

    // 1. Local UI Update & LocalStorage Persistence
    setMessages(prev => {
      const next = [...prev.slice(-50), myMsg];
      try {
        localStorage.setItem('onyis_chat_history_v2', JSON.stringify(next.slice(-30)));
      } catch (e) {}
      return next;
    });
    setInputText('');

    // 2. Native Web API BroadcastChannel transmission (Instant P2P!)
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(myMsg);
      } catch (err) {
        console.warn('BroadcastChannel postMessage notice:', err);
      }
    }

    // 3. Supabase Realtime Broadcast & DB insert
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'chat_msg',
          payload: myMsg
        });
      } catch (err) {}
    }

    if (supabase) {
      try {
        await supabase
          .from('global_chat')
          .insert([
            {
              username: myUsername,
              badge: 'VIP',
              message: textToSend,
              color: '#E5C158'
            }
          ]);
      } catch (err) {}
    }
  };

  return (
    <div style={{
      position: 'fixed',
      right: isOpen ? '0' : '-320px',
      top: '72px',
      bottom: '0',
      width: '320px',
      zIndex: 99,
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex'
    }}>
      {/* Toggle Handle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          left: '-36px',
          top: '24px',
          width: '36px',
          height: '42px',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-gold)',
          borderRight: 'none',
          borderRadius: '10px 0 0 10px',
          color: 'var(--text-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-gold)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
        title={isOpen ? 'Collapse Chat' : 'Open Global Chat'}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Main Chat Container */}
      <div className="glass-panel" style={{
        width: '100%',
        height: '100%',
        borderRadius: '16px 0 0 0',
        borderRight: 'none',
        borderBottom: 'none',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(17, 19, 24, 0.85)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--accent-gold)" />
            <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              GLOBAL CHAT
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#2EBD85', fontWeight: 700 }}>
            <Circle size={8} fill="#2EBD85" color="#2EBD85" /> REALTIME LIVE
          </div>
        </div>

        {/* Messages Feed Box */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                background: msg.isMe ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${msg.isMe ? 'rgba(212, 175, 55, 0.3)' : 'var(--border-subtle)'}`,
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, color: msg.isMe ? 'var(--text-gold)' : 'var(--text-primary)' }}>
                    {msg.user}
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: msg.badge === 'WHALE' ? 'rgba(255, 223, 0, 0.15)' : 'rgba(46, 189, 133, 0.15)',
                    color: msg.badge === 'WHALE' ? '#FFDF00' : '#2EBD85',
                    border: `1px solid ${msg.badge === 'WHALE' ? 'rgba(255, 223, 0, 0.3)' : 'rgba(46, 189, 133, 0.3)'}`
                  }}>
                    {msg.badge}
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{msg.time}</span>
              </div>

              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.35, wordBreak: 'break-word' }}>
                {msg.text}
              </p>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(17, 19, 24, 0.95)',
            display: 'flex',
            gap: '8px'
          }}
        >
          <input
            type="text"
            placeholder="Send a message to global chat..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-gold)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: inputText.trim() ? 'var(--accent-gold-gradient)' : 'var(--bg-secondary)',
              border: 'none',
              color: '#090A0C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
