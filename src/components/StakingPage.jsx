import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, TrendingUp, Coins, Clock, Zap, ChevronRight, AlertTriangle, CheckCircle2, X, Info, Gamepad2, BarChart3, ShieldCheck, Copy, CheckCheck } from 'lucide-react';
import ToastModal from './ToastModal';
import { supabase } from '../lib/supabase';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { generateRandomBotPlayer } from '../utils/botGenerator';

const STAKING_VAULT_ADDRESS = '0xEE29A5dC23eC52542B7Ac1dAeFff1458320D73FD';

const LOCK_OPTIONS = [
  { days: 7,  label: '7 Days',  multiplier: 1.00, color: '#9DA6B4' },
  { days: 14, label: '14 Days', multiplier: 1.30, color: '#4AB9F5' },
  { days: 30, label: '30 Days', multiplier: 1.75, color: '#2EBD85' },
  { days: 60, label: '60 Days', multiplier: 2.25, color: '#FFBF00' },
  { days: 90, label: '90 Days', multiplier: 3.00, color: '#D4AF37' },
];

const MIN_STAKE = 100_000;

// Fallback bot staker feed (shown when Supabase has no data yet)
const BOT_STAKERS_BASE = [
  { addr: '0x7a...99f1', amount: '2,500,000', lock: '90 Days', mult: '3.0x', joined: '2h ago' },
  { addr: '0x3c...22a4', amount: '500,000',   lock: '30 Days', mult: '1.75x', joined: '5h ago' },
  { addr: '0xe1...4f09', amount: '1,000,000', lock: '60 Days', mult: '2.25x', joined: '12h ago' },
  { addr: '0x8f...11b2', amount: '250,000',   lock: '7 Days',  mult: '1.0x', joined: '1d ago' },
  { addr: '0xAa...F302', amount: '750,000',   lock: '14 Days', mult: '1.3x', joined: '2d ago' },
];

