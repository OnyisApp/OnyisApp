import React from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2, X } from 'lucide-react';

export default function ToastModal({ isOpen, onClose, title, message, type = 'error' }) {
  if (!isOpen) return null;

  const isError = type === 'error';

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.78)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 400,
      padding: '20px'
    }}>
      <div className="glass-panel modal-content" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '28px',
        position: 'relative',
        boxShadow: 'var(--shadow-card)',
        textAlign: 'center'
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

        {/* Icon */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          margin: '0 auto 16px',
          background: isError ? 'rgba(246, 70, 93, 0.12)' : 'rgba(212, 175, 55, 0.15)',
          border: '1px solid ' + (isError ? 'rgba(246, 70, 93, 0.35)' : 'var(--border-gold)'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isError ? 'var(--status-danger)' : 'var(--accent-gold-light)',
          boxShadow: isError ? '0 0 20px rgba(246, 70, 93, 0.2)' : 'var(--shadow-gold)'
        }}>
          {isError ? <AlertCircle size={28} /> : <CheckCircle2 size={28} />}
        </div>

        {/* Title & Message */}
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          color: isError ? 'var(--status-danger)' : 'var(--text-gold)',
          fontSize: '1.25rem',
          letterSpacing: '1px',
          marginBottom: '8px'
        }}>
          {title || (isError ? 'NOTICE' : 'SUCCESS')}
        </h3>

        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '24px'
        }}>
          {message}
        </p>

        {/* Action Button */}
        <button
          className="gold-button"
          onClick={onClose}
          style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
