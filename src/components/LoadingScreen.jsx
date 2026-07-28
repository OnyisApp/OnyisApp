import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // 1.8s initial load

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setIsFadingOut(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500); // 500ms smooth curtain fade out
      }
    }, 20);

    return () => clearInterval(timer);
  }, [onComplete]);

  const getStatusText = () => {
    if (progress < 30) return 'CONNECTING TO ROBINHOOD CHAIN MAINNET (ID: 4663)...';
    if (progress < 65) return 'INITIALIZING DEDICATED BURNER VAULT & RPC...';
    if (progress < 90) return 'SYNCHRONIZING REVSHARE STAKING ORACLE...';
    return 'READY — WELCOME TO ONYIS PLATFORM';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#08090C',
        backgroundImage: `
          radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, rgba(46, 189, 133, 0.08) 0%, transparent 50%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isFadingOut ? 'none' : 'all',
        userSelect: 'none'
      }}
    >
      {/* Cybernetic Tech Grid Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 90%)',
        pointerEvents: 'none'
      }} />

      {/* Main Logo Container with Pulsing Gold Aura */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        {/* Pulsing Aura Rings */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(212, 175, 55, 0.15)',
          filter: 'blur(30px)',
          animation: 'pulse 2s ease-in-out infinite'
        }} />

        {/* Circular Gold Emblem Holding Logo */}
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'rgba(17, 19, 24, 0.85)',
          border: '2px solid rgba(212, 175, 55, 0.5)',
          boxShadow: '0 0 35px rgba(212, 175, 55, 0.3), inset 0 0 20px rgba(212, 175, 55, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px'
        }}>
          <img
            src="/htmlonyis.png"
            alt="ONYIS Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))'
            }}
          />
        </div>
      </div>

      {/* Brand Title */}
      <h1 style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '2rem',
        fontWeight: 900,
        letterSpacing: '4px',
        color: '#E5C158',
        marginBottom: '6px',
        textShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
      }}>
        ONYIS
      </h1>

      <div style={{
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '40px',
        fontWeight: 600
      }}>
        Onchain Native Yield Instant Settlement
      </div>

      {/* Progress Bar Container */}
      <div style={{ width: '320px', maxWidth: '85vw', textAlign: 'center' }}>
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '0.78rem'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
            SYSTEM BOOT
          </span>
          <span style={{ color: 'var(--text-gold)', fontFamily: 'monospace', fontWeight: 800 }}>
            {progress}%
          </span>
        </div>

        {/* Bar Track */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #D4AF37 0%, #2EBD85 100%)',
            boxShadow: '0 0 12px rgba(212, 175, 55, 0.8)',
            borderRadius: '10px',
            transition: 'width 0.05s linear'
          }} />
        </div>

        {/* Dynamic Status Text */}
        <div style={{
          fontSize: '0.68rem',
          color: '#9DA6B4',
          marginTop: '14px',
          fontFamily: 'monospace',
          height: '18px',
          letterSpacing: '0.5px'
        }}>
          {getStatusText()}
        </div>
      </div>

      {/* High-tech Footer Badges */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        fontSize: '0.7rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={13} color="#2EBD85" />
          <span>ROBINHOOD CHAIN (ID 4663)</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={13} color="#D4AF37" />
          <span>PROVABLY FAIR SHA-256</span>
        </div>
      </div>
    </div>
  );
}
