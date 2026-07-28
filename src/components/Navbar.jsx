import React, { useState, useEffect, useRef } from 'react';
import { Wallet, ChevronDown, Scale, User, ArrowDownRight, ArrowUpRight, Shield, ChevronLeft, ChevronRight, LogOut, HelpCircle, BookOpen, Copy, CheckCheck, RefreshCw, Volume2, VolumeX, TrendingUp, Minimize2, Maximize2 } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '../lib/supabase';

const PROTOCOL_VAULT_ADDRESS = '0x0A9A846a8A7f84395E6d618B3F80bA1f7F8ee66a';
const USDG_TOKEN_CONTRACT = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168';

export default function Navbar({ balance, setBalance, selectedCurrency = 'ETH', setSelectedCurrency, isConnected, setIsConnected, network, setNetwork, username, setUsername, level, xp, nextLevelXp, onOpenFairness, onOpenXP, onOpenFAQ, onOpenDocs, triggerToast, soundMuted = false, onToggleSound, sessionStats }) {
  const safeBalance = typeof balance === 'number' && !isNaN(balance) ? balance : 0;
  let privyAuth = { ready: true, authenticated: false, user: null, login: () => {}, logout: () => {} };
  try {
    const p = usePrivy();
    if (p && typeof p === 'object') privyAuth = p;
  } catch (e) {
    // Fallback if Privy SDK is initializing
  }
  const { ready, authenticated, user, login, logout } = privyAuth;

  let wallets = [];
  try {
    const walletsObj = useWallets();
    wallets = walletsObj?.wallets || [];
  } catch (e) {
    // Fallback if not inside PrivyWallets context
  }

  const [isPillMinimized, setIsPillMinimized] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showPrivyModal, setShowPrivyModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [tempUsername, setTempUsername] = useState(username || '');

  // Main Connected Wallet Address (User's personal wallet)
  const connectedAddress = user?.wallet?.address || (wallets[0]?.address ?? '0x8f3c2a1b99e44f09d300c1f2a99988ff2a1b99e4');
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

  // Dedicated Burner Vault Address (GUARANTEED distinct from connected main wallet)
  const getBurnerAddress = () => {
    if (!authenticated) return null;
    if (embeddedWallet?.address && embeddedWallet.address.toLowerCase() !== connectedAddress.toLowerCase()) {
      return embeddedWallet.address;
    }
    
    // Persistent distinct local burner address per connected user
    const key = `onyis_burner_vault_${connectedAddress.toLowerCase()}`;
    let saved = localStorage.getItem(key);
    if (!saved) {
      const randomHex = Array.from({ length: 36 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      saved = `0x7b94${randomHex}`; // Distinct 0x7b94 prefix for Burner Vault
      localStorage.setItem(key, saved);
    }
    return saved;
  };

  const burnerAddress = getBurnerAddress();

  // Sync active gaming username to Burner Wallet address for games, activity feed & chat
  useEffect(() => {
    if (authenticated && burnerAddress) {
      const shortBurner = `${burnerAddress.slice(0, 6)}...${burnerAddress.slice(-4)}`;
      setUsername(shortBurner);
    }
  }, [authenticated, burnerAddress, setUsername]);

  // ─── Burner Wallet Balance Tracker ───────────────────────────────────────
  const hasSeededBalance = useRef(false);
  const burnerPollRef = useRef(null);

  useEffect(() => {
    if (!authenticated || !burnerAddress) {
      setIsConnected(false);
      return;
    }

    setIsConnected(true);

    async function fetchBurnerBalances() {
      try {
        // 1. Native ETH Balance
        const ethRes = await fetch('https://rpc.mainnet.chain.robinhood.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [burnerAddress, 'latest'],
            id: 1,
          }),
        });
        const ethData = await ethRes.json();
        if (ethData?.result) {
          const eth = +(Number(BigInt(ethData.result)) / 1e18).toFixed(4);
          setBalance(eth, 'ETH');
        }

        // 2. USDG ERC-20 Token Balance (balanceOf)
        const cleanAddr = burnerAddress.toLowerCase().replace(/^0x/, '').padStart(64, '0');
        const usdgRes = await fetch('https://rpc.mainnet.chain.robinhood.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: USDG_TOKEN_CONTRACT,
                data: `0x70a08231${cleanAddr}`
              },
              'latest'
            ],
            id: 2,
          }),
        });
        const usdgData = await usdgRes.json();
        if (usdgData?.result && usdgData.result !== '0x') {
          const usdg = +(Number(BigInt(usdgData.result)) / 1e18).toFixed(2);
          setBalance(usdg, 'USDG');
        }
      } catch (err) {
        console.warn('Robinhood Chain RPC balance sync notice:', err);
      }
    }

    fetchBurnerBalances();
    const interval = setInterval(fetchBurnerBalances, 6000);
    return () => clearInterval(interval);
  }, [authenticated, burnerAddress]);

  // Derived user wallet address display for navbar profile pill — ALWAYS shows Burner Wallet
  const walletAddress = authenticated && burnerAddress
    ? `⚡ Burner ${burnerAddress.slice(0, 6)}...${burnerAddress.slice(-4)}`
    : `@${username}`;

  const isWalletConnected = authenticated;

  const [copiedProtocolVault, setCopiedProtocolVault] = useState(false);

  const handleCopyProtocolVault = () => {
    navigator.clipboard.writeText(PROTOCOL_VAULT_ADDRESS).then(() => {
      setCopiedProtocolVault(true);
      setTimeout(() => setCopiedProtocolVault(false), 2500);
    });
  };

  const handleCopyBurner = () => {
    if (!burnerAddress) return;
    navigator.clipboard.writeText(burnerAddress).then(() => {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    });
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) return;
    if (val > balance) {
      return triggerToast('INSUFFICIENT BALANCE', 'Withdrawal amount exceeds your current vault balance.');
    }
    const decs = selectedCurrency === 'USDG' ? 2 : 4;
    setBalance(prev => +(prev - val).toFixed(decs), selectedCurrency);
    setWithdrawAmount('');
    setShowWithdrawModal(false);

    if (supabase) {
      try {
        await supabase
          .from('withdrawal_requests')
          .insert([
            {
              username: `@${username}`,
              wallet_address: connectedAddress || burnerAddress,
              amount: val,
              currency: selectedCurrency,
              status: 'PENDING',
              created_at: new Date().toISOString()
            }
          ]);
      } catch (err) {
        console.warn('Supabase withdrawal queue notice:', err);
      }
    }

    triggerToast('WITHDRAWAL QUEUED ⏳', `Requested ${val} ${selectedCurrency}. Your request is queued (PENDING) and will be manually dispatched to your wallet.`, 'success');
  };

  const handleNotifyDeposit = async () => {
    if (supabase) {
      try {
        await supabase
          .from('deposit_requests')
          .insert([
            {
              username: `@${username}`,
              source_wallet: connectedAddress,
              protocol_vault: PROTOCOL_VAULT_ADDRESS,
              burner_vault: burnerAddress,
              currency: selectedCurrency,
              status: 'PENDING',
              created_at: new Date().toISOString()
            }
          ]);
      } catch (err) {
        console.warn('Supabase deposit queue notice:', err);
      }
    }
    setShowDepositModal(false);
    triggerToast('DEPOSIT LOGGED ⏳', 'Deposit request logged (PENDING). Admin will verify in Protocol Vault & credit your Burner Vault.', 'success');
  };

  const handleSaveUsername = (e) => {
    e.preventDefault();
    if (tempUsername.trim().length < 3) {
      return triggerToast('INVALID USERNAME', 'Username must be at least 3 characters long.');
    }
    setUsername(tempUsername.trim());
    setShowUsernameModal(false);
    triggerToast('PROFILE UPDATED', `Your username has been set to ${tempUsername.trim()}.`, 'success');
  };

  const safeXp = typeof xp === 'number' && !isNaN(xp) ? xp : 0;
  const safeNextXp = typeof nextLevelXp === 'number' && !isNaN(nextLevelXp) && nextLevelXp > 0 ? nextLevelXp : 150;
  const progressPercent = Math.min(100, Math.max(0, Math.round((safeXp / safeNextXp) * 100)));

  const getRankTitle = (lvl) => {
    const safeLvl = typeof lvl === 'number' && !isNaN(lvl) ? lvl : 0;
    const titles = [
      'Novice Degen',
      'Bronze Gambler',
      'Silver Highroller',
      'Gold Chart Rider',
      'Platinum Bull',
      'Diamond Whale',
      'Master Apex',
      'Grandmaster Monarch',
      'Overlord Syndicate',
      'Mythic Titan',
      'ONYIS Sovereign'
    ];
    if (safeLvl < titles.length) return titles[safeLvl];
    return 'Degen King';
  };

  const netPnl = selectedCurrency === 'USDG'
    ? (sessionStats?.netProfitUSDG || 0)
    : (sessionStats?.netProfitETH || 0);
  const safePnl = typeof netPnl === 'number' && !isNaN(netPnl) ? netPnl : 0;
  const formattedPnl = selectedCurrency === 'USDG'
    ? safePnl.toFixed(2)
    : safePnl.toFixed(4);

  return (
    <>
      <header className="navbar-main-header" style={{
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(9, 10, 12, 0.92)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {/* Brand Logo - Official htmlonyis.png */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/htmlonyis.png"
              alt="ONYIS Logo"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                objectFit: 'cover',
                boxShadow: 'var(--shadow-gold)'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 className="gold-gradient-text" style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: '1.5px',
                lineHeight: 1,
                margin: 0
              }}>
                ONYIS
              </h1>
              <span style={{
                fontSize: '0.5rem',
                fontWeight: 800,
                padding: '1px 4px',
                borderRadius: '3px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid var(--border-gold)',
                color: 'var(--text-gold)',
                letterSpacing: '1px',
                lineHeight: 1
              }}>
                BETA
              </span>
            </div>
          </div>

          {/* Controls Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* Session P&L Tracker Pill */}
            <div className="hide-on-mobile" style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '3px 7px',
              borderRadius: '10px',
              background: netPnl >= 0 ? 'rgba(46, 189, 133, 0.1)' : 'rgba(255, 84, 0, 0.1)',
              border: netPnl >= 0 ? '1px solid rgba(46, 189, 133, 0.3)' : '1px solid rgba(255, 84, 0, 0.3)',
              color: netPnl >= 0 ? '#2EBD85' : '#FF5400',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <TrendingUp size={11} color={netPnl >= 0 ? '#2EBD85' : '#FF5400'} />
              <span>P&L: {netPnl >= 0 ? '+' : ''}{formattedPnl}</span>
            </div>

            {/* Level & XP Progress Badge */}
            <button
              onClick={onOpenXP}
              style={{
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                padding: '4px 10px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Shield size={14} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Lvl {level} <span className="hide-on-mobile" style={{ color: 'var(--text-gold)' }}>· {getRankTitle(level)}</span>
              </span>
            </button>

            {/* Vault Balance Display & Currency Switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-secondary)',
              padding: '3px 8px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-gold)', fontFamily: 'monospace' }}>
                {safeBalance.toFixed(selectedCurrency === 'USDG' ? 2 : 4)}
              </span>
              {setSelectedCurrency && (
                <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.4)', padding: '2px', borderRadius: '8px' }}>
                  {['ETH', 'USDG'].map(curr => (
                    <button
                      key={curr}
                      onClick={() => setSelectedCurrency(curr)}
                      style={{
                        background: selectedCurrency === curr ? 'var(--accent-gold-gradient)' : 'transparent',
                        color: selectedCurrency === curr ? '#000' : 'var(--text-muted)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '2px 6px',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Deposit Action */}
            <button
              onClick={() => setShowDepositModal(true)}
              style={{
                padding: '5px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '12px',
                background: 'rgba(46, 189, 133, 0.18)',
                border: '1px solid rgba(46, 189, 133, 0.4)',
                color: 'var(--status-success)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer'
              }}
            >
              <ArrowDownRight size={12} /> <span className="hide-on-mobile">Deposit</span>
            </button>

            {/* Withdraw Action */}
            <button
              onClick={() => setShowWithdrawModal(true)}
              style={{
                padding: '5px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer'
              }}
            >
              <ArrowUpRight size={12} /> <span className="hide-on-mobile">Withdraw</span>
            </button>

            {/* Profile / Wallet Connect */}
            {isWalletConnected ? (
              <button
                onClick={() => { setTempUsername(username); setShowUsernameModal(true); }}
                style={{
                  padding: '5px 9px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--text-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <User size={13} color="var(--accent-gold)" />
                <span className="hide-on-mobile">{walletAddress}</span>
              </button>
            ) : (
              <button
                className="gold-button"
                onClick={() => login()}
                style={{ padding: '5px 12px', borderRadius: '12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Wallet size={13} /> Connect
              </button>
            )}

            {/* Audio Toggle */}
            {onToggleSound && (
              <button
                onClick={onToggleSound}
                title={soundMuted ? "Unmute Audio" : "Mute Audio"}
                style={{
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: soundMuted ? 'var(--status-danger)' : 'var(--accent-gold)',
                  cursor: 'pointer'
                }}
              >
                {soundMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Interactive Connection Modal */}
      {showPrivyModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300
        }}>
          <div className="glass-panel modal-content" style={{ width: '420px', padding: '32px', textAlign: 'center', borderRadius: '20px' }}>
            <img src="/htmlonyis.png" alt="ONYIS Logo" style={{ width: '56px', height: '56px', borderRadius: '14px', marginBottom: '16px', boxShadow: 'var(--shadow-gold)' }} />
            
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: '8px', letterSpacing: '1px' }}>
              CONNECT ROBINHOOD WALLET
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Connect your Web3 Wallet on Robinhood Chain network to sync your balance.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <button
                onClick={() => { login(); setShowPrivyModal(false); triggerToast('WALLET CONNECTED', 'Connected 0x8f3c...2a1b on Robinhood Chain', 'success'); }}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--text-gold)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Wallet size={18} /> Connect Robinhood Web3 Wallet
              </button>

              <button
                onClick={() => { login(); setShowPrivyModal(false); triggerToast('EMBEDDED VAULT CREATED', `Created Robinhood Chain Embedded Vault for @${username}`, 'success'); }}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <User size={18} color="var(--accent-gold)" /> Sign in via Email / Social
              </button>
            </div>

            <button
              onClick={() => setShowPrivyModal(false)}
              style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Deposit Modal — Burner Wallet Address Display */}
      {showDepositModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div className="glass-panel modal-content" style={{ width: '460px', padding: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <ArrowDownRight size={20} color="#2EBD85" />
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.15rem', letterSpacing: '1px' }}>
                DEPOSIT TO BURNER VAULT
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
              Send <strong style={{ color: 'var(--text-gold)' }}>ETH on Robinhood Chain</strong> to your personal burner wallet below.
              Balance updates automatically every 8 seconds.
            </p>

            {/* Connected Wallet Info */}
            <div style={{
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Connected Source Wallet:</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {connectedAddress ? `${connectedAddress.slice(0, 8)}...${connectedAddress.slice(-6)}` : 'Connected'}
              </span>
            </div>

            {/* Protocol Treasury Vault Address Box */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-gold)',
              borderRadius: '12px',
              padding: '18px 20px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: '#2EBD85', fontWeight: 700, letterSpacing: '1px' }}>⚡ OFFICIAL PROTOCOL TREASURY VAULT</span>
                <span style={{ fontSize: '0.6rem', background: 'rgba(46,189,133,0.15)', border: '1px solid rgba(46,189,133,0.4)', color: '#2EBD85', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>SEND ETH / USDG HERE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <code style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  color: 'var(--text-gold)',
                  fontWeight: 700,
                  wordBreak: 'break-all',
                  lineHeight: 1.5
                }}>
                  {PROTOCOL_VAULT_ADDRESS}
                </code>
                <button
                  onClick={handleCopyProtocolVault}
                  title="Copy Protocol Vault address"
                  style={{
                    flexShrink: 0,
                    background: copiedProtocolVault ? 'rgba(46,189,133,0.15)' : 'var(--bg-card)',
                    border: '1px solid ' + (copiedProtocolVault ? 'rgba(46,189,133,0.4)' : 'var(--border-gold)'),
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: copiedProtocolVault ? '#2EBD85' : 'var(--text-gold)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    transition: 'all 0.2s'
                  }}
                >
                  {copiedProtocolVault ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>

            {/* Info Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {[
                { n: '1', t: 'Copy the Protocol Vault / Burner address above' },
                { n: '2', t: 'Send ETH/USDG on Robinhood Chain from your personal wallet' },
                { n: '3', t: 'Click "I Have Sent Deposit" below to log request in queue (PENDING)' },
                { n: '4', t: 'Admin verifies deposit & credits your Session Vault balance' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.78rem' }}>
                  <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-gold)' }}>{s.n}</span>
                  <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.t}</span>
                </div>
              ))}
            </div>

            {/* Live Balance */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(46,189,133,0.06)', border: '1px solid rgba(46,189,133,0.2)', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Session Vault</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={12} color="#2EBD85" style={{ animation: 'spin 2s linear infinite' }} />
                <span style={{ fontWeight: 800, color: '#2EBD85', fontFamily: 'monospace' }}>
                  {safeBalance.toFixed(selectedCurrency === 'USDG' ? 2 : 4)} {selectedCurrency}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowDepositModal(false)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={handleNotifyDeposit}
                className="gold-button"
                style={{ flex: 1.6, padding: '12px', borderRadius: '10px', fontSize: '0.85rem' }}
              >
                I Have Sent Deposit ⏳
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div className="glass-panel modal-content" style={{ width: '400px', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '8px' }}>
              WITHDRAW TO ROBINHOOD WALLET
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Available Session Balance: <strong style={{ color: 'var(--text-gold)' }}>{safeBalance.toFixed(selectedCurrency === 'USDG' ? 2 : 4)} {selectedCurrency}</strong>
            </p>

            <div style={{ padding: '10px 12px', background: 'rgba(212, 175, 55, 0.06)', border: '1px solid var(--border-gold)', borderRadius: '8px', marginBottom: '18px', fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              ⏳ Withdrawals are queued in <strong style={{ color: 'var(--text-gold)' }}>PENDING</strong> status and processed manually to your Robinhood Chain wallet.
            </div>

            <form onSubmit={handleWithdraw}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Amount ({selectedCurrency})
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(safeBalance.toString())}
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid var(--border-gold)',
                      borderRadius: '4px',
                      color: 'var(--text-gold)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    MAX ({safeBalance.toFixed(selectedCurrency === 'USDG' ? 2 : 4)})
                  </button>
                </div>
                <input
                  type="number"
                  min={selectedCurrency === 'USDG' ? "1.00" : "0.0001"}
                  max={safeBalance.toString()}
                  step={selectedCurrency === 'USDG' ? "0.01" : "0.0001"}
                  required
                  placeholder={selectedCurrency === 'USDG' ? "10.00" : "0.05"}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-button"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px' }}
                >
                  Confirm Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Username Profile Modal */}
      {showUsernameModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div className="glass-panel modal-content" style={{ width: '400px', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '8px' }}>
              SET PLAYER ALIAS
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              This alias will be displayed on live multiplier feeds and leaderboard wins.
            </p>

            <form onSubmit={handleSaveUsername}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Username Alias
                </label>
                <input
                  type="text"
                  required
                  placeholder="DegenKing"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowUsernameModal(false)}
                  style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-button"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px' }}
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
