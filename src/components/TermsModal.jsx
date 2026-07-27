import React from 'react';
import { FileText, X } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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
        maxWidth: '650px',
        padding: '32px',
        position: 'relative',
        boxShadow: 'var(--shadow-card)',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <FileText size={24} color="var(--accent-gold)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.35rem', letterSpacing: '1px' }}>
            TERMS OF SERVICE
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          Please review the terms governing your access to ONYIS platform.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--text-gold)', display: 'block', marginBottom: '4px' }}>1. Eligibility & Risk Acknowledgment</strong>
            You acknowledge that gaming with crypto assets involves inherent volatility. ONYIS is an off-chain entertainment protocol. Users must adhere to local jurisdictional regulations.
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--text-gold)', display: 'block', marginBottom: '4px' }}>2. Non-Custodial Session Vaults</strong>
            ONYIS operates session vaults. You retain sole private key control over deposited funds via your Robinhood Wallet.
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--text-gold)', display: 'block', marginBottom: '4px' }}>3. Cryptographic Provable Fairness</strong>
            All game outcomes are determined by pre-hashed SHA-256 seeds. Results are final and immutable.
          </div>
        </div>

        <button className="gold-button" onClick={onClose} style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}>
          I Agree & Close
        </button>
      </div>
    </div>
  );
}
