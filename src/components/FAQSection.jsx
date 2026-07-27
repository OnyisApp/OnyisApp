import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Zap, Coins, Lock, Sparkles } from 'lucide-react';

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'What is ONYIS Protocol?',
    answer: 'ONYIS is a Web3 gaming protocol built on the Robinhood Chain EVM. It offers instant coin flips (FLIPO), real-time volatile chart battles (RUGO), and multi-risk drop games (BOLO) with zero gas friction and 100% provably fair math.'
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

export default function FAQSection() {
  const [openId, setOpenId] = useState(1);

  const toggleItem = (id) => {
    setOpenId(prev => prev === id ? null : id);
  };

  return (
    <section style={{
      maxWidth: '1200px',
      margin: '60px auto 0',
      padding: '0 24px',
      boxSizing: 'border-box'
    }}>
      <div className="glass-panel" style={{ padding: '36px 32px' }}>
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid var(--border-gold)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            color: 'var(--text-gold)',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <HelpCircle size={14} color="var(--accent-gold)" /> FREQUENTLY ASKED QUESTIONS
          </div>

          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '1px'
          }}>
            GOT QUESTIONS? WE HAVE ANSWERS.
          </h3>
        </div>

        {/* Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '840px', margin: '0 auto' }}>
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  background: isOpen ? 'rgba(212, 175, 55, 0.06)' : 'var(--bg-secondary)',
                  border: `1px solid ${isOpen ? 'var(--border-gold-strong)' : 'var(--border-subtle)'}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isOpen ? 'var(--text-gold)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    gap: '12px'
                  }}
                >
                  <span>{item.question}</span>
                  {isOpen ? <ChevronUp size={18} color="var(--accent-gold)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 22px 20px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                    paddingTop: '14px'
                  }}>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
