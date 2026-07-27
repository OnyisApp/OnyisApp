import React, { useState } from 'react';
import { Dices, Shield, Zap, History, Sparkles } from 'lucide-react';
import ToastModal from './ToastModal';
import { soundEngine } from '../utils/soundEngine';

export default function CoinflipGame({ balance, setBalance, isConnected, addLiveActivity, username, selectedCurrency = 'ETH' }) {
  const symbol = selectedCurrency;
  const defaultWager = selectedCurrency === 'USDG' ? '10.00' : '0.01';

  const [side, setSide] = useState('HEADS'); // 'HEADS' or 'TAILS'
  const [wager, setWager] = useState(defaultWager);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState(null);
  const [recentFlips, setRecentFlips] = useState([
    { id: 1, side: 'HEADS', wager: `0.05 ${symbol}`, payout: `0.098 ${symbol}`, result: 'WIN' },
    { id: 2, side: 'TAILS', wager: `0.02 ${symbol}`, payout: `0.000 ${symbol}`, result: 'LOSS' },
    { id: 3, side: 'HEADS', wager: `0.01 ${symbol}`, payout: `0.0196 ${symbol}`, result: 'WIN' }
  ]);

  // Toast notification modal state
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'error' });

  // Update default wager when selectedCurrency changes
  React.useEffect(() => {
    const def = selectedCurrency === 'USDG' ? '10.00' : '0.01';
    setWager(def);
  }, [selectedCurrency]);

  const triggerToast = (title, message, type = 'error') => {
    setToast({ isOpen: true, title, message, type });
  };

  const isFlippingRef = React.useRef(false);

  const handleFlip = () => {
    if (isFlipping || isFlippingRef.current) return;
    const betVal = parseFloat(wager);
    if (isNaN(betVal) || betVal <= 0) return triggerToast('INVALID WAGER', 'Please enter a valid wager amount above zero.');
    if (betVal > balance) return triggerToast('INSUFFICIENT BALANCE', 'Your session vault balance is too low for this wager.');

    isFlippingRef.current = true;
    setIsFlipping(true);
    setCoinResult(null);
    soundEngine.playCoinFlip();

    // Deduct wager upfront immediately
    setBalance(prev => +(prev - betVal).toFixed(selectedCurrency === 'USDG' ? 2 : 4), selectedCurrency);

    setTimeout(() => {
      const isWin = Math.random() > 0.49; // 50/50 fair odds with 2% house edge
      const winningSide = isWin ? side : (side === 'HEADS' ? 'TAILS' : 'HEADS');
      const payout = isWin ? (betVal * 1.96).toFixed(selectedCurrency === 'USDG' ? 2 : 4) : '0';

      setCoinResult(winningSide);

      if (isWin) {
        setBalance(prev => +(prev + (betVal * 1.96)).toFixed(selectedCurrency === 'USDG' ? 2 : 4), selectedCurrency);
        triggerToast('FLIP WON!', `Coin landed on ${winningSide}! Won +${payout} ${symbol}!`, 'success');
        soundEngine.playWinChime(false);
      } else {
        triggerToast('FLIP LOST', `Coin landed on ${winningSide}. Staked ${betVal} ${symbol} lost.`, 'error');
      }

      setRecentFlips(prev => [
        { id: Date.now(), side: winningSide, wager: `${betVal} ${symbol}`, payout: `${payout} ${symbol}`, result: isWin ? 'WIN' : 'LOSS' },
        ...prev.slice(0, 4)
      ]);

      addLiveActivity('FLIPO', `@${username}`, betVal, '1.96', payout, isWin, symbol);

      isFlippingRef.current = false;
      setIsFlipping(false);
    }, 1800);
  };

  const displaySide = coinResult || side;

  return (
    <>
      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
          
          {/* Main Coinflip Arena */}
          <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', position: 'relative' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Dices size={24} color="var(--accent-gold)" />
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.4rem', letterSpacing: '1px' }}>
                  FLIPO ARENA
                </h3>
              </div>
              
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-gold)',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid var(--border-gold)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: 700
              }}>
                1.96X MULTIPLIER
              </div>
            </div>

            {/* Elegant Official HTMLONYIS Logo Coin Stage */}
            <div style={{ height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '144px',
                height: '144px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #FFFDF0 0%, #E5C158 45%, #996B10 85%, #4A3305 100%)',
                boxShadow: '0 0 40px rgba(212, 175, 55, 0.4), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -4px 8px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transform: isFlipping ? 'rotateY(1800deg) scale(1.12)' : 'rotateY(0deg) scale(1)',
                transition: isFlipping ? 'transform 1.8s cubic-bezier(0.15, 0.85, 0.35, 1.2)' : 'var(--transition-smooth)',
                boxSizing: 'border-box',
                padding: '6px'
              }}>
                {/* Outer Metallic Dashed Ring Rim */}
                <div style={{
                  position: 'absolute',
                  top: '4px', left: '4px', right: '4px', bottom: '4px',
                  borderRadius: '50%',
                  border: '1.5px dashed rgba(212, 175, 55, 0.8)',
                  pointerEvents: 'none',
                  zIndex: 2
                }} />

                {/* Official htmlonyis.png Circular Coin Face */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1.5px solid rgba(212, 175, 55, 0.5)',
                  background: '#090A0C'
                }}>
                  <img
                    src="/htmlonyis.png"
                    alt="ONYIS Coin"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      filter: 'contrast(1.08) brightness(1.02)'
                    }}
                  />

                  {/* Overlaid Selected Side Badge (HEADS / TAILS) */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(9, 10, 12, 0.88)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid var(--border-gold)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--text-gold)',
                    letterSpacing: '1px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
                  }}>
                    {isFlipping ? '...' : displaySide}
                  </div>
                </div>
              </div>
            </div>

            {/* Bet Options (HEADS / TAILS) */}
            <div style={{ display: 'flex', gap: '16px', maxWidth: '380px', margin: '0 auto 24px' }}>
              {['HEADS', 'TAILS'].map(option => (
                <button
                  key={option}
                  disabled={isFlipping}
                  onClick={() => setSide(option)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '10px',
                    background: side === option ? 'rgba(212, 175, 55, 0.18)' : 'var(--bg-secondary)',
                    border: '1px solid ' + (side === option ? 'var(--border-gold-strong)' : 'var(--border-subtle)'),
                    color: side === option ? 'var(--text-gold)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-heading)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Amount Inputs & Spin Button */}
            <div style={{ display: 'flex', gap: '16px', maxWidth: '440px', margin: '0 auto', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  step="0.01"
                  disabled={isFlipping}
                  value={wager}
                  onChange={(e) => setWager(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ flex: 1.5 }}>
                <button
                  className="gold-button"
                  disabled={isFlipping}
                  onClick={handleFlip}
                  style={{ width: '100%', height: '48px', padding: '0', fontSize: '1rem', borderRadius: '8px', boxSizing: 'border-box' }}
                >
                  {isFlipping ? 'FLIPPING COIN...' : 'FLIP COIN (1.96X)'}
                </button>
              </div>
            </div>
          </div>

          {/* Live Side Panel History */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <History size={18} color="var(--accent-gold)" />
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1rem', letterSpacing: '0.5px' }}>
                RECENT FLIPO ROUNDS
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentFlips.map((flip) => (
                <div
                  key={flip.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: flip.result === 'WIN' ? 'var(--status-success)' : 'var(--status-danger)' }}>
                      {flip.result} ({flip.side})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wager: {flip.wager}</div>
                  </div>

                  <div style={{ fontWeight: 700, color: flip.result === 'WIN' ? 'var(--text-gold)' : 'var(--text-muted)' }}>
                    {flip.payout}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Sleek Custom Toast Modal */}
      <ToastModal
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </>
  );
}
