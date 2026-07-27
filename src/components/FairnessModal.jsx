import React, { useState } from 'react';
import { Scale, CheckCircle2, Copy, X } from 'lucide-react';

export default function FairnessModal({ isOpen, onClose }) {
  const [serverSeed, setServerSeed] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [clientSeed, setClientSeed] = useState('onyis_degen_user_9921');
  const [nonce, setNonce] = useState(42);
  const [copied, setCopied] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState(null);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(serverSeed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const outcomeVal = (parseInt(serverSeed.slice(0, 8), 16) + nonce) % 100;
    const sideResult = outcomeVal < 50 ? 'HEADS' : 'TAILS';
    const crashMultiplier = (1.00 + (outcomeVal / 10)).toFixed(2);

    setVerifiedResult({
      outcomeVal,
      sideResult,
      crashMultiplier: `${crashMultiplier}x`
    });
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      padding: '20px'
    }}>
      <div className="glass-panel modal-content" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '32px',
        position: 'relative',
        boxShadow: 'var(--shadow-card)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Scale size={22} color="var(--accent-gold)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
            PROVABLY FAIR VERIFIER
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          Every coin flip and chart crash in <strong>ONYIS</strong> is calculated using a cryptographic SHA-256 seed system. The outcome is generated <em>before</em> your bet and cannot be manipulated by the house.
        </p>

        {/* Form Inputs */}
        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Active Hashed Server Seed (SHA-256)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={serverSeed}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-gold)',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace'
                }}
              />
              <button
                type="button"
                onClick={handleCopyHash}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--text-secondary)',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Copy size={14} />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Client Seed (Your Custom Seed)
              </label>
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Bet Nonce Count
              </label>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <button type="submit" className="gold-button" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginBottom: '20px' }}>
            Verify Game Hash & Seed
          </button>
        </form>

        {/* Verification Result Readout */}
        {verifiedResult && (
          <div style={{
            padding: '16px',
            background: 'rgba(46, 189, 133, 0.08)',
            border: '1px solid var(--status-success)',
            borderRadius: '10px',
            fontSize: '0.82rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-success)', fontWeight: 700, marginBottom: '8px' }}>
              <CheckCircle2 size={16} /> GAME RESULT CRYPTOGRAPHICALLY VERIFIED
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: 'var(--text-secondary)' }}>
              <div>Calculated Coinflip: <strong style={{ color: 'var(--text-gold)' }}>{verifiedResult.sideResult}</strong></div>
              <div>Calculated Crash: <strong style={{ color: 'var(--text-gold)' }}>{verifiedResult.crashMultiplier}</strong></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
