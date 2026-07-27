import React, { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'What is ONYIS Protocol?',
    answer: 'ONYIS is a Web3 protocol built on the Robinhood Chain EVM. It offers instant coin flips (FLIPO), real-time volatile chart battles (RUGO), and multi-risk drop games (BOLO) with zero gas friction and 100% provably fair math.'
  },
  {
    id: 2,
    question: 'How do I connect my Web3 Wallet?',
    answer: 'Simply click the "Connect" button in the top obsidian gold navbar. You can seamlessly log in using your Web3 Wallet via Privy.io, automatically targeting the Robinhood Chain (Chain ID 4663).'
  },
  {
    id: 3,
    question: 'How does real-time Vault Balance sync work?',
    answer: 'Your Vault Balance polls directly from the Robinhood Mainnet RPC Node (https://rpc.mainnet.chain.robinhood.com) via standard JSON-RPC eth_getBalance calls every 5 seconds, keeping your displayed ETH synced in real time.'
  },
  {
    id: 4,
    question: 'Are the games Provably Fair?',
    answer: 'Yes! All outcome seeds, coin rotations, crash multipliers, and Plinko drop physics are generated using SHA-256 cryptographic hashes, guaranteeing transparent and unmanipulable results for every bet.'
  },
  {
    id: 5,
    question: 'How do I earn XP and level up?',
    answer: 'You earn 1 XP for every 0.001 ETH bet across FLIPO, RUGO, and BOLO. Accumulating XP unlocks higher level ranks, exclusive VIP badges in Global Chat, and future reward multipliers.'
  }
];

export default function FAQModal({ isOpen, onClose }) {
  const [openId, setOpenId] = useState(1);

  if (!isOpen) return null;

  const toggleItem = (id) => {
    setOpenId(prev => prev === id ? null : id);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(9, 10, 12, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="modal-content glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '32px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-gold-strong)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-gold)',
          position: 'relative',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px', right: '20px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            borderRadius: '50%',
            width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--border-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <HelpCircle size={22} color="var(--accent-gold)" />
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800 }}>
              FREQUENTLY ASKED QUESTIONS
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Everything you need to know about ONYIS Protocol on Robinhood Chain
            </p>
          </div>
        </div>

        {/* Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQ_ITEMS.map((item) => {
            const isItemOpen = openId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  background: isItemOpen ? 'rgba(212, 175, 55, 0.08)' : 'var(--bg-secondary)',
                  border: `1px solid ${isItemOpen ? 'var(--border-gold-strong)' : 'var(--border-subtle)'}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isItemOpen ? 'var(--text-gold)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    gap: '12px'
                  }}
                >
                  <span>{item.question}</span>
                  {isItemOpen ? <ChevronUp size={18} color="var(--accent-gold)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                </button>

                {isItemOpen && (
                  <div style={{
                    padding: '0 20px 18px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.88rem',
                    lineHeight: 1.55,
                    borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                    paddingTop: '12px'
                  }}>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
