import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ChevronRight, ChevronLeft, Shield, Sparkles, User, Circle } from 'lucide-react';
import { realtimeHub } from '../lib/realtimeHub';

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

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (chatBottomRef.current && isOpen) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Subscribe to Unified RealtimeHub chat messages
  useEffect(() => {
    const unsubscribe = realtimeHub.onChat((newMsg) => {
      if (!newMsg || !newMsg.id) return;
      setMessages(prev => {
        if (prev.some(m => String(m.id) === String(newMsg.id))) return prev;
        return [...prev.slice(-50), {
          ...newMsg,
          isMe: newMsg.user === `@${username}`
        }];
      });
    });

    return () => unsubscribe();
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

    setInputText('');

    // Broadcast across all connected devices and browsers via RealtimeHub
    realtimeHub.sendChatMessage(myMsg);
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
