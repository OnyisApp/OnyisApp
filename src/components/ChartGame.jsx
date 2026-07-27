import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, Shield, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import ToastModal from './ToastModal';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/soundEngine';

const MOCK_NAMES = [
  'Satoshi_King', 'DegenApe_99', 'Whale_Watcher', 'CryptoChad_X', 'MoonShot_Pro',
  'Solana_Rider', 'Pepe_HODL', 'Robinhooder_1', 'EthMaxi_77', 'BullRunner',
  '0xAlpha_G', 'Diamond_Handz', 'GigaChad_Eth', 'PumpMaster', 'LamboSoon'
];

export default function ChartGame({ balance, setBalance, isConnected, addLiveActivity, username, selectedCurrency = 'ETH' }) {
  const symbol = selectedCurrency;
  const defaultWager = selectedCurrency === 'USDG' ? '50.00' : '0.05';

  const [wager, setWager] = useState(defaultWager);
  const [initialWager, setInitialWager] = useState(defaultWager);
  const [multiplier, setMultiplier] = useState(1.00);
  const [roundState, setRoundState] = useState('WAITING'); // 'WAITING' | 'RUNNING' | 'CRASHED'
  const [countdown, setCountdown] = useState(5);
  const [crashPoint, setCrashPoint] = useState(2.45);
  const [playerBet, setPlayerBet] = useState(null); // Active bet for CURRENT round: { wager, hasCashedOut: false }
  const [queuedNextBet, setQueuedNextBet] = useState(null); // Bet queued for NEXT round: { wager }
  const [crashHistory, setCrashHistory] = useState([1.42, 2.87, 1.05, 5.33, 1.21, 3.67, 1.02, 8.14, 2.01, 1.37]); // Last 10 crash points

  // Auto-Cashout & Auto-Bet Strategy State
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);
  const [autoCashoutTarget, setAutoCashoutTarget] = useState('2.00');
  const [isAutoBet, setIsAutoBet] = useState(false);
  const [autoBetMode, setAutoBetMode] = useState('FIXED'); // 'FIXED' | 'MARTINGALE'

  // Dynamic Real-time Live Active Betters Array
  const [lobbyBots, setLobbyBots] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'error' });

  // Candlestick storage & multiplier ref for live trade chart
  const candlesRef = useRef([]);
  const multiplierRef = useRef(1.00);
  // Synchronized Engine Refs to prevent useEffect dependency re-subscriptions from spawning duplicate intervals
  const playerBetRef = useRef(playerBet);
  const queuedNextBetRef = useRef(queuedNextBet);
  const crashPointRef = useRef(crashPoint);
  const autoCashoutRef = useRef({ enabled: autoCashoutEnabled, target: autoCashoutTarget });
  const isAutoBetRef = useRef(isAutoBet);
  const autoBetModeRef = useRef(autoBetMode);
  const wagerRef = useRef(wager);
  const initialWagerRef = useRef(initialWager);

  useEffect(() => { playerBetRef.current = playerBet; }, [playerBet]);
  useEffect(() => { queuedNextBetRef.current = queuedNextBet; }, [queuedNextBet]);
  useEffect(() => { crashPointRef.current = crashPoint; }, [crashPoint]);
  useEffect(() => { autoCashoutRef.current = { enabled: autoCashoutEnabled, target: autoCashoutTarget }; }, [autoCashoutEnabled, autoCashoutTarget]);
  useEffect(() => { isAutoBetRef.current = isAutoBet; }, [isAutoBet]);
  useEffect(() => { autoBetModeRef.current = autoBetMode; }, [autoBetMode]);
  useEffect(() => { wagerRef.current = wager; }, [wager]);
  useEffect(() => { initialWagerRef.current = initialWager; }, [initialWager]);

  // Update default wager when currency changes
  useEffect(() => {
    const def = selectedCurrency === 'USDG' ? '50.00' : '0.05';
    setWager(def);
    setInitialWager(def);
  }, [selectedCurrency]);

  const triggerToast = (title, message, type = 'error') => {
    setToast({ isOpen: true, title, message, type });
  };

  // Step up / down bet amount handlers
  const handleStepUp = () => {
    const current = parseFloat(wager) || 0;
    const step = selectedCurrency === 'USDG' ? 5.0 : 0.01;
    const nextVal = (current + step).toFixed(selectedCurrency === 'USDG' ? 2 : 4);
    setWager(nextVal);
    if (!isAutoBet) setInitialWager(nextVal);
  };

  const handleStepDown = () => {
    const current = parseFloat(wager) || 0;
    const step = selectedCurrency === 'USDG' ? 5.0 : 0.01;
    if (current > step) {
      const nextVal = (current - step).toFixed(selectedCurrency === 'USDG' ? 2 : 4);
      setWager(nextVal);
      if (!isAutoBet) setInitialWager(nextVal);
    }
  };

  const handlePlaceBet = () => {
    if (playerBetRef.current || queuedNextBetRef.current) return;
    const val = parseFloat(wager);
    if (isNaN(val) || val <= 0) return;
    if (val > balance) {
      return triggerToast('INSUFFICIENT BALANCE', `Your Session Vault balance is insufficient for this wager of ${val} ${symbol}.`);
    }

    // Immediately deduct wager upfront
    setBalance(prev => +(prev - val).toFixed(selectedCurrency === 'USDG' ? 2 : 4), selectedCurrency);

    if (roundState === 'WAITING') {
      const myBetObj = { id: 'me_' + Date.now(), name: `@${username} (You)`, bet: `${val} ${symbol}`, wagerNum: val, cashedOut: false, mult: null, isUser: true };
      setPlayerBet({ wager: val, hasCashedOut: false });
      setLobbyBots(prev => [myBetObj, ...prev.filter(b => !b.isUser)]);
      triggerToast('BET PLACED', `Staked ${val} ${symbol} on RUGO Chart Battle!`, 'success');
    } else {
      setQueuedNextBet({ wager: val });
      triggerToast('BET QUEUED', `Staked ${val} ${symbol} for the NEXT RUGO round!`, 'success');
    }
  };

  const handleCashout = (customMult = null) => {
    const currentBet = playerBetRef.current;
    if (!currentBet || currentBet.hasCashedOut || roundState !== 'RUNNING') return;
    const currentM = typeof customMult === 'number' ? customMult : (multiplierRef.current || multiplier || 1.00);
    const payout = currentBet.wager * currentM;

    // Full payout added back to balance since wager was already deducted upfront
    setBalance(prev => +(prev + payout).toFixed(selectedCurrency === 'USDG' ? 2 : 4), selectedCurrency);
    setPlayerBet(prev => ({ ...prev, hasCashedOut: true, cashoutMult: currentM }));

    // Win SFX
    soundEngine.playWinChime(currentM >= 5.0);

    setLobbyBots(bots => bots.map(b => b.isUser ? { ...b, cashedOut: true, mult: currentM } : b));

    triggerToast('RUG ESCAPED!', `Cashed out @ ${currentM.toFixed(2)}x! Won +${payout.toFixed(selectedCurrency === 'USDG' ? 2 : 3)} ${symbol}!`, 'success');
    
    // Auto-Bet Martingale logic: Reset on win
    if (isAutoBetRef.current && autoBetModeRef.current === 'MARTINGALE') {
      setWager(initialWagerRef.current);
    }

    try {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    if (addLiveActivity) {
      addLiveActivity('RUGO', `@${username}`, currentBet.wager, currentM.toFixed(2), payout.toFixed(selectedCurrency === 'USDG' ? 2 : 3), true, symbol);
    }
  };

  // Generate initial random lobby of players joining per round
  const generateInitialLobby = (userBetObj = null) => {
    const randomCount = Math.floor(Math.random() * 6) + 3; // 3 to 8 bot players join initially
    const shuffled = [...MOCK_NAMES].sort(() => 0.5 - Math.random()).slice(0, randomCount);
    
    const botList = shuffled.map((name, idx) => ({
      id: Date.now() + idx,
      name,
      bet: `${selectedCurrency === 'USDG' ? (10 + Math.random() * 150).toFixed(2) : (0.01 + Math.random() * 0.35).toFixed(3)} ${symbol}`,
      wagerNum: +(selectedCurrency === 'USDG' ? (10 + Math.random() * 150).toFixed(2) : (0.01 + Math.random() * 0.35).toFixed(3)),
      cashedOut: false,
      mult: null,
      isUser: false
    }));

    if (userBetObj) {
      return [userBetObj, ...botList];
    }
    return botList;
  };

  // REAL VOLATILE MEMECOIN PRICE ENGINE (STRICTLY DEPENDS ON roundState ONLY)
  useEffect(() => {
    let timer;

    if (roundState === 'WAITING') {
      candlesRef.current = [];

      let activeUserObj = null;
      let effectiveUserBet = playerBetRef.current;

      // Promote queued bet to active bet if player queued for next round
      if (queuedNextBetRef.current) {
        effectiveUserBet = { wager: queuedNextBetRef.current.wager, hasCashedOut: false };
        setPlayerBet(effectiveUserBet);
        setQueuedNextBet(null);
      }

      if (effectiveUserBet && !effectiveUserBet.hasCashedOut) {
        activeUserObj = {
          id: 'me_' + Date.now(),
          name: `@${username} (You)`,
          bet: `${effectiveUserBet.wager} ${symbol}`,
          wagerNum: effectiveUserBet.wager,
          cashedOut: false,
          mult: null,
          isUser: true
        };
      }

      setLobbyBots(generateInitialLobby(activeUserObj));

      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);

            // House Edge Crash Point Calculation (E = 0.97 / (1 - r))
            const isInstantCrash = Math.random() < 0.03;
            let targetPeak;
            if (isInstantCrash) {
              targetPeak = +(1.00 + Math.random() * 0.05).toFixed(2);
            } else {
              const r = Math.random();
              targetPeak = Math.max(1.06, +(0.97 / (1.0001 - r * 0.96)).toFixed(2));
              targetPeak = Math.min(100.00, targetPeak);
            }

            crashPointRef.current = targetPeak;
            setCrashPoint(targetPeak);
            setMultiplier(1.00);
            multiplierRef.current = 1.00;
            
            candlesRef.current = [{ open: 1.0, high: 1.02, low: 0.99, close: 1.01, isGreen: true }];

            setRoundState('RUNNING');
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (roundState === 'RUNNING') {
      let stepCount = 0;

      timer = setInterval(() => {
        stepCount++;

        setMultiplier(prev => {
          const targetCrash = crashPointRef.current;
          const remaining = targetCrash - prev;
          const isSpike = Math.random() < 0.12;
          
          let delta;
          if (isSpike && remaining > 0.4) {
            delta = 0.15 + Math.random() * Math.min(0.8, remaining * 0.6);
          } else {
            delta = Math.max(0.01, (remaining * 0.06) + (Math.random() * 0.04));
          }

          let next = +(prev + delta).toFixed(2);
          if (next >= targetCrash) {
            next = targetCrash;
          }

          multiplierRef.current = next;

          const candles = candlesRef.current;
          const lastCandle = candles[candles.length - 1];

          // Create new candle every 5 ticks (300ms), update current candle continuously every tick (60ms)
          if (candles.length === 0 || stepCount % 5 === 0) {
            const openVal = lastCandle ? lastCandle.close : 1.0;
            const closeVal = next;
            const highVal = +Math.max(openVal, closeVal, +(Math.max(openVal, closeVal) + 0.01 + Math.random() * 0.03)).toFixed(2);
            const lowVal = +Math.max(1.0, Math.min(openVal, closeVal) - (0.01 + Math.random() * 0.02)).toFixed(2);

            candles.push({
              open: openVal,
              high: highVal,
              low: lowVal,
              close: closeVal,
              isGreen: closeVal >= openVal
            });
          } else if (lastCandle) {
            lastCandle.close = next;
            lastCandle.high = Math.max(lastCandle.high, next, +(next + 0.01 + Math.random() * 0.02).toFixed(2));
            lastCandle.low = Math.min(lastCandle.low, next, +(next - 0.01 - Math.random() * 0.02).toFixed(2));
            lastCandle.isGreen = lastCandle.close >= lastCandle.open;
          }

          setLobbyBots(bots => bots.map(b => {
            if (!b.cashedOut && !b.isUser && next >= 1.25 && Math.random() < 0.05) {
              return { ...b, cashedOut: true, mult: next };
            }
            return b;
          }));

          // Auto-Cashout trigger check
          const { enabled, target } = autoCashoutRef.current;
          const activeBet = playerBetRef.current;
          if (enabled && activeBet && !activeBet.hasCashedOut) {
            const targetM = parseFloat(target) || 2.0;
            if (next >= targetM) {
              handleCashout(next);
            }
          }

          if (next >= targetCrash) {
            clearInterval(timer);
            setRoundState('CRASHED');
            setMultiplier(0.00);
            multiplierRef.current = 0.00;
            soundEngine.playCrashSound();
            
            const activeBetAtCrash = playerBetRef.current;
            if (activeBetAtCrash && !activeBetAtCrash.hasCashedOut) {
              triggerToast('RUGGED!', `Chart rugged at ${targetCrash.toFixed(2)}x! Staked ${activeBetAtCrash.wager} ${symbol} lost.`, 'error');
              if (addLiveActivity) {
                addLiveActivity('RUGO', `@${username}`, activeBetAtCrash.wager, '0.00', '0.000', false, symbol);
              }

              if (isAutoBetRef.current && autoBetModeRef.current === 'MARTINGALE') {
                const currentW = parseFloat(wagerRef.current);
                if (!isNaN(currentW)) {
                  const doubled = (currentW * 2).toFixed(selectedCurrency === 'USDG' ? 2 : 4);
                  setWager(doubled);
                }
              }
            }

            // Store this round's crash point in history
            setCrashHistory(prev => [next, ...prev].slice(0, 20));

            setTimeout(() => {
              setPlayerBet(null);
              setRoundState('WAITING');
            }, 3000);

            return next;
          }
          return next;
        });
      }, 60);
    }

    return () => clearInterval(timer);
  }, [roundState]);

  // Auto-Bet Execution
  useEffect(() => {
    if (isAutoBet && roundState === 'WAITING' && !playerBet && countdown === 2) {
      const val = parseFloat(wager);
      if (!isNaN(val) && val > 0 && val <= balance) {
        handlePlaceBet();
      }
    }
  }, [isAutoBet, roundState, countdown, playerBet, wager, balance]);

  const candles = candlesRef.current;
  // Cap displayed candles to last 35 to prevent layout stretching or overflow
  const displayCandles = candles.slice(-35);
  const maxPrice = Math.max(2.0, ...displayCandles.map(c => c.high), multiplier + 0.5);

  return (
    <>
      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '28px', minWidth: 0 }}>
        
        {/* Main Chart Battle Canvas Arena */}
        <div className="glass-panel" style={{ padding: '28px', position: 'relative', minWidth: 0, overflow: 'hidden' }}>
          
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={24} color="var(--accent-gold)" />
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.4rem', letterSpacing: '1px' }}>
                RUGO LIVE CANDLE BATTLE
              </h3>
            </div>

            <div style={{
              fontSize: '0.75rem',
              color: roundState === 'RUNNING' ? 'var(--status-success)' : roundState === 'CRASHED' ? 'var(--status-danger)' : 'var(--text-gold)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              {roundState === 'RUNNING' && '🟢 LIVE PUMPING'}
              {roundState === 'CRASHED' && '🔴 RUGGED!'}
              {roundState === 'WAITING' && `⏳ NEXT ROUND IN ${countdown}s`}
            </div>
          </div>

          {/* Real-time Candlestick Chart Display */}
          <div style={{
            height: '320px',
            background: '#0D0E12',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '20px 40px 30px 20px',
            boxSizing: 'border-box'
          }}>
            {/* Grid Overlay Lines */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15, pointerEvents: 'none', background: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* Price Y-Axis Labels */}
            <div style={{ position: 'absolute', right: '12px', top: '16px', bottom: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              <div>{maxPrice.toFixed(2)}x</div>
              <div>{(maxPrice * 0.75).toFixed(2)}x</div>
              <div>{(maxPrice * 0.50).toFixed(2)}x</div>
              <div>{(maxPrice * 0.25).toFixed(2)}x</div>
              <div>1.00x</div>
            </div>

            {/* Center Live Multiplier Floating Overlay */}
            <div style={{
              position: 'absolute',
              top: '45%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 10,
              pointerEvents: 'none',
              background: 'rgba(13, 14, 18, 0.82)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              padding: '16px 36px',
              borderRadius: '20px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap'
            }}>
              {roundState === 'RUNNING' && (
                <div style={{
                  fontSize: '4.2rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  textShadow: '0 0 25px rgba(46, 189, 133, 0.7), 0 2px 10px rgba(0, 0, 0, 0.95)',
                  lineHeight: 1,
                  letterSpacing: '1px'
                }}>
                  {multiplier.toFixed(2)}x
                </div>
              )}

              {roundState === 'CRASHED' && (
                <div>
                  <div style={{
                    fontSize: '3.2rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 900,
                    color: '#F6465D',
                    textShadow: '0 0 25px rgba(246, 70, 93, 0.7), 0 2px 10px rgba(0, 0, 0, 0.95)',
                    lineHeight: 1
                  }}>
                    RUGGED @ 0.00x
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>
                    Next RUGO round launching...
                  </div>
                </div>
              )}

              {roundState === 'WAITING' && (
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-gold)', fontWeight: 800, letterSpacing: '1px', marginBottom: '4px' }}>
                    PREPARING RUGO LAUNCH
                  </div>
                  <div style={{
                    fontSize: '3.5rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.6), 0 2px 10px rgba(0, 0, 0, 0.95)'
                  }}>
                    {countdown}s
                  </div>
                </div>
              )}
            </div>

            {/* Candlesticks Render Container */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: '4px', width: '100%', height: '100%', zIndex: 2, overflow: 'hidden', minWidth: 0 }}>
              {displayCandles.map((c, i) => {
                const heightPercent = Math.min(98, Math.max(4, ((c.close - 1.0) / (maxPrice - 1.0)) * 98));
                const candleColor = c.isGreen ? '#2EBD85' : '#F6465D';
                const shadowGlow = c.isGreen ? '0 0 8px rgba(46, 189, 133, 0.5)' : '0 0 8px rgba(246, 70, 93, 0.5)';

                return (
                  <div
                    key={i}
                    style={{
                      flex: '1 1 auto',
                      maxWidth: '16px',
                      minWidth: '6px',
                      height: `${heightPercent}%`,
                      background: candleColor,
                      boxShadow: shadowGlow,
                      borderRadius: '2px',
                      position: 'relative',
                      transition: 'all 0.12s ease-out',
                      flexShrink: 1
                    }}
                  >
                    {/* Top Wick */}
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '2px',
                      height: '5px',
                      background: candleColor
                    }} />
                    {/* Bottom Wick */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-5px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '2px',
                      height: '5px',
                      background: candleColor
                    }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crash History Strip (Below Red Crash Line) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '16px',
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>HISTORY</span>
            <div style={{ display: 'flex', gap: '6px', overflow: 'hidden', flexShrink: 1, minWidth: 0 }}>
              {crashHistory.slice(0, 8).map((val, i) => {
                const isMid = val >= 1.5 && val < 3;
                const isHigh = val >= 3;
                const bg = isHigh ? 'rgba(46, 189, 133, 0.15)' : isMid ? 'rgba(212, 175, 55, 0.12)' : 'rgba(246, 70, 93, 0.12)';
                const color = isHigh ? '#2EBD85' : isMid ? '#D4AF37' : '#F6465D';
                const border = isHigh ? 'rgba(46, 189, 133, 0.35)' : isMid ? 'rgba(212, 175, 55, 0.35)' : 'rgba(246, 70, 93, 0.35)';
                return (
                  <span
                    key={i}
                    style={{
                      flexShrink: 0,
                      background: bg,
                      border: `1px solid ${border}`,
                      color,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '20px',
                      fontFamily: 'monospace',
                      opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.1)
                    }}
                  >
                    {val.toFixed(2)}x
                  </span>
                );
              })}
            </div>
          </div>

          {/* Action Bar (Bet Amount & Cashout / Bet Buttons) */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="number"
                step="0.01"
                disabled={playerBet !== null}
                value={wager}
                onChange={(e) => setWager(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 36px 0 14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <button
                  type="button"
                  disabled={playerBet !== null}
                  onClick={handleStepUp}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-gold)',
                    cursor: 'pointer',
                    padding: '1px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  disabled={playerBet !== null}
                  onClick={handleStepDown}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-gold)',
                    cursor: 'pointer',
                    padding: '1px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1.5 }}>
              {roundState === 'RUNNING' && playerBet && !playerBet.hasCashedOut ? (
                <button
                  onClick={() => handleCashout()}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    background: '#2EBD85',
                    color: '#090A0C',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  CASH OUT (+{(playerBet.wager * multiplier).toFixed(selectedCurrency === 'USDG' ? 2 : 3)} {symbol})
                </button>
              ) : queuedNextBet ? (
                <button
                  disabled
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    background: 'rgba(46, 189, 133, 0.15)',
                    border: '1px solid rgba(46, 189, 133, 0.4)',
                    color: '#2EBD85',
                    fontWeight: 800,
                    boxSizing: 'border-box'
                  }}
                >
                  QUEUED FOR NEXT ROUND ({queuedNextBet.wager} {symbol})
                </button>
              ) : playerBet ? (
                <button
                  disabled
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--text-gold)',
                    fontWeight: 700,
                    boxSizing: 'border-box'
                  }}
                >
                  {playerBet.hasCashedOut
                    ? `CASHED OUT (@${playerBet.cashoutMult ? playerBet.cashoutMult.toFixed(2) : multiplier.toFixed(2)}x)`
                    : 'BET PLACED (IN PLAY)'}
                </button>
              ) : (
                <button
                  className="gold-button"
                  onClick={handlePlaceBet}
                  style={{ width: '100%', height: '48px', padding: '0', fontSize: '0.95rem', borderRadius: '8px', boxSizing: 'border-box' }}
                >
                  BET FOR NEXT ROUND
                </button>
              )}
            </div>
          </div>

          {/* Strategy Control Panel (Auto-Cashout & Auto-Bet Martingale Engine) */}
          <div style={{
            marginTop: '16px',
            padding: '12px 18px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {/* Auto-Cashout Settings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '12px',
                  background: autoCashoutEnabled ? '#2EBD85' : 'rgba(255,255,255,0.1)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#FFF',
                  position: 'absolute',
                  top: '2px',
                  left: autoCashoutEnabled ? '18px' : '2px',
                  transition: 'all 0.2s'
                }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>Auto Cashout @</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  step="0.1"
                  min="1.01"
                  disabled={!autoCashoutEnabled}
                  value={autoCashoutTarget}
                  onChange={(e) => setAutoCashoutTarget(e.target.value)}
                  style={{
                    width: '64px',
                    padding: '4px 8px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '6px',
                    color: 'var(--text-gold)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 800 }}>x</span>
              </div>
            </div>

            {/* Auto-Bet & Martingale Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsAutoBet(!isAutoBet)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: isAutoBet ? '1px solid #2EBD85' : '1px solid var(--border-subtle)',
                  background: isAutoBet ? 'rgba(46, 189, 133, 0.15)' : 'var(--bg-card)',
                  color: isAutoBet ? '#2EBD85' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={12} color={isAutoBet ? '#2EBD85' : 'var(--text-muted)'} />
                {isAutoBet ? 'AUTO-BET ACTIVE' : 'ENABLE AUTO-BET'}
              </button>

              {isAutoBet && (
                <button
                  type="button"
                  onClick={() => setAutoBetMode(autoBetMode === 'FIXED' ? 'MARTINGALE' : 'FIXED')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    border: '1px solid var(--border-gold)',
                    background: autoBetMode === 'MARTINGALE' ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-card)',
                    color: 'var(--text-gold)',
                    cursor: 'pointer'
                  }}
                >
                  {autoBetMode === 'MARTINGALE' ? '⚡ MARTINGALE (2x ON LOSS)' : '🎯 FIXED WAGER'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Real-time Live Betters Table */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--accent-gold)" />
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                LIVE BETTERS ({lobbyBots.length})
              </h4>
            </div>

            <span style={{ fontSize: '0.7rem', color: '#2EBD85', fontWeight: 700, background: 'rgba(46, 189, 133, 0.12)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(46, 189, 133, 0.3)' }}>
              {lobbyBots.length} ACTIVE
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto',
            maxHeight: '380px',
            paddingRight: '4px'
          }}>
            {lobbyBots.map((bot) => (
              <div
                key={bot.id}
                style={{
                  padding: '10px 12px',
                  background: bot.isUser 
                    ? 'rgba(212, 175, 55, 0.14)' 
                    : (bot.cashedOut ? 'rgba(46, 189, 133, 0.08)' : 'var(--bg-secondary)'),
                  border: `1px solid ${bot.isUser ? 'var(--border-gold)' : (bot.cashedOut ? 'rgba(46, 189, 133, 0.3)' : 'var(--border-subtle)')}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div>
                  <div style={{ color: bot.isUser ? 'var(--text-gold)' : 'var(--text-primary)', fontWeight: bot.isUser ? 800 : 600, fontSize: '0.82rem' }}>
                    {bot.name}
                  </div>
                  <div style={{ color: 'var(--text-gold)', fontWeight: 700, fontSize: '0.72rem' }}>{bot.bet}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {bot.cashedOut ? (
                    <span style={{ fontWeight: 800, color: '#2EBD85', fontSize: '0.78rem' }}>
                      +{(parseFloat(bot.bet) * bot.mult).toFixed(symbol === 'USDG' ? 2 : 3)} {symbol} (@{bot.mult}x)
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: roundState === 'RUNNING' ? 'var(--text-gold)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {roundState === 'RUNNING' ? 'In Play...' : 'Waiting'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

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
