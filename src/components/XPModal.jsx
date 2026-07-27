import React, { useState } from 'react';
import { Award, ChevronLeft, ChevronRight, Zap, X, Shield } from 'lucide-react';

export default function XPModal({ isOpen, onClose, level, xp, nextLevelXp }) {
  if (!isOpen) return null;

  const safeXp = typeof xp === 'number' && !isNaN(xp) ? xp : 0;
  const safeNextXp = typeof nextLevelXp === 'number' && !isNaN(nextLevelXp) && nextLevelXp > 0 ? nextLevelXp : 150;
  const progressPercent = Math.min(100, Math.max(0, Math.round((safeXp / safeNextXp) * 100)));

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.78)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      padding: '20px'
    }}>
      <div className="glass-panel modal-content" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '28px',
        position: 'relative',
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="var(--accent-gold)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.25rem', letterSpacing: '1px' }}>
              XP INFORMATION
            </h3>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--border-gold)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-gold)'
          }}>
            <Shield size={12} /> Level {level}
          </div>
        </div>

        {/* Progress Display */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Current Progress: <strong style={{ color: 'var(--status-success)' }}>{progressPercent}%</strong>
          </div>
          
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            {xp} / {nextLevelXp} XP
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '10px',
            background: 'var(--bg-secondary)',
            borderRadius: '5px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'var(--accent-gold-gradient)',
              boxShadow: '0 0 10px var(--accent-gold)',
              transition: 'var(--transition-smooth)'
            }} />
          </div>
        </div>

        {/* XP Stats Box */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>XP to Next Level:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{nextLevelXp - xp} XP</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Total XP Earned:</span>
            <strong style={{ color: 'var(--text-gold)' }}>{xp} XP</strong>
          </div>
        </div>

        {/* Rules Box */}
        <div style={{
          padding: '14px',
          background: 'rgba(212, 175, 55, 0.06)',
          border: '1px solid var(--border-gold)',
          borderRadius: '10px',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          Earn <strong style={{ color: 'var(--status-success)' }}>25 XP</strong> per <strong style={{ color: 'var(--text-gold)' }}>0.01 ETH</strong> bet · <strong style={{ color: 'var(--status-success)' }}>1 XP</strong> per <strong style={{ color: 'var(--text-gold)' }}>1 USDG</strong> bet on FLIPO, RUGO & BOLO.
        </div>
      </div>
    </div>
  );
}
