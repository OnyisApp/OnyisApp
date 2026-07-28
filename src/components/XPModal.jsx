import React from 'react';
import { Award, Zap, X, Gift, Crown, Gem, Flame, Trophy, Sparkles, ShieldCheck, Coins } from 'lucide-react';

export const getVipTitle = (lvl) => {
  const titles = [
    { level: 0, title: 'Novice Degen', color: '#9DA6B4', icon: Award },
    { level: 1, title: 'Bronze Gambler', color: '#CD7F32', icon: Award },
    { level: 2, title: 'Silver Highroller', color: '#C0C0C0', icon: Award },
    { level: 3, title: 'Gold Chart Rider', color: '#FFD700', icon: Crown },
    { level: 4, title: 'Platinum Bull', color: '#E5E4E2', icon: Gem },
    { level: 5, title: 'Diamond Whale', color: '#00FFFF', icon: Sparkles },
    { level: 6, title: 'Master Apex', color: '#A020F0', icon: ShieldCheck },
    { level: 7, title: 'Grandmaster Monarch', color: '#9370DB', icon: Zap },
    { level: 8, title: 'Overlord Syndicate', color: '#FF4500', icon: Flame },
    { level: 9, title: 'Mythic Titan', color: '#2EBD85', icon: Trophy },
    { level: 10, title: 'ONYIS Sovereign', color: '#FFDF00', icon: Sparkles }
  ];
  if (lvl < titles.length) return titles[lvl];
  return { level: lvl, title: 'Degen King', color: '#FFDF00', icon: Crown };
};

export default function XPModal({ isOpen, onClose, level = 0, xp, nextLevelXp }) {
  if (!isOpen) return null;

  const currentVip = getVipTitle(level);
  const VipIcon = currentVip.icon || Award;

  const safeXp = typeof xp === 'number' && !isNaN(xp) ? xp : 0;
  const safeNextXp = typeof nextLevelXp === 'number' && !isNaN(nextLevelXp) && nextLevelXp > 0 ? nextLevelXp : 250;
  const progressPercent = Math.min(100, Math.max(0, Math.round((safeXp / safeNextXp) * 100)));

  const matrixLevels = [
    { lvl: 'L1', xp: '250 XP', rake: '0.5%', perk: '5 USDG Bonus', icon: Award, color: '#CD7F32' },
    { lvl: 'L2', xp: '500 XP', rake: '1.0%', perk: '15 USDG Bonus', icon: Award, color: '#C0C0C0' },
    { lvl: 'L3', xp: '1,000 XP', rake: '2.0%', perk: '35 USDG + Gold Chat Badge', icon: Crown, color: '#FFD700' },
    { lvl: 'L4', xp: '2,000 XP', rake: '3.5%', perk: 'Priority Withdrawals', icon: Gem, color: '#E5E4E2' },
    { lvl: 'L5', xp: '5,000 XP', rake: '5.0%', perk: '100 USDG + 0.05% Lossback', icon: Sparkles, color: '#00FFFF' },
    { lvl: 'L6', xp: '7,000 XP', rake: '7.0%', perk: '200 USDG Bonus', icon: ShieldCheck, color: '#A020F0' },
    { lvl: 'L7', xp: '8,500 XP', rake: '9.0%', perk: '350 USDG Bonus', icon: Zap, color: '#9370DB' },
    { lvl: 'L8', xp: '10,000 XP', rake: '11.0%', perk: 'Overlord Tag', icon: Flame, color: '#FF4500' },
    { lvl: 'L9', xp: '20,000 XP', rake: '13.5%', perk: '1,000 USDG + Personal Concierge', icon: Trophy, color: '#2EBD85' },
    { lvl: 'L10+', xp: '50,000 XP', rake: '15.0% MAX', perk: '2,500 USDG + Airdrop Priority', icon: Sparkles, color: '#FFDF00' }
  ];

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
            <VipIcon size={13} color={currentVip.color} />
            <span>Lvl {level} · {currentVip.title}</span>
          </div>
        </div>

        {/* Progress Display */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem', color: currentVip.color, fontWeight: 700, marginBottom: '2px' }}>
            <VipIcon size={15} color={currentVip.color} />
            <span>{currentVip.title}</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Current Progress: <strong style={{ color: 'var(--status-success)' }}>{progressPercent}%</strong>
          </div>
          
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            {safeXp} / {safeNextXp} XP
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
            <strong style={{ color: 'var(--text-primary)' }}>{Math.max(0, safeNextXp - safeXp)} XP</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Total XP Earned:</span>
            <strong style={{ color: 'var(--text-gold)' }}>{safeXp} XP</strong>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: 'var(--text-gold)', fontWeight: 700 }}>ACTIVE VIP PERKS:</span>
            <span style={{ color: 'var(--status-success)', fontWeight: 800 }}>{level > 0 ? `${(level * 1.5).toFixed(1)}% Rakeback` : '0% Rakeback'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={14} color="var(--accent-gold)" />
              <span>Level-Up Bonus: <strong style={{ color: 'var(--text-primary)' }}>{level === 0 ? '5 USDG at Lvl 1' : `${level * 25} USDG Unlocked`}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={14} color="#2EBD85" />
              <span>Weekly Rakeback: <strong style={{ color: 'var(--text-primary)' }}>{level > 0 ? `${(level * 1.5).toFixed(1)}% Cash Back` : 'Unlocks at Level 1'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={14} color="#FFD700" />
              <span>VIP Chat Nameplate: <strong style={{ color: 'var(--text-primary)' }}>{level >= 3 ? 'GOLD EMBLEM' : 'Unlocks at Level 3'}</strong></span>
            </div>
          </div>
        </div>

        {/* Level Thresholds & Perks Table */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          marginBottom: '16px',
          maxHeight: '170px',
          overflowY: 'auto',
          fontSize: '0.78rem'
        }}>
          <div style={{ color: 'var(--text-gold)', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.5px' }}>
            VIP LEVEL PERKS & REWARDS MATRIX:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {matrixLevels.map((m) => {
              const MIcon = m.icon;
              return (
                <div key={m.lvl} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <MIcon size={13} color={m.color} style={{ flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: m.color }}>{m.lvl} ({m.xp}):</strong> <strong style={{ color: '#2EBD85' }}>{m.rake} Rakeback</strong> · {m.perk}
                  </span>
                </div>
              );
            })}
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
