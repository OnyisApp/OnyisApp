import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Settings2, History, ChevronRight } from 'lucide-react';
import ToastModal from './ToastModal';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/soundEngine';

export default function PlinkoGame({ balance, setBalance, isConnected, addLiveActivity, username, selectedCurrency = 'ETH' }) {
  const symbol = selectedCurrency;
  const defaultWager = selectedCurrency === 'USDG' ? '10.00' : '0.01';

  const [wager, setWager] = useState(defaultWager);
  const [risk, setRisk] = useState('MEDIUM'); // 'LOW', 'MEDIUM', 'HIGH'
  const [rows, setRows] = useState(12); // 8 to 16 rows
  const [isAuto, setIsAuto] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const [hasActiveDrop, setHasActiveDrop] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'error' });

  const canvasRef = useRef(null);
  const autoIntervalRef = useRef(null);
  const activeBallsRef = useRef([]);
  const slotAnimationsRef = useRef({});
  const pegRipplesRef = useRef([]);
  const dprRef = useRef(1);
  const logicalSizeRef = useRef({ w: 580, h: 460 });

  // Side panel recent drops
  const [recentPlinkos, setRecentPlinkos] = useState([
    { id: 1, player: '0x3c...22a4', wager: `0.02 ${symbol}`, mult: '4.20x', payout: `0.084 ${symbol}`, time: 'Just now', color: '#FFBF00' },
    { id: 2, player: '0x8f...11b2', wager: `0.01 ${symbol}`, mult: '1.20x', payout: `0.012 ${symbol}`, time: '18s ago', color: '#2EBD85' },
    { id: 3, player: '0x1d...9902', wager: `0.05 ${symbol}`, mult: '0.50x', payout: `0.025 ${symbol}`, time: '35s ago', color: '#4AB9F5' }
  ]);

  // Update default wager when selectedCurrency changes
  React.useEffect(() => {
    const def = selectedCurrency === 'USDG' ? '10.00' : '0.01';
    setWager(def);
  }, [selectedCurrency]);

  const wagerNum = parseFloat(wager) || 0;

  // OFFICIAL STAKE PLINKO MULTIPLIERS (8 to 16 rows)
  const getStakeOfficialMultipliers = (rCount, rLevel) => {
    const stakeTables = {
      8: {
        LOW: [5.6, 2.0, 1.0, 0.7, 0.4, 0.7, 1.0, 2.0, 5.6],
        MEDIUM: [13.0, 3.0, 1.1, 0.5, 0.3, 0.5, 1.1, 3.0, 13.0],
        HIGH: [29.0, 4.0, 1.2, 0.3, 0.1, 0.3, 1.2, 4.0, 29.0]
      },
      9: {
        LOW: [5.6, 2.0, 1.1, 0.7, 0.5, 0.5, 0.7, 1.1, 2.0, 5.6],
        MEDIUM: [18.0, 4.0, 1.2, 0.6, 0.3, 0.3, 0.6, 1.2, 4.0, 18.0],
        HIGH: [43.0, 7.0, 1.5, 0.4, 0.1, 0.1, 0.4, 1.5, 7.0, 43.0]
      },
      10: {
        LOW: [8.9, 3.0, 1.2, 0.8, 0.5, 0.4, 0.5, 0.8, 1.2, 3.0, 8.9],
        MEDIUM: [22.0, 5.0, 1.5, 0.7, 0.4, 0.3, 0.4, 0.7, 1.5, 5.0, 22.0],
        HIGH: [76.0, 10.0, 2.0, 0.5, 0.2, 0.1, 0.2, 0.5, 2.0, 10.0, 76.0]
      },
      11: {
        LOW: [8.4, 3.0, 1.4, 0.9, 0.6, 0.4, 0.4, 0.6, 0.9, 1.4, 3.0, 8.4],
        MEDIUM: [24.0, 6.0, 2.0, 0.9, 0.5, 0.3, 0.3, 0.5, 0.9, 2.0, 6.0, 24.0],
        HIGH: [120.0, 14.0, 3.0, 0.7, 0.3, 0.1, 0.1, 0.3, 0.7, 3.0, 14.0, 120.0]
      },
      12: {
        LOW: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
        MEDIUM: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
        HIGH: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170]
      },
      13: {
        LOW: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
        MEDIUM: [47, 15, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 15, 47],
        HIGH: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260]
      },
      14: {
        LOW: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
        MEDIUM: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
        HIGH: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420]
      },
      15: {
        LOW: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
        MEDIUM: [88, 18, 11, 4.5, 2, 1.2, 0.5, 0.3, 0.3, 0.5, 1.2, 2, 4.5, 11, 18, 88],
        HIGH: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620]
      },
      16: {
        LOW: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
        MEDIUM: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
        HIGH: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
      }
    };

    return stakeTables[rCount]?.[rLevel] || stakeTables[12]['MEDIUM'];
  };

  const currentMultipliers = getStakeOfficialMultipliers(rows, risk);

  const triggerToast = (title, message, type = 'error') => {
    setToast({ isOpen: true, title, message, type });
  };

  const getMultColor = (m) => {
    if (m >= 100) return '#FF0055';
    if (m >= 20) return '#FF5400';
    if (m >= 5) return '#FF9F1C';
    if (m >= 1.5) return '#FFBF00';
    if (m >= 1) return '#2EBD85';
    return '#4AB9F5';
  };

  // Dynamic Ball & Peg Dot Radius Helpers (8 to 16 rows proportion scaling with guaranteed peg gap clearance)
  const getDynamicBallRadius = (rCount) => Math.max(4.2, +(9.0 - (rCount - 8) * 0.6).toFixed(1));
  const getDynamicPegRadius = (rCount) => Math.max(2.4, +(4.8 - (rCount - 8) * 0.3).toFixed(1));

  const handleDropBall = () => {
    if (wagerNum <= 0) return triggerToast('INVALID WAGER', 'Enter a valid wager amount above zero.');
    if (wagerNum > balance) return triggerToast('INSUFFICIENT BALANCE', 'Your session vault balance is too low for this wager.');

    setBalance(prev => +(prev - wagerNum).toFixed(selectedCurrency === 'USDG' ? 2 : 4), selectedCurrency);
    setHasActiveDrop(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = dprRef.current;
    const logW = logicalSizeRef.current.w > 50 ? logicalSizeRef.current.w : 580;
    const startY = 30;

    const isHighMultiplierAllowed = Math.random() < 0.001; // 0.1% odds (1 in 1,000 drops)
    const isJackpotAllowed = Math.random() < 0.0001;       // 0.01% odds (1 in 10,000 drops)

    const currentBallRadius = getDynamicBallRadius(rows);

    const newBall = {
      id: Date.now() + Math.random(),
      wager: wagerNum,
      currency: selectedCurrency,
      x: (logW / 2) + (Math.random() - 0.5) * 1.5,
      y: startY - 10,
      vx: (Math.random() - 0.5) * 0.2,
      vy: 0.25,
      radius: currentBallRadius,
      color: risk === 'HIGH' ? '#FF5400' : risk === 'MEDIUM' ? '#FFBF00' : '#4AB9F5',
      ballMultipliers: currentMultipliers, // Lock multipliers array at moment of drop
      isHighMultiplierAllowed,
      isJackpotAllowed,
      currency: selectedCurrency // Lock currency at moment of drop
    };

    activeBallsRef.current.push(newBall);
  };

  // Autoplay Trigger
  useEffect(() => {
    if (isAuto) {
      autoIntervalRef.current = setInterval(() => {
        handleDropBall();
        setAutoCount(c => c + 1);
      }, 200);
    } else {
      clearInterval(autoIntervalRef.current);
    }
    return () => clearInterval(autoIntervalRef.current);
  }, [isAuto, balance, wager, risk, rows]);

  // HD Canvas resize observer — keeps canvas sharp at any screen DPR and prevents collapsing when tab is hidden
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const rect = container.getBoundingClientRect();
      const rectW = rect.width > 50 ? rect.width : 580;
      const rectH = rect.height > 50 ? rect.height : 460;
      const logW = Math.max(320, Math.floor(rectW - 32));
      const logH = Math.max(380, Math.floor(rectH - 32));
      logicalSizeRef.current = { w: logW, h: logH };
      canvas.width = logW * dpr;
      canvas.height = logH * dpr;
      canvas.style.width = logW + 'px';
      canvas.style.height = logH + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(container);

    window.addEventListener('resize', resizeCanvas);
    const visibilityCheck = setInterval(() => {
      if (container.offsetWidth > 50 && logicalSizeRef.current.w <= 320) {
        resizeCanvas();
      }
    }, 500);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(visibilityCheck);
    };
  }, []);

  // 60FPS STAKE PHYSICS ENGINE LOOP WITH 2-SUBTICK SMOOTH SUB-STEPPING & MOTION TRAIL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let renderId;

    const subGravity = 0.055; // Natural Earth-like gravity pace
    const restitution = 0.58; // Elastic peg bounce
    const startY = 30;

    const renderLoop = (now) => {
      const dpr = dprRef.current;
      const logW = logicalSizeRef.current.w;
      const logH = logicalSizeRef.current.h;
      const centerX = logW / 2;

      // Reset transform then apply DPR scale each frame
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, logW, logH);

      // Dynamic row height stretch so 8 rows fills the vertical canvas area comfortably
      const rowGapFactor = rows <= 8 ? 0.78 : rows <= 10 ? 0.75 : rows <= 12 ? 0.73 : 0.70;
      const rowGap = Math.floor((logH * rowGapFactor) / rows);
      const pegGap = Math.floor((logW * 0.86) / (rows + 2));

      // 1. Pyramid Peg Coordinates (logical units)
      const pegs = [];
      let bottomPegCoords = [];

      for (let r = 0; r < rows; r++) {
        const count = r + 3;
        const startX = (logW - (count - 1) * pegGap) / 2;

        for (let i = 0; i < count; i++) {
          const px = startX + i * pegGap;
          const py = startY + r * rowGap;
          pegs.push({ x: px, y: py });

          if (r === rows - 1) {
            bottomPegCoords.push({ x: px, y: py });
          }
        }
      }

      const bottomY = bottomPegCoords.length > 0 ? bottomPegCoords[0].y + 20 : logH - 44;
      const currentPegRadius = getDynamicPegRadius(rows);

      // 2. Physics Sub-Stepping Loop (2 Sub-Ticks per Frame for Silky Smooth Curves)
      const remainingBalls = [];

      for (let ball of activeBallsRef.current) {
        if (!ball.history) ball.history = [];

        let landedThisFrame = false;

        // 2 Sub-ticks per animation frame
        for (let sub = 0; sub < 2; sub++) {
          if (landedThisFrame) break;

          // Record trajectory position history for motion trail (max 5 points)
          if (sub === 0) {
            ball.history.push({ x: ball.x, y: ball.y });
            if (ball.history.length > 5) ball.history.shift();
          }

          // 100% Pure Natural Newtonian Physics Step
          ball.vx *= 0.99;
          ball.vy += subGravity;
          ball.vy = Math.min(rows >= 12 ? 2.0 : 2.4, ball.vy); // Cap maximum terminal velocity for high rows
          ball.x += ball.vx * 0.5;
          ball.y += ball.vy * 0.5;

          // Force minimum downward momentum so ball never hovers
          if (ball.vy < 0.25) {
            ball.vy = 0.25 + Math.random() * 0.15;
          }

          // Dislodge ONLY if ball is truly trapped motionless
          if (Math.abs(ball.vy) < 0.05) {
            ball.stuckTicks = (ball.stuckTicks || 0) + 1;
            if (ball.stuckTicks > 30) {
              ball.vy += 0.4;
              ball.vx += (Math.random() - 0.5) * 0.4;
              ball.stuckTicks = 0;
            }
          } else {
            ball.stuckTicks = 0;
          }

          // True Vector Reflection Peg Collision Check with Sticking Prevention
          for (let peg of pegs) {
            const dx = ball.x - peg.x;
            const dy = ball.y - peg.y;
            const dist = Math.hypot(dx, dy);
            const minDist = ball.radius + currentPegRadius - 0.2;

            if (dist < minDist && dist > 0.001) {
              const normalAngle = Math.atan2(dy, dx);
              const overlap = minDist - dist + (rows >= 12 ? 0.25 : 0.4); // Scale overlap push to prevent multi-peg overlap on high rows

              ball.x += Math.cos(normalAngle) * overlap;
              ball.y += Math.sin(normalAngle) * overlap;

              const tangentAngle = normalAngle + Math.PI / 2;
              const normalVel = ball.vx * Math.cos(normalAngle) + ball.vy * Math.sin(normalAngle);
              const tangentVel = ball.vx * Math.cos(tangentAngle) + ball.vy * Math.sin(tangentAngle);

              const newNormalVel = -Math.abs(normalVel) * restitution + (Math.random() - 0.5) * 0.18;
              ball.vx = newNormalVel * Math.cos(normalAngle) + tangentVel * Math.cos(tangentAngle);
              ball.vy = newNormalVel * Math.sin(normalAngle) + tangentVel * Math.sin(tangentAngle);

              // Organic Gaussian Boundary Reflection:
              // For standard drops (99.9%), outer pegs reflect outward velocity inward for natural bell curve distribution
              const distFromCenter = ball.x - centerX;
              const maxAllowedSpread = pegGap * (rows <= 10 ? 1.4 : 2.2);

              if (!ball.isJackpotAllowed && !ball.isHighMultiplierAllowed) {
                if ((distFromCenter > maxAllowedSpread && ball.vx > 0) || (distFromCenter < -maxAllowedSpread && ball.vx < 0)) {
                  ball.vx *= -0.55; // Natural elastic inward peg bounce
                }
              }

              // Guaranteed downward momentum floor after peg bounce so ball never gets stuck on top of pegs
              if (ball.vy < 0.4) {
                ball.vy = 0.4 + Math.random() * 0.2;
              }

              // Sound SFX & Visual Peg Ripple Impact Ring
              soundEngine.playPegBounce(peg.y / logH);
              pegRipplesRef.current.push({
                x: peg.x,
                y: peg.y,
                startTime: now,
                duration: 220,
                maxR: currentPegRadius * 3.4,
                color: ball.color
              });
            }
          }

          // Slot Landing Check (Exact peg interval matching)
          if (ball.y >= bottomY) {
            landedThisFrame = true;
            const slotsCount = rows + 1;
            
            let finalSlot = 0;
            for (let i = 0; i < slotsCount; i++) {
              if (ball.x >= bottomPegCoords[i].x && ball.x <= bottomPegCoords[i + 1].x) {
                finalSlot = i;
                break;
              }
              if (ball.x > bottomPegCoords[i + 1].x) {
                finalSlot = i;
              }
            }
            finalSlot = Math.min(slotsCount - 1, Math.max(0, finalSlot));

            const ballCurrency = ball.currency || selectedCurrency;
            const multipliersToUse = ball.ballMultipliers || currentMultipliers;
            const landedMult = multipliersToUse[finalSlot] || 1.0;
            const payoutVal = +(ball.wager * landedMult).toFixed(ballCurrency === 'USDG' ? 2 : 4);

            // Win Chime SFX
            soundEngine.playWinChime(landedMult >= 5.0);

            slotAnimationsRef.current[finalSlot] = { startTime: now, duration: 350 };
            setBalance(prev => +(prev + payoutVal).toFixed(ballCurrency === 'USDG' ? 2 : 4), ballCurrency);

            if (landedMult >= 5.0) {
              try {
                if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 45, origin: { y: 0.6 } });
              } catch (e) {
                console.warn(e);
              }
            }

            if (addLiveActivity) {
              addLiveActivity('BOLO', `@${username}`, ball.wager.toFixed(selectedCurrency === 'USDG' ? 2 : 4), landedMult.toFixed(2), payoutVal.toFixed(selectedCurrency === 'USDG' ? 2 : 3), landedMult >= 1.0, symbol);
            }

            setRecentPlinkos(prev => [
              {
                id: Date.now() + Math.random(),
                player: `@${username}`,
                wager: `${ball.wager.toFixed(selectedCurrency === 'USDG' ? 2 : 4)} ${symbol}`,
                mult: `${landedMult.toFixed(2)}x`,
                payout: `${payoutVal.toFixed(selectedCurrency === 'USDG' ? 2 : 3)} ${symbol}`,
                time: 'Just now',
                color: getMultColor(landedMult)
              },
              ...prev.slice(0, 7)
            ]);
            break; // Stop sub-stepping on landing
          }
        }

        if (!landedThisFrame) {
          remainingBalls.push(ball);
        }
      }

      activeBallsRef.current = remainingBalls;

      if (activeBallsRef.current.length === 0) {
        setHasActiveDrop(false);
      } else {
        setHasActiveDrop(true);
      }

      // 2.5 Render Dynamic Peg Impact Ripples
      const remainingRipples = [];
      for (let r of pegRipplesRef.current) {
        const elapsed = now - r.startTime;
        if (elapsed < r.duration) {
          const progress = elapsed / r.duration;
          const curR = getDynamicPegRadius(rows) + (r.maxR - getDynamicPegRadius(rows)) * progress;
          const alpha = 1 - progress;
          ctx.beginPath();
          ctx.arc(r.x, r.y, curR, 0, Math.PI * 2);
          ctx.strokeStyle = r.color + Math.floor(alpha * 180).toString(16).padStart(2, '0');
          ctx.lineWidth = 1.6;
          ctx.stroke();
          remainingRipples.push(r);
        }
      }
      pegRipplesRef.current = remainingRipples;

      // 3. Render Pyramid Pegs — crisp with sub-pixel hint off & dynamic scaling per row
      ctx.shadowBlur = 0;
      const basePegRadius = getDynamicPegRadius(rows);

      for (let peg of pegs) {
        let isHit = false;
        for (let b of activeBallsRef.current) {
          if (Math.hypot(b.x - peg.x, b.y - peg.y) < (b.radius + basePegRadius + 4)) { isHit = true; break; }
        }

        const drawPegRadius = isHit ? +(basePegRadius * 1.35).toFixed(1) : basePegRadius;

        ctx.beginPath();
        ctx.arc(Math.round(peg.x), Math.round(peg.y), drawPegRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? '#FFBF00' : '#FFFFFF';
        if (isHit) {
          ctx.shadowColor = '#FFBF00';
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      // 4. Multiplier Slot Cards — precisely centered between bottom pegs
      if (bottomPegCoords.length === rows + 2) {
        const slotsCount = rows + 1;
        const totalGapWidth = bottomPegCoords[bottomPegCoords.length - 1].x - bottomPegCoords[0].x;
        const rawSlotW = totalGapWidth / slotsCount;
        const cardWidth = Math.max(16, Math.min(42, rawSlotW - (rows <= 8 ? 4 : 2)));
        const cardHeight = rows <= 8 ? 28 : rows <= 10 ? 25 : rows <= 12 ? 22 : 18;
        const cardY = bottomPegCoords[0].y + (rows <= 8 ? 16 : 14);

        for (let i = 0; i < slotsCount; i++) {
          const gapCenterX = (bottomPegCoords[i].x + bottomPegCoords[i + 1].x) / 2;
          let drawX = gapCenterX - cardWidth / 2;
          let drawY = cardY;
          let drawW = cardWidth;
          let drawH = cardHeight;

          const anim = slotAnimationsRef.current[i];
          if (anim) {
            const elapsed = now - anim.startTime;
            if (elapsed < anim.duration) {
              const progress = elapsed / anim.duration;
              const scale = 1 + Math.sin(progress * Math.PI) * 0.4;
              drawW *= scale;
              drawH *= scale;
              drawX = gapCenterX - drawW / 2;
              drawY = cardY + (cardHeight - drawH) / 2;
            } else {
              delete slotAnimationsRef.current[i];
            }
          }

          const multVal = currentMultipliers[i];
          const color = getMultColor(multVal);

          ctx.beginPath();
          ctx.roundRect(Math.round(drawX), Math.round(drawY), Math.round(drawW), Math.round(drawH), 4);
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = anim ? 14 : 3;
          ctx.fill();
          ctx.shadowBlur = 0;

          const fontSize = rows <= 8 ? 12 : rows <= 10 ? 11 : rows <= 12 ? 9.5 : 8;
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = '#090A0C';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const label = multVal >= 1000 ? '1k' : multVal >= 100 ? `${Math.round(multVal)}` : `${multVal}`;
          ctx.fillText(label, gapCenterX, drawY + drawH / 2);
        }
      }

      ctx.shadowBlur = 0;

      // 5. Render Active Balls with Motion Trail
      for (let ball of activeBallsRef.current) {
        const r = ball.radius || getDynamicBallRadius(rows);

        // Motion trail
        if (ball.history && ball.history.length > 0) {
          for (let h = 0; h < ball.history.length; h++) {
            const pos = ball.history[h];
            const alpha = ((h + 1) / ball.history.length) * 0.35;
            const trailR = r * (0.5 + (h / ball.history.length) * 0.4);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, trailR, 0, Math.PI * 2);
            ctx.fillStyle = ball.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fill();
          }
        }

        // Glow halo
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, r + 5, 0, Math.PI * 2);
        ctx.fillStyle = ball.color + '33';
        ctx.fill();

        // Core ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      renderId = requestAnimationFrame(renderLoop);
    };

    renderId = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(renderId);
  }, [risk, rows]);

  return (
    <>
      <div className="game-container-padding game-layout-grid" style={{ maxWidth: '1240px', margin: '24px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '320px 1fr 300px', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Game Sidebar Controls */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', height: '540px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-gold)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            <Settings2 size={18} /> BOLO GAME CONTROLS
          </div>

          {/* Bet Amount Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Bet Amount ({symbol})
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="number"
                step={selectedCurrency === 'USDG' ? "0.01" : "0.0001"}
                disabled={hasActiveDrop || isAuto}
                value={wager}
                onChange={(e) => setWager(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  opacity: (hasActiveDrop || isAuto) ? 0.6 : 1
                }}
              />
              <button
                disabled={hasActiveDrop || isAuto}
                onClick={() => setWager((wagerNum / 2).toFixed(selectedCurrency === 'USDG' ? 2 : 4))}
                style={{ padding: '0 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', opacity: (hasActiveDrop || isAuto) ? 0.6 : 1 }}
              >
                ½
              </button>
              <button
                disabled={hasActiveDrop || isAuto}
                onClick={() => setWager((wagerNum * 2).toFixed(selectedCurrency === 'USDG' ? 2 : 4))}
                style={{ padding: '0 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', opacity: (hasActiveDrop || isAuto) ? 0.6 : 1 }}
              >
                2×
              </button>
            </div>
          </div>

          {/* Risk Selector (Disabled during active drop or auto-drop) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Risk Level
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['LOW', 'MEDIUM', 'HIGH'].map((lvl) => (
                <button
                  key={lvl}
                  disabled={hasActiveDrop || isAuto}
                  onClick={() => setRisk(lvl)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '6px',
                    background: risk === lvl ? 'rgba(212, 175, 55, 0.2)' : 'var(--bg-secondary)',
                    border: '1px solid ' + (risk === lvl ? 'var(--border-gold-strong)' : 'var(--border-subtle)'),
                    color: risk === lvl ? 'var(--text-gold)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: (hasActiveDrop || isAuto) ? 'not-allowed' : 'pointer',
                    opacity: (hasActiveDrop || isAuto) ? 0.5 : 1
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Rows Selector (Disabled during active drop or auto-drop) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Rows Pyramid</span>
              <span style={{ color: 'var(--text-gold)', fontWeight: 700 }}>{rows} Rows</span>
            </div>
            <input
              type="range"
              min={8}
              max={16}
              disabled={hasActiveDrop || isAuto}
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-gold)', opacity: (hasActiveDrop || isAuto) ? 0.5 : 1 }}
            />
          </div>

          {/* Drop & Auto Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <button
              className="gold-button"
              onClick={handleDropBall}
              style={{ width: '100%', height: '46px', fontSize: '0.95rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Play size={16} fill="currentColor" /> DROP BOLO
            </button>

            <button
              onClick={() => setIsAuto(!isAuto)}
              style={{
                width: '100%',
                height: '42px',
                background: isAuto ? 'rgba(246, 70, 93, 0.2)' : 'var(--bg-secondary)',
                border: '1px solid ' + (isAuto ? 'var(--status-danger)' : 'var(--border-subtle)'),
                color: isAuto ? 'var(--status-danger)' : 'var(--text-primary)',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} /> {isAuto ? `STOP AUTO (${autoCount})` : 'AUTO DROP'}
            </button>
          </div>
        </div>

        {/* Center Column: Stake-Style Real Physics Canvas Board */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', height: '540px', boxSizing: 'border-box' }}>
          <canvas
            ref={canvasRef}
            style={{ display: 'block', background: 'transparent', imageRendering: 'crisp-edges' }}
          />
        </div>

        {/* Right Column: Live Plinko History */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '540px', boxSizing: 'border-box', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
            <History size={18} color="var(--accent-gold)" /> LIVE BOLO DROPS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', maxHeight: '440px', paddingRight: '4px' }}>
            {recentPlinkos.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem'
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.player}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Bet {p.wager}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: p.color }}>{p.mult}</div>
                  <div style={{ color: 'var(--text-gold)', fontWeight: 600, fontSize: '0.75rem' }}>+{p.payout}</div>
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
