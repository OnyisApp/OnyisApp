import React from 'react';
import { Dices, TrendingUp, CircleDot, Lock } from 'lucide-react';

export default function GameSelector({ activeTab, setActiveTab }) {
  const games = [
    {
      id: 'flip',
      name: 'FLIPO',
      subtitle: 'Instant 50/50 PvP Coin Toss',
      icon: Dices,
      badge: 'PROVABLY FAIR 98% PAYOUT'
    },
    {
      id: 'chart',
      name: 'RUGO',
      subtitle: 'Battle Royale Chart Crash',
      icon: TrendingUp,
      badge: 'LIVE MULTIPLIER • PVP'
    },
    {
      id: 'plinko',
      name: 'BOLO',
      subtitle: 'Stake-Style Multi-Risk Drop',
      icon: CircleDot,
      badge: 'UP TO 1,000X MULTIPLIER'
    },
    {
      id: 'stake',
      name: 'STAKE',
      subtitle: 'Lock $ONYIS · Earn ETH Rewards',
      icon: Lock,
      badge: 'UP TO 3.0X MULTIPLIER'
    }
  ];

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '28px auto 0',
      padding: '0 24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px'
    }}>
      {games.map((g) => {
        const Icon = g.icon;
        const isActive = activeTab === g.id;
        return (
          <div
            key={g.id}
            onClick={() => setActiveTab(g.id)}
            className="glass-panel"
            style={{
              padding: '20px 24px',
              cursor: 'pointer',
              borderColor: isActive ? 'var(--border-gold-strong)' : 'var(--border-subtle)',
              background: isActive 
                ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.10) 0%, rgba(17, 19, 24, 0.95) 100%)' 
                : 'rgba(17, 19, 24, 0.65)',
              boxShadow: isActive ? '0 8px 30px rgba(212, 175, 55, 0.18)' : 'var(--shadow-card)',
              position: 'relative',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--accent-gold-gradient)',
                boxShadow: '0 0 10px var(--accent-gold)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }} />
            )}

            {/* Header row with inline left-align flex */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginBottom: '14px',
              gap: '10px'
            }}>
              {/* Icon Box */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                flexShrink: 0,
                background: isActive ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${isActive ? 'var(--border-gold)' : 'var(--border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-smooth)'
              }}>
                <Icon size={20} color={isActive ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
              </div>

              {/* Badge */}
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: isActive ? 'var(--text-gold)' : 'var(--text-muted)',
                background: isActive ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? 'var(--border-gold)' : 'var(--border-subtle)'}`,
                padding: '4px 8px',
                borderRadius: '20px',
                display: 'inline-block',
                whiteSpace: 'nowrap'
              }}>
                {g.badge}
              </span>
            </div>

            {/* Game Title */}
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '1px',
              color: isActive ? 'var(--text-gold)' : 'var(--text-primary)',
              marginBottom: '4px'
            }}>
              {g.name}
            </h3>

            {/* Subtitle */}
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4
            }}>
              {g.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
