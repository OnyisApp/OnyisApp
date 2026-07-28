import React, { useState } from 'react';
import { Award, ChevronLeft, ChevronRight, Zap, X, Shield } from 'lucide-react';

export const getVipTitle = (lvl) => {
  const titles = [
    { level: 0, title: 'Novice Degen', color: '#9DA6B4', badge: '🥉' },
    { level: 1, title: 'Bronze Gambler', color: '#CD7F32', badge: '🥉' },
    { level: 2, title: 'Silver Highroller', color: '#C0C0C0', badge: '🥈' },
    { level: 3, title: 'Gold Chart Rider', color: '#FFD700', badge: '🥇' },
    { level: 4, title: 'Platinum Bull', color: '#E5E4E2', badge: '💎' },
    { level: 5, title: 'Diamond Whale', color: '#00FFFF', badge: '🔮' },
    { level: 6, title: 'Master Apex', color: '#A020F0', badge: '👑' },
    { level: 7, title: 'Grandmaster Monarch', color: '#9370DB', badge: '⚡' },
    { level: 8, title: 'Overlord Syndicate', color: '#FF4500', badge: '🔥' },
    { level: 9, title: 'Mythic Titan', color: '#2EBD85', badge: '🏆' },
    { level: 10, title: 'ONYIS Sovereign', color: '#FFDF00', badge: '🌌' }
  ];
  if (lvl < titles.length) return titles[lvl];
  return { level: lvl, title: 'Degen King', color: '#FFDF00', badge: '👑' };
};

export default function XPModal({ isOpen, onClose, level = 0, xp, nextLevelXp }) {
  if (!isOpen) return null;

  const currentVip = getVipTitle(level);
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
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: `1px solid ${currentVip.color}`,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: currentVip.color
          }}>
            <span>{currentVip.badge}</span>
            <span>Lvl {level} · {currentVip.title}</span>
          </div>
        </div>

        {/* Progress Display */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.9rem', color: currentVip.color, fontWeight: 700, marginBottom: '2px' }}>
            {currentVip.badge} {currentVip.title}
          </div>
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

        {/* VIP Active Perks & Unlocks Card */}
        <div style={{
          padding: '14px',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid var(--border-gold)',
          borderRadius: '10px',
          marginBottom: '16px',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-gold)', fontWeight: 700 }}>ACTIVE VIP PERKS:</span>
            <span style={{ color: 'var(--status-success)', fontWeight: 800 }}>{level > 0 ? `${(level * 1.5).toFixed(1)}% Rakeback` : '0% Rakeback'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
            <div>• 🎁 Level-Up Bonus: <strong style={{ color: 'var(--text-primary)' }}>{level === 0 ? '5 USDG at Lvl 1' : `${level * 25} USDG Unlocked`}</strong></div>
            <div>• ⚡ Weekly Rakeback: <strong style={{ color: 'var(--text-primary)' }}>{level > 0 ? `${(level * 1.5).toFixed(1)}% Cash Back` : 'Unlocks at Level 1'}</strong></div>
            <div>• 👑 VIP Chat Nameplate: <strong style={{ color: 'var(--text-primary)' }}>{level >= 3 ? 'GOLD EMBLEM' : 'Unlocks at Level 3'}</strong></div>
          </div>
        </div>

        {/* Level Thresholds & Perks Table */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          marginBottom: '16px',
          maxHeight: '160px',
          overflowY: 'auto',
          fontSize: '0.76rem'
        }}>
          <div style={{ color: 'var(--text-gold)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' }}>
            VIP LEVEL PERKS & REWARDS MATRIX:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)' }}>
            <div>🥉 L1 (250 XP): <strong style={{ color: '#2EBD85' }}>0.5% Rakeback</strong> · 5 USDG Bonus</div>
            <div>🥈 L2 (500 XP): <strong style={{ color: '#2EBD85' }}>1.0% Rakeback</strong> · 15 USDG Bonus</div>
            <div>🥇 L3 (1,000 XP): <strong style={{ color: '#2EBD85' }}>2.0% Rakeback</strong> · 35 USDG + Gold Chat Badge</div>
            <div>💎 L4 (2,000 XP): <strong style={{ color: '#2EBD85' }}>3.5% Rakeback</strong> · Priority Withdrawals</div>
            <div>🔮 L5 (5,000 XP): <strong style={{ color: '#2EBD85' }}>5.0% Rakeback</strong> · 100 USDG + 0.05% Lossback</div>
            <div>👑 L6 (7,000 XP): <strong style={{ color: '#2EBD85' }}>7.0% Rakeback</strong> · 200 USDG Bonus</div>
            <div>⚡ L7 (8,500 XP): <strong style={{ color: '#2EBD85' }}>9.0% Rakeback</strong> · 350 USDG Bonus</div>
            <div>🔥 L8 (10,000 XP): <strong style={{ color: '#2EBD85' }}>11.0% Rakeback</strong> · Overlord Tag</div>
            <div>🏆 L9 (20,000 XP): <strong style={{ color: '#2EBD85' }}>13.5% Rakeback</strong> · 1,000 USDG + Personal Concierge</div>
            <div>🌌 L10+ (50,000 XP): <strong style={{ color: '#2EBD85' }}>15.0% MAX Rakeback</strong> · 2,500 USDG + Airdrop Priority</div>
          </div>
        </div>

        {/* Rules Box */}
        <div style={{
          padding: '12px',
          background: 'rgba(212, 175, 55, 0.06)',
          border: '1px solid var(--border-gold)',
          borderRadius: '10px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          Earn <strong style={{ color: 'var(--status-success)' }}>1 XP</strong> per <strong style={{ color: 'var(--text-gold)' }}>$1 Wagered</strong> (<strong style={{ color: 'var(--status-success)' }}>1 XP</strong> per 1 USDG · <strong style={{ color: 'var(--status-success)' }}>30 XP</strong> per 0.01 ETH) across FLIPO, RUGO & BOLO.
        </div>
      </div>
    </div>
  );
}
