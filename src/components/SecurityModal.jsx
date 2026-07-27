import React from 'react';
import { ShieldCheck, Lock, Key, Cpu, X } from 'lucide-react';

export default function SecurityModal({ isOpen, onClose }) {
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
          <ShieldCheck size={24} color="var(--accent-gold)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.35rem', letterSpacing: '1px' }}>
            ONYIS VAULT SECURITY ARCHITECTURE
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          Overview of ONYIS non-custodial session vault system designed specifically for instant Robinhood Wallet transactions.
        </p>

        {/* Security Pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-gold)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
              <Lock size={16} /> 1. Ephemeral Multi-Sig Session Vaults
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Funds deposited into ONYIS do not enter a centralized pool. Each user session generates an isolated smart vault tied strictly to your Robinhood Wallet signature.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-gold)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
              <Key size={16} /> 2. Instant Emergency Self-Withdrawal
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              You maintain 100% cryptographic authority. If our web servers ever go offline, a hardcoded Smart Contract timelock allows instant emergency withdrawal directly back to your wallet.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-gold)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
              <Cpu size={16} /> 3. Zero Gas Friction (Off-Chain Execution)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Gameplay actions (FLIPO & RUGO) execute off-chain in ultra-fast state channels. On-chain gas fees are paid only twice: when you open and close your session vault.
            </p>
          </div>
        </div>

        <button className="gold-button" onClick={onClose} style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}>
          Close Security Overview
        </button>
      </div>
    </div>
  );
}