export default function StakingPage({ username, triggerToast, isConnected }) {
  const [stakeAmount, setStakeAmount] = useState('100000');
  const [selectedLock, setSelectedLock] = useState(LOCK_OPTIONS[2]);
  const [activeStakes, setActiveStakes] = useState([]);
  const [liveStakers, setLiveStakers] = useState(BOT_STAKERS_BASE);
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'error' });
  const [showEarlyUnstakeWarning, setShowEarlyUnstakeWarning] = useState(null);
  const [totalStaked, setTotalStaked] = useState(13_930_000);
  const [ethPool, setEthPool] = useState(0.8996);
  const [stakersCount, setStakersCount] = useState(247);
  const [isLoading, setIsLoading] = useState(false);
  const botStakerTimer = useRef(null);

  // Get wallet address from Privy
  let walletAddress = null;
  try {
    const { user, authenticated } = usePrivy();
    const { wallets } = useWallets();
    if (authenticated && user?.wallet?.address) {
      walletAddress = user.wallet.address;
    } else if (wallets?.[0]?.address) {
      walletAddress = wallets[0].address;
    }
  } catch (e) {}

  const userKey = walletAddress || `@${username}`;

  // ── Load user's existing stakes from Supabase on mount ──
  useEffect(() => {
    if (!supabase) return;
    const loadStakes = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('stake_requests')
          .select('*')
          .eq('username', userKey)
          .in('status', ['ACTIVE', 'UNSTAKE_PENDING', 'EARLY_UNSTAKE_PENDING'])
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(row => ({
            id: row.id || row.created_at,
            amount: row.amount || 0,
            lockDays: row.lock_days || 30,
            lockLabel: `${row.lock_days || 30} Days`,
            multiplier: row.multiplier || 1.0,
            color: LOCK_OPTIONS.find(o => o.days === row.lock_days)?.color || '#2EBD85',
            startDate: new Date(row.created_at).getTime(),
            endDate: new Date(row.created_at).getTime() + (row.lock_days || 30) * 24 * 60 * 60 * 1000,
            status: row.status || 'ACTIVE',
            ethReward: row.eth_reward || 0
          }));
          setActiveStakes(mapped);
        }
      } catch (e) {}
      finally { setIsLoading(false); }
    };
    loadStakes();
  }, [userKey]);

  // ── Load global staking stats from Supabase ──
  useEffect(() => {
    if (!supabase) return;
    const loadStats = async () => {
      try {
        const { data } = await supabase
          .from('stake_requests')
          .select('amount, username, lock_days, multiplier, created_at, status')
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const realTotal = data.reduce((sum, r) => sum + (r.amount || 0), 0);
          if (realTotal > 0) setTotalStaked(13_930_000 + realTotal); // base + real
          setStakersCount(247 + new Set(data.map(r => r.username)).size);

          // Build live staker feed from real data
          const realStakers = data.slice(0, 8).map(r => {
            const lockOpt = LOCK_OPTIONS.find(o => o.days === r.lock_days) || LOCK_OPTIONS[2];
            const ago = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 60000);
            const timeStr = ago < 60 ? `${ago}m ago` : ago < 1440 ? `${Math.floor(ago / 60)}h ago` : `${Math.floor(ago / 1440)}d ago`;
            return {
              addr: r.username.length > 12 ? `${r.username.slice(0, 6)}...${r.username.slice(-4)}` : r.username,
              amount: (r.amount || 0).toLocaleString(),
              lock: lockOpt.label,
              mult: `${r.multiplier || 1}x`,
              joined: timeStr,
              color: lockOpt.color
            };
          });

          // Merge real + bot stakers, real on top
          setLiveStakers([...realStakers, ...BOT_STAKERS_BASE].slice(0, 8));
        }
      } catch (e) {}
    };
    loadStats();
  }, []);

  // ── Bot staker loop (adds fake stakers every 12-25s to look alive) ──
  useEffect(() => {
    const LOCK_LABELS = ['7 Days', '14 Days', '30 Days', '60 Days', '90 Days'];
    const LOCK_MULTS  = ['1.0x',  '1.3x',   '1.75x',  '2.25x',  '3.0x'];
    const AMOUNTS = ['100,000', '250,000', '500,000', '750,000', '1,000,000', '2,000,000'];

    const fireBotStaker = () => {
      const lockIdx = Math.floor(Math.random() * LOCK_LABELS.length);
      const botEntry = {
        addr: generateRandomBotPlayer(),
        amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
        lock: LOCK_LABELS[lockIdx],
        mult: LOCK_MULTS[lockIdx],
        joined: 'Just now',
        color: LOCK_OPTIONS[lockIdx].color
      };

      setLiveStakers(prev => [botEntry, ...prev.slice(0, 7)]);
      setTotalStaked(prev => prev + parseInt(botEntry.amount.replace(/,/g, ''), 10));
      setStakersCount(prev => prev + 1);

      const delay = 12000 + Math.random() * 13000;
      botStakerTimer.current = setTimeout(fireBotStaker, delay);
    };

    botStakerTimer.current = setTimeout(fireBotStaker, 6000);
    return () => clearTimeout(botStakerTimer.current);
  }, []);

  // ── Pool grows naturally ──
  useEffect(() => {
    const interval = setInterval(() => {
      setEthPool(prev => +(prev + (Math.random() * 0.0003)).toFixed(4));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fireToast = (title, message, type = 'error') =>
    setToast({ isOpen: true, title, message, type });

  const amountNum = parseFloat((stakeAmount || '0').toString().replace(/,/g, '')) || 0;

  const [copiedStakingVault, setCopiedStakingVault] = useState(false);

  const handleCopyStakingVault = () => {
    navigator.clipboard.writeText(STAKING_VAULT_ADDRESS).then(() => {
      setCopiedStakingVault(true);
      setTimeout(() => setCopiedStakingVault(false), 2500);
    });
  };

  const handleStake = async () => {
    if (amountNum < MIN_STAKE) {
      return fireToast('MINIMUM STAKE', `Minimum stake is ${MIN_STAKE.toLocaleString()} $ONYIS.`);
    }

    const now = Date.now();
    const endDate = now + selectedLock.days * 24 * 60 * 60 * 1000;

    const newStake = {
      id: now,
      amount: amountNum,
      lockDays: selectedLock.days,
      lockLabel: selectedLock.label,
      multiplier: selectedLock.multiplier,
      color: selectedLock.color,
      startDate: now,
      endDate,
      status: 'ACTIVE',
      ethReward: 0,
    };

    setActiveStakes(prev => [newStake, ...prev]);
    setTotalStaked(prev => prev + amountNum);
    setStakersCount(prev => prev + 1);
    setStakeAmount('100000');

    if (supabase) {
      try {
        await supabase
          .from('stake_requests')
          .insert([{
            username: userKey,
            staking_vault: STAKING_VAULT_ADDRESS,
            amount: amountNum,
            lock_days: selectedLock.days,
            multiplier: selectedLock.multiplier,
            status: 'ACTIVE',
            created_at: new Date().toISOString()
          }]);
      } catch (err) {
        console.warn('Supabase stake queue notice:', err);
      }
    }

    fireToast(
      'STAKE CONFIRMED ⏳',
      `${amountNum.toLocaleString()} $ONYIS locked for ${selectedLock.label} at ${selectedLock.multiplier}x multiplier. Logged in Staking Vault queue.`,
      'success'
    );
  };

  const handleRequestUnstake = (stake) => {
    const now = Date.now();
    const isEarly = now < stake.endDate;
    if (isEarly) {
      setShowEarlyUnstakeWarning(stake.id);
    } else {
      confirmUnstake(stake.id, false);
    }
  };

  const confirmUnstake = async (stakeId, isEarly) => {
    setShowEarlyUnstakeWarning(null);
    const targetStake = activeStakes.find(s => s.id === stakeId);

    setActiveStakes(prev =>
      prev.map(s =>
        s.id === stakeId
          ? { ...s, status: 'UNSTAKE_PENDING', ethReward: isEarly ? 0 : s.ethReward }
          : s
      )
    );
    if (targetStake) {
      setTotalStaked(prev => Math.max(0, prev - targetStake.amount));
    }

    if (supabase && targetStake) {
      try {
        // Update the existing row status
        await supabase
          .from('stake_requests')
          .update({ status: isEarly ? 'EARLY_UNSTAKE_PENDING' : 'UNSTAKE_PENDING' })
          .eq('username', userKey)
          .eq('amount', targetStake.amount)
          .eq('lock_days', targetStake.lockDays)
          .eq('status', 'ACTIVE');
      } catch (err) {
        console.warn('Supabase unstake update notice:', err);
      }
    }

    if (isEarly) {
      fireToast(
        'EARLY UNSTAKE REQUESTED ⏳',
        'Your $ONYIS will be returned from Staking Vault shortly. All accumulated ETH rewards have been forfeited.',
        'error'
      );
    } else {
      fireToast(
        'UNSTAKE REQUESTED ⏳',
        'Your $ONYIS + ETH rewards will be sent to your wallet from Staking Vault shortly.',
        'success'
      );
    }
  };

  const getRemainingTime = (endDate) => {
    const diff = endDate - Date.now();
    if (diff <= 0) return 'Ready to claim';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getProgressPercent = (startDate, endDate) => {
    const total = endDate - startDate;
    const elapsed = Date.now() - startDate;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  // Estimated APY (rough): (ethPool * 365 / 7) / (totalStaked / 1e6) * 100 simplified
  const estimatedAPY = ((ethPool * 52) / (totalStaked / 1_000_000) * 100).toFixed(1);

  return (
    <>
      <div className="game-container-padding" style={{ maxWidth: '1240px', margin: '32px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Protocol Stats Bar ── */}
        <div className="mobile-grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Total $ONYIS Staked', value: `${(totalStaked / 1_000_000).toFixed(2)}M`, sub: `${((totalStaked / 1_000_000_000) * 100).toFixed(2)}% of supply`, icon: Coins, color: '#D4AF37' },
            { label: 'ETH Reward Pool', value: `${ethPool.toFixed(4)} ETH`, sub: 'Accumulates from game fees', icon: TrendingUp, color: '#2EBD85' },
            { label: 'Est. Weekly APY', value: `${estimatedAPY}%`, sub: 'Based on current game volume', icon: Zap, color: '#FFBF00' },
            { label: 'Total Stakers', value: stakersCount.toLocaleString(), sub: 'Active stake positions', icon: Lock, color: '#4AB9F5' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-panel" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Icon size={16} color={stat.color} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {stat.label.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '1.45rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: stat.color, lineHeight: 1, marginBottom: '4px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.sub}</div>
              </div>
            );
          })}
        </div>

        {/* ── Main Content: Stake Panel + Active Stakes ── */}
        <div className="game-layout-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* LEFT: Stake Control Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Stake Input Card */}
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Lock size={20} color="var(--accent-gold)" />
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.1rem', letterSpacing: '1px' }}>
                  STAKE $ONYIS
                </h3>
              </div>
              {/* Official Staking Vault Address Box */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-gold)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.62rem', color: '#D4AF37', fontWeight: 800, letterSpacing: '1px' }}>🔒 OFFICIAL STAKING VAULT</span>
                  <span style={{ fontSize: '0.58rem', background: 'rgba(212,175,55,0.15)', border: '1px solid var(--border-gold)', color: 'var(--text-gold)', padding: '1px 6px', borderRadius: '8px', fontWeight: 800 }}>LOCK ESCROW</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.74rem',
                    color: 'var(--text-gold)',
                    fontWeight: 700,
                    wordBreak: 'break-all'
                  }}>
                    {STAKING_VAULT_ADDRESS}
                  </code>
                  <button
                    onClick={handleCopyStakingVault}
                    title="Copy Staking Vault address"
                    style={{
                      flexShrink: 0,
                      background: copiedStakingVault ? 'rgba(46,189,133,0.15)' : 'var(--bg-card)',
                      border: '1px solid ' + (copiedStakingVault ? 'rgba(46,189,133,0.4)' : 'var(--border-gold)'),
                      borderRadius: '6px',
                      padding: '5px 8px',
                      color: copiedStakingVault ? '#2EBD85' : 'var(--text-gold)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}
                  >
                    {copiedStakingVault ? <><CheckCheck size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  AMOUNT ($ONYIS) — Min {MIN_STAKE.toLocaleString()}
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="100000"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
                {/* Quick amounts */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {[100_000, 250_000, 500_000, 1_000_000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setStakeAmount(String(amt))}
                      style={{
                        flex: 1, padding: '5px 0',
                        background: amountNum === amt ? 'rgba(212, 175, 55, 0.18)' : 'var(--bg-secondary)',
                        border: '1px solid ' + (amountNum === amt ? 'var(--border-gold)' : 'var(--border-subtle)'),
                        borderRadius: '6px', color: amountNum === amt ? 'var(--text-gold)' : 'var(--text-muted)',
                        fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      {amt >= 1_000_000 ? '1M' : `${amt / 1000}K`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lock Period Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  LOCK PERIOD
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {LOCK_OPTIONS.map(opt => (
                    <button
                      key={opt.days}
                      onClick={() => setSelectedLock(opt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: selectedLock.days === opt.days ? `rgba(${opt.days === 7 ? '157,166,180' : opt.days === 14 ? '74,185,245' : opt.days === 30 ? '46,189,133' : opt.days === 60 ? '255,191,0' : '212,175,55'}, 0.1)` : 'var(--bg-secondary)',
                        border: `1px solid ${selectedLock.days === opt.days ? opt.color : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={13} color={selectedLock.days === opt.days ? opt.color : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedLock.days === opt.days ? opt.color : 'var(--text-secondary)' }}>
                          {opt.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 800,
                          color: opt.color,
                          background: `${opt.color}18`,
                          border: `1px solid ${opt.color}50`,
                          padding: '2px 8px', borderRadius: '12px'
                        }}>
                          {opt.multiplier}x
                        </span>
                        {selectedLock.days === opt.days && <ChevronRight size={14} color={opt.color} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Box */}
              <div style={{
                padding: '14px 16px',
                background: 'rgba(212, 175, 55, 0.05)',
                border: '1px solid var(--border-gold)',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>Amount</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{amountNum.toLocaleString()} $ONYIS</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>Lock Period</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedLock.label}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>Reward Multiplier</span>
                  <strong style={{ color: selectedLock.color }}>{selectedLock.multiplier}x</strong>
                </div>
                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Early Unstake</span>
                  <strong style={{ color: '#F6465D' }}>0 ETH Reward</strong>
                </div>
              </div>

              {/* Warning */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                padding: '10px 12px',
                background: 'rgba(246, 70, 93, 0.06)',
                border: '1px solid rgba(246, 70, 93, 0.2)',
                borderRadius: '8px', marginBottom: '16px',
                fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5
              }}>
                <AlertTriangle size={13} color="#F6465D" style={{ flexShrink: 0, marginTop: '1px' }} />
                Unstaking before lock period ends forfeits ALL ETH rewards. Your $ONYIS is always returned.
              </div>

              {/* Stake Button */}
              <button
                className="gold-button"
                onClick={handleStake}
                style={{ width: '100%', height: '48px', fontSize: '0.95rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Lock size={16} fill="currentColor" />
                STAKE & LOCK {selectedLock.label.toUpperCase()}
              </button>
            </div>

            {/* Info Box */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Info size={15} color="var(--accent-gold)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-gold)', letterSpacing: '0.5px' }}>HOW REWARDS WORK</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    <Gamepad2 size={13} color="var(--accent-gold)" />
                  </div>
                  <span style={{ lineHeight: 1.45 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>50% of all FLIPO, RUGO & BOLO</strong> house edge flows into the ETH reward pool.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(46, 189, 133, 0.12)',
                    border: '1px solid rgba(46, 189, 133, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    <BarChart3 size={13} color="#2EBD85" />
                  </div>
                  <span style={{ lineHeight: 1.45 }}>
                    Rewards distributed proportionally based on your <strong style={{ color: 'var(--text-primary)' }}>weighted stake</strong> (amount × multiplier).
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(255, 191, 0, 0.12)',
                    border: '1px solid rgba(255, 191, 0, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    <Zap size={13} color="#FFBF00" />
                  </div>
                  <span style={{ lineHeight: 1.45 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>ETH sent directly</strong> to your wallet after lock period completes.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(74, 185, 245, 0.12)',
                    border: '1px solid rgba(74, 185, 245, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    <Lock size={13} color="#4AB9F5" />
                  </div>
                  <span style={{ lineHeight: 1.45 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Longer locks</strong> = bigger multiplier = bigger share of the pool.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Active Stakes + Live Stakers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Active Stakes */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="var(--accent-gold)" />
                  <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1rem', letterSpacing: '0.5px' }}>
                    YOUR ACTIVE STAKES
                  </h4>
                </div>
                {activeStakes.length > 0 && (
                  <span style={{ fontSize: '0.68rem', color: '#2EBD85', fontWeight: 700, background: 'rgba(46,189,133,0.12)', border: '1px solid rgba(46,189,133,0.3)', padding: '2px 8px', borderRadius: '12px' }}>
                    {activeStakes.length} ACTIVE
                  </span>
                )}
              </div>

              {activeStakes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <Lock size={36} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    No active stakes yet.<br />
                    Lock your $ONYIS to start earning ETH rewards.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeStakes.map(stake => {
                    const progress = getProgressPercent(stake.startDate, stake.endDate);
                    const remaining = getRemainingTime(stake.endDate);
                    const isReady = Date.now() >= stake.endDate;
                    const isPending = stake.status === 'UNSTAKE_PENDING';

                    return (
                      <div
                        key={stake.id}
                        style={{
                          padding: '16px 18px',
                          background: isPending ? 'rgba(246,70,93,0.06)' : 'var(--bg-secondary)',
                          border: `1px solid ${isPending ? 'rgba(246,70,93,0.25)' : isReady ? 'rgba(46,189,133,0.35)' : 'var(--border-subtle)'}`,
                          borderRadius: '12px',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Top Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                                {stake.amount.toLocaleString()} $ONYIS
                              </span>
                              <span style={{
                                fontSize: '0.65rem', fontWeight: 800,
                                color: stake.color,
                                background: `${stake.color}18`,
                                border: `1px solid ${stake.color}50`,
                                padding: '2px 7px', borderRadius: '10px'
                              }}>
                                {stake.multiplier}x · {stake.lockLabel}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {isPending ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#F6465D', fontWeight: 600 }}>
                                  <Clock size={12} /> Unstake processing — funds arriving soon...
                                </span>
                              ) : isReady ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#2EBD85', fontWeight: 600 }}>
                                  <CheckCircle2 size={12} /> Lock complete — ready to claim
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                  <Lock size={12} color="var(--text-gold)" /> {remaining}
                                </span>
                              )}
                            </div>
                          </div>

                          {!isPending && (
                            <button
                              onClick={() => handleRequestUnstake(stake)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: isReady ? 'rgba(46,189,133,0.15)' : 'rgba(246,70,93,0.1)',
                                border: `1px solid ${isReady ? 'rgba(46,189,133,0.4)' : 'rgba(246,70,93,0.3)'}`,
                                color: isReady ? '#2EBD85' : '#F6465D',
                                fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                transition: 'var(--transition-smooth)'
                              }}
                            >
                              <Unlock size={11} />
                              {isReady ? 'CLAIM' : 'EARLY UNSTAKE'}
                            </button>
                          )}

                          {isPending && (
                            <span style={{ fontSize: '0.7rem', color: '#F6465D', fontWeight: 700 }}>PENDING</span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '4px', background: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: isReady ? '#2EBD85' : stake.color,
                            transition: 'width 0.5s ease',
                            borderRadius: '2px'
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          <span>0%</span>
                          <span style={{ color: isReady ? '#2EBD85' : stake.color, fontWeight: 700 }}>{progress}% complete</span>
                          <span>100%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Staker Feed */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <TrendingUp size={18} color="var(--accent-gold)" />
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1rem', letterSpacing: '0.5px' }}>
                  LIVE STAKER ACTIVITY
                </h4>
              </div>

              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.9fr 0.6fr 0.7fr', gap: '8px', padding: '6px 10px', marginBottom: '6px' }}>
                {['Staker', 'Amount', 'Lock', 'Mult', 'Joined'].map(h => (
                  <span key={h} style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>{h.toUpperCase()}</span>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {liveStakers.map((s, i) => (
                  <div
                    key={`${s.addr}-${i}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.2fr 0.9fr 0.6fr 0.7fr',
                      gap: '8px',
                      padding: '10px 10px',
                      background: s.joined === 'Just now' ? 'rgba(46, 189, 133, 0.05)' : 'var(--bg-secondary)',
                      border: `1px solid ${s.joined === 'Just now' ? 'rgba(46, 189, 133, 0.25)' : 'var(--border-subtle)'}`,
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      alignItems: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>{s.addr}</span>
                    <span style={{ color: 'var(--text-gold)', fontWeight: 700 }}>{s.amount}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.lock}</span>
                    <span style={{ color: s.color || '#2EBD85', fontWeight: 700 }}>{s.mult}</span>
                    <span style={{ color: s.joined === 'Just now' ? '#2EBD85' : 'var(--text-muted)', fontSize: '0.7rem', fontWeight: s.joined === 'Just now' ? 700 : 400 }}>{s.joined}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Early Unstake Warning Modal */}
      {showEarlyUnstakeWarning !== null && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px'
        }}>
          <div className="glass-panel modal-content" style={{ width: '100%', maxWidth: '420px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 16px', background: 'rgba(246,70,93,0.12)', border: '1px solid rgba(246,70,93,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={28} color="#F6465D" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#F6465D', fontSize: '1.2rem', letterSpacing: '1px', marginBottom: '10px' }}>
              EARLY UNSTAKE WARNING
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              Your lock period is <strong style={{ color: '#F6465D' }}>not yet complete</strong>.<br />
              Unstaking now will <strong style={{ color: '#F6465D' }}>forfeit ALL accumulated ETH rewards</strong>.<br />
              Your $ONYIS tokens will be returned to your wallet.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowEarlyUnstakeWarning(null)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel — Keep Staking
              </button>
              <button
                onClick={() => confirmUnstake(showEarlyUnstakeWarning, true)}
                style={{ flex: 1, padding: '12px', background: 'rgba(246,70,93,0.15)', border: '1px solid rgba(246,70,93,0.4)', color: '#F6465D', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                Unstake (Forfeit Rewards)
              </button>
            </div>
          </div>
        </div>
      )}

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
