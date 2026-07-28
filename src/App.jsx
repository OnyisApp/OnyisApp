import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import GameSelector from './components/GameSelector';
import ActivityTicker from './components/ActivityTicker';
import CoinflipGame from './components/CoinflipGame';
import ChartGame from './components/ChartGame';
import PlinkoGame from './components/PlinkoGame';
import GlobalChat from './components/GlobalChat';
import FAQModal from './components/FAQModal';
import FairnessModal from './components/FairnessModal';
import SecurityModal from './components/SecurityModal';
import DocsModal from './components/DocsModal';
import TermsModal from './components/TermsModal';
import ToastModal from './components/ToastModal';
import XPModal from './components/XPModal';
import StakingPage from './components/StakingPage';
import LoadingScreen from './components/LoadingScreen';
import { Scale, ShieldCheck, BookOpen, FileText, Share2, Copy, CheckCheck } from 'lucide-react';
import { soundEngine } from './utils/soundEngine';
import { realtimeHub } from './lib/realtimeHub';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  // Multi-Token Balances State (ETH, USDG)
  const [selectedCurrency, setSelectedCurrency] = useState('ETH'); // 'ETH' | 'USDG'
  const selectedCurrencyRef = useRef(selectedCurrency);
  useEffect(() => {
    selectedCurrencyRef.current = selectedCurrency;
  }, [selectedCurrency]);

  const [balances, setBalances] = useState({
    ETH: 0.0000,
    USDG: 0.00
  });

  const balance = balances[selectedCurrency] ?? 0;
  const setBalance = (valOrFn, currencyOverride) => {
    const targetCurr = currencyOverride || selectedCurrencyRef.current;
    setBalances(prev => {
      const current = prev[targetCurr] ?? 0;
      const nextVal = typeof valOrFn === 'function' ? valOrFn(current) : valOrFn;
      return { ...prev, [targetCurr]: Math.max(0, +nextVal) };
    });
  };

  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState('Robinhood Chain');
  const [username, setUsername] = useState('DegenKing');
  const [activeTab, setActiveTab] = useState('flip');
  const botTimerRef = useRef(null);
  // Sound Toggle State
  const [soundMuted, setSoundMuted] = useState(soundEngine.isMuted());
  const handleToggleSound = () => setSoundMuted(soundEngine.toggleMute());

  // Session P&L Tracker State
  const [sessionStats, setSessionStats] = useState({
    wageredUSDG: 0,
    wageredETH: 0,
    netProfitUSDG: 0,
    netProfitETH: 0,
    totalBets: 0,
    wins: 0
  });

  // Atomic XP & Level State (Prevents stale closure / race conditions)
  const [xpState, setXpState] = useState({
    level: 0,
    xp: 0,
    nextLevelXp: 250
  });
  const { level, xp, nextLevelXp } = xpState;

  // Global Real-time Activity Feed State
  const [liveActivities, setLiveActivities] = useState([
    { id: 1, game: 'FLIPO', player: '0x7a...99f1', bet: '0.05 ETH', outcome: '+0.098 ETH', status: 'WIN', multiplier: '1.96x', time: 'Just now' },
    { id: 2, game: 'BOLO', player: '0x3c...22a4', bet: '25.00 USDG', outcome: '+105.00 USDG', status: 'WIN', multiplier: '4.20x', time: '12s ago' },
    { id: 3, game: 'RUGO', player: '0xe1...4f09', bet: '0.10 ETH', outcome: '-0.100 ETH', status: 'RUGGED', multiplier: '0.00x', time: '28s ago' },
    { id: 4, game: 'FLIPO', player: '0x8f...11b2', bet: '10.00 USDG', outcome: '+19.60 USDG', status: 'WIN', multiplier: '1.96x', time: '45s ago' }
  ]);

  // Subscribe to real-time activity events across devices
  useEffect(() => {
    const unsubscribe = realtimeHub.onActivity((newActivity) => {
      if (!newActivity || !newActivity.id) return;
      setLiveActivities(prev => {
        if (prev.some(a => String(a.id) === String(newActivity.id))) return prev;
        return [newActivity, ...prev.slice(0, 5)];
      });
    });
    return () => unsubscribe();
  }, []);

  const addLiveActivity = (game, player, wager, mult, payout, isWin, currencySymbol) => {
    const symbol = currencySymbol || selectedCurrency;
    const payoutVal = parseFloat(payout) || 0;
    const newActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      game,
      player: player || `@${username}`,
      bet: `${wager} ${symbol}`,
      outcome: payoutVal > 0 ? `+${payout} ${symbol}` : `-${wager} ${symbol}`,
      status: isWin ? 'WIN' : payoutVal > 0 ? 'RECOVERED' : 'RUGGED',
      multiplier: `${mult}x`,
      time: 'Just now'
    };

    // Broadcast across all connected devices and browser instances
    realtimeHub.sendActivityEvent(newActivity);

    // Automatically route & log 2% House Fee into Staking Vault in Supabase
    if (supabase) {
      const wagerVal = parseFloat(wager) || 0;
      const feeVal = +(wagerVal * 0.02).toFixed(4);
      if (wagerVal > 0) {
        supabase.from('house_fee_logs').insert([
          {
            game,
            player: player || `@${username}`,
            wager_amount: wagerVal,
            fee_amount: feeVal,
            currency: symbol,
            staking_vault: '0xEE29A5dC23eC52542B7Ac1dAeFff1458320D73FD',
            created_at: new Date().toISOString()
          }
        ]).then(() => {}).catch(err => console.warn('House fee log notice:', err));
      }
    }

    // Only award XP & update Session Stats if the activity belongs to the active user (not bots)
    const isUserActivity = player === `@${username}` || player === username || (username && player?.includes(username));
    if (isUserActivity) {
      const wagerVal = parseFloat(wager) || 0;
      const payoutVal = parseFloat(payout) || 0;
      const profit = payoutVal - wagerVal;

      setSessionStats(prev => ({
        ...prev,
        totalBets: prev.totalBets + 1,
        wins: isWin ? prev.wins + 1 : prev.wins,
        wageredUSDG: symbol === 'USDG' ? prev.wageredUSDG + wagerVal : prev.wageredUSDG,
        wageredETH: symbol === 'ETH' ? prev.wageredETH + wagerVal : prev.wageredETH,
        netProfitUSDG: symbol === 'USDG' ? prev.netProfitUSDG + profit : prev.netProfitUSDG,
        netProfitETH: symbol === 'ETH' ? prev.netProfitETH + profit : prev.netProfitETH
      }));

      // High-Prestige XP formula: 1 XP = $1 Wagered (1 USDG = 1 XP, 0.01 ETH = 30 XP)
      const earnedXp = Math.max(1, Math.round(wagerVal * (symbol === 'USDG' ? 1 : 3000)));

      const LEVEL_XP_THRESHOLDS = [250, 500, 1000, 2000, 5000, 7000, 8500, 10000, 20000, 50000];
      const getRequiredXpForLevel = (lvl) => {
        if (lvl < LEVEL_XP_THRESHOLDS.length) return LEVEL_XP_THRESHOLDS[lvl];
        return Math.round(50000 * Math.pow(1.5, lvl - 9));
      };

      setXpState(prev => {
        let currentXp = prev.xp + earnedXp;
        let currentLevel = prev.level;
        let reqXp = getRequiredXpForLevel(currentLevel);

        while (currentXp >= reqXp) {
          currentXp -= reqXp;
          currentLevel += 1;
          reqXp = getRequiredXpForLevel(currentLevel);
        }

        return {
          level: currentLevel,
          xp: currentXp,
          nextLevelXp: reqXp
        };
      });
    }
  };

  // ─── Bot Live Activity Feed ───────────────────────────────────────────────
  useEffect(() => {
    const BOT_NAMES = [
      '0x7a...99f1', '0x3c...22a4', '0xe1...4f09', '0x8f...11b2',
      'Satoshi_King', 'DegenApe_99', 'Whale_Watcher', 'CryptoChad_X',
      'MoonShot_Pro', '0xAlpha_G', 'Diamond_Handz', 'GigaChad_Eth',
      'PumpMaster', 'LamboSoon', 'Robinhooder_1', 'EthMaxi_77',
      'Pepe_HODL', 'BullRunner', 'Solana_Rider', '0xDegen_Z'
    ];
    const GAMES = ['FLIPO', 'RUGO', 'BOLO'];

    // FLIPO multiplier outcomes
    const flipioOutcome = () => {
      const isWin = Math.random() < 0.49;
      const wager = +(0.005 + Math.random() * 0.2).toFixed(3);
      const mult = isWin ? '1.96' : '0.00';
      const payout = isWin ? (wager * 1.96).toFixed(3) : '0.000';
      return { wager, mult, payout, isWin };
    };

    // RUGO crash outcomes
    const rugoOutcome = () => {
      const r = Math.random();
      const crashMult = r < 0.4 ? +(1 + Math.random() * 0.8).toFixed(2) : +(1.5 + Math.random() * 8).toFixed(2);
      const isWin = crashMult >= 1.5 && Math.random() < 0.55;
      const wager = +(0.01 + Math.random() * 0.25).toFixed(3);
      const cashoutMult = isWin ? (1.3 + Math.random() * (crashMult - 1.3)).toFixed(2) : '0.00';
      const payout = isWin ? (wager * parseFloat(cashoutMult)).toFixed(3) : '0.000';
      return { wager, mult: isWin ? cashoutMult : crashMult.toFixed(2), payout, isWin };
    };

    // BOLO plinko outcomes (rough distribution)
    const boloOutcome = () => {
      const wager = +(0.005 + Math.random() * 0.15).toFixed(3);
      const mults = [0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110];
      const weights = [0.12, 0.2, 0.25, 0.18, 0.1, 0.07, 0.04, 0.025, 0.015];
      let rand = Math.random(), cumulative = 0, chosenMult = 1;
      for (let j = 0; j < mults.length; j++) {
        cumulative += weights[j];
        if (rand <= cumulative) { chosenMult = mults[j]; break; }
      }
      const isWin = chosenMult >= 1;
      const payout = (wager * chosenMult).toFixed(3);
      return { wager, mult: `${chosenMult}`, payout, isWin };
    };

    const fireBotActivity = () => {
      const bot = generateRandomBotPlayer();
      const game = GAMES[Math.floor(Math.random() * GAMES.length)];
      let outcome;
      if (game === 'FLIPO') outcome = flipioOutcome();
      else if (game === 'RUGO') outcome = rugoOutcome();
      else outcome = boloOutcome();

      addLiveActivity(game, bot, outcome.wager, outcome.mult, outcome.payout, outcome.isWin);

      // Schedule next bot event randomly between 1.8s and 4.5s
      const delay = 1800 + Math.random() * 2700;
      botTimerRef.current = setTimeout(fireBotActivity, delay);
    };

    botTimerRef.current = setTimeout(fireBotActivity, 2000);
    return () => clearTimeout(botTimerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Modals state
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isFairnessOpen, setIsFairnessOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isXPOpen, setIsXPOpen] = useState(false);

  // Global Toast Modal state
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'error' });
  const [caCopied, setCaCopied] = useState(false);
  const CA_ADDRESS = 'COMING_SOON'; // Replace with real CA when deployed

  const handleCopyCA = () => {
    if (CA_ADDRESS === 'COMING_SOON') return; // disabled until live
    navigator.clipboard.writeText(CA_ADDRESS).then(() => {
      setCaCopied(true);
      setTimeout(() => setCaCopied(false), 2500);
    });
  };

  const triggerToast = (title, message, type = 'error') => {
    setToast({ isOpen: true, title, message, type });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent', position: 'relative' }}>
      {/* Animated Fullscreen Loading Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Floating Animated Web3 Ambient Glow Orbs */}
      <div className="bg-glow-orb-gold" />
      <div className="bg-glow-orb-emerald" />
      {/* Sleek Top Navbar */}
      <Navbar
        balance={balance}
        setBalance={setBalance}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
        network={network}
        setNetwork={setNetwork}
        username={username}
        setUsername={setUsername}
        level={level}
        xp={xp}
        nextLevelXp={nextLevelXp}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        sessionStats={sessionStats}
        onOpenFAQ={() => setIsFAQOpen(true)}
        onOpenFairness={() => setIsFairnessOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenXP={() => setIsXPOpen(true)}
        triggerToast={triggerToast}
      />

      {/* Hero Welcome Banner */}
      <section style={{
        textAlign: 'center',
        padding: '36px 20px 10px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.8rem',
          fontWeight: 700,
          letterSpacing: '4px',
          color: 'var(--text-primary)',
          marginBottom: '4px'
        }}>
          <span className="gold-gradient-text">ONYIS</span>
        </h2>

        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '2.5px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>
          Onchain Native Yield Instant Settlement
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, letterSpacing: '0.5px' }}>
          Instant coin flips, real-time chart battles & Bolo drops. Provably fair. Zero gas.
        </p>
      </section>

      {/* Real-time Robinhood Chain Activity Ticker (Live Synced) */}
      <ActivityTicker activities={liveActivities} />

      {/* Game Mode Switcher (FLIPO, RUGO, BOLO) */}
      <GameSelector activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Active Game View with Persistent Live State */}
      <main style={{ flex: 1, paddingRight: '20px' }}>
        <div className="page-transition" style={{ display: activeTab === 'flip' ? 'block' : 'none' }}>
          <CoinflipGame balance={balance} setBalance={setBalance} isConnected={isConnected} addLiveActivity={addLiveActivity} username={username} selectedCurrency={selectedCurrency} />
        </div>
        <div className="page-transition" style={{ display: activeTab === 'chart' ? 'block' : 'none' }}>
          <ChartGame balance={balance} setBalance={setBalance} isConnected={isConnected} addLiveActivity={addLiveActivity} username={username} selectedCurrency={selectedCurrency} />
        </div>
        <div className="page-transition" style={{ display: activeTab === 'plinko' ? 'block' : 'none' }}>
          <PlinkoGame balance={balance} setBalance={setBalance} isConnected={isConnected} addLiveActivity={addLiveActivity} username={username} selectedCurrency={selectedCurrency} />
        </div>
        <div className="page-transition" style={{ display: activeTab === 'stake' ? 'block' : 'none' }}>
          <StakingPage username={username} triggerToast={triggerToast} />
        </div>
      </main>

      {/* Sleek Right Side Global Chat Drawer */}
      <GlobalChat username={username} isConnected={isConnected} triggerToast={triggerToast} />

      {/* Footer */}
      <footer style={{
        margin: '60px auto 0',
        padding: '30px 20px',
        width: '100%',
        boxSizing: 'border-box',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>© 2026 ONYIS Protocol — <span style={{ fontSize: '0.75rem', opacity: 0.65 }}>Onchain Native Yield Instant Settlement</span> · Robinhood Chain EVM.</span>

            {/* CA Token Box */}
            <button
              onClick={handleCopyCA}
              title={CA_ADDRESS === 'COMING_SOON' ? 'Contract address coming soon' : 'Click to copy CA'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                background: 'rgba(212, 175, 55, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '20px',
                cursor: CA_ADDRESS === 'COMING_SOON' ? 'default' : 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              {/* Pulsing dot */}
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: CA_ADDRESS === 'COMING_SOON' ? '#888' : '#2EBD85',
                display: 'inline-block',
                boxShadow: CA_ADDRESS === 'COMING_SOON' ? 'none' : '0 0 6px #2EBD85',
                animation: CA_ADDRESS === 'COMING_SOON' ? 'none' : 'pulse 1.8s ease-in-out infinite'
              }} />
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-gold)', letterSpacing: '0.5px' }}>CA</span>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                color: CA_ADDRESS === 'COMING_SOON' ? 'var(--text-muted)' : 'var(--text-secondary)',
                letterSpacing: '0.3px'
              }}>
                {CA_ADDRESS === 'COMING_SOON' ? 'Coming Soon...' : `${CA_ADDRESS.slice(0,6)}...${CA_ADDRESS.slice(-4)}`}
              </span>
              {CA_ADDRESS !== 'COMING_SOON' && (
                caCopied
                  ? <CheckCheck size={12} color="#2EBD85" />
                  : <Copy size={12} color="var(--text-muted)" />
              )}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', alignItems: 'center' }}>
            <a
              href="https://x.com/OnyisApp"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-gold)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                transition: 'var(--transition-smooth)'
              }}
            >
              <Share2 size={14} color="var(--accent-gold)" /> X (Twitter)
            </a>
            <button
              onClick={() => setIsFairnessOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Scale size={14} color="var(--accent-gold)" /> Provably Fair
            </button>
            <button
              onClick={() => setIsSecurityOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ShieldCheck size={14} color="var(--accent-gold)" /> Security
            </button>
            <button
              onClick={() => setIsDocsOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <BookOpen size={14} color="var(--accent-gold)" /> Docs
            </button>
            <button
              onClick={() => setIsTermsOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={14} color="var(--accent-gold)" /> Terms
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
      <FairnessModal isOpen={isFairnessOpen} onClose={() => setIsFairnessOpen(false)} />
      <SecurityModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <XPModal isOpen={isXPOpen} onClose={() => setIsXPOpen(false)} level={level} xp={xp} nextLevelXp={nextLevelXp} />

      {/* Sleek Custom Toast Modal */}
      <ToastModal
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
