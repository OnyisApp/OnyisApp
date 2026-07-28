import React from 'react';
import { Activity } from 'lucide-react';

export default function ActivityTicker({ activities }) {

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '24px auto 0',
      padding: '0 24px'
    }}>
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--accent-gold)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--text-primary)', letterSpacing: '1px', fontWeight: 700 }}>
              LIVE ROBINHOOD CHAIN ACTIVITY
            </span>
          </div>

          <span style={{ fontSize: '0.68rem', color: '#2EBD85', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2EBD85', display: 'inline-block' }}></span>
            REAL-TIME FEED
          </span>
        </div>

        {/* Horizontal Ticker Strip */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '4px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {activities.map((item) => (
            <div
              key={item.id}
              style={{
                minWidth: '160px',
                flex: '0 0 auto',
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid ' + (item.status === 'WIN' ? 'rgba(46, 189, 133, 0.25)' : 'rgba(246, 70, 93, 0.25)'),
                borderRadius: '8px',
                fontSize: '0.78rem',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: item.game === 'FLIPO' ? 'rgba(212, 175, 55, 0.15)' : item.game === 'BOLO' ? 'rgba(74, 185, 245, 0.15)' : 'rgba(246, 70, 93, 0.15)',
                  color: item.game === 'FLIPO' ? 'var(--text-gold)' : item.game === 'BOLO' ? '#4AB9F5' : 'var(--status-danger)'
                }}>
                  {item.game}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.time}</span>
              </div>

              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.75rem', marginBottom: '2px' }}>
                {item.player}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{item.multiplier}</span>
                <span style={{ fontWeight: 700, color: item.status === 'WIN' ? 'var(--status-success)' : 'var(--status-danger)' }}>
                  {item.outcome}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
