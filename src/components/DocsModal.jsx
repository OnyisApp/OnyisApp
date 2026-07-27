import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Search, X, Copy, CheckCheck, ExternalLink,
  Shield, Rocket, Coins, Flame, Terminal, Cpu, ChevronRight, Zap,
  Lock, TrendingUp, BarChart3, AlertTriangle, Layers, ShieldCheck
} from 'lucide-react';

export default function DocsModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const contentRef = useRef(null);

  // Keyboard shortcut Cmd+K / Ctrl+K listener for Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  if (!isOpen) return null;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    setIsSearchOpen(false);
    const element = document.getElementById(`docs-sec-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const contractsList = [
    { role: 'Official Protocol Treasury Vault', address: '0x0A9A846a8A7f84395E6d618B3F80bA1f7F8ee66a', note: 'Robinhood Chain Mainnet · Protocol Deposit Treasury' },
    { role: '$ONYIS Token Contract', address: 'TBD (Launching Soon)', note: 'Official token' },
    { role: 'Managed Staking Vault', address: '0xEE29A5dC23eC52542B7Ac1dAeFff1458320D73FD', note: 'ETH RevShare & Lock Escrow Vault' },
    { role: 'Provably Fair SHA-256 Oracle', address: '0x736D76699C26D0d966744cAe304C000d471f7F35', note: 'Onchain Seed & Randomness Verifier' }
  ];

  const searchTopics = [
    { id: 'overview', title: 'Protocol Overview', category: 'Protocol', text: 'Everything about ONYIS platform, architecture, and instant Web3 gaming.' },
    { id: 'mechanics', title: 'Game Mechanics', category: 'Protocol', text: 'FLIPO 50/50, RUGO Chart Crash, and BOLO Plinko physics.' },
    { id: 'bolo', title: 'BOLO Plinko Physics', category: 'Protocol', text: 'Gaussian bell curve peg bounce, official Stake multipliers and odds.' },
    { id: 'staking', title: 'Staking & Lock Multipliers', category: 'Protocol', text: '50% ETH revshare, 7 to 90 day locks, 1.0x to 3.0x multipliers, early unstake rules.' },
    { id: 'tokenomics', title: 'Tokenomics & RevShare', category: 'Protocol', text: '50% Staker revenue share, 25% buyback and burn, 25% protocol reserve.' },
    { id: 'fees', title: 'Fees & Auto-Burn', category: 'Protocol', text: 'House edge distribution, automated TWAP buyback, and supply reduction.' },
    { id: 'risks', title: 'Risk Disclosures', category: 'Protocol', text: 'Session vault protection, provably fair seed hashes, and early unlock rules.' },
    { id: 'network', title: 'Network Specs', category: 'Integration', text: 'Robinhood Chain mainnet details, Chain ID 4663, RPC endpoints.' },
    { id: 'contracts', title: 'Smart Contracts', category: 'Integration', text: 'Deployed Vault, ONYIS token, Staking, and Oracle contract addresses.' },
    { id: 'viem', title: 'Viem & Web3 Code Snippets', category: 'Integration', text: 'Reading session vault balance and provably fair seeds using Viem JS.' }
  ];

  const filteredTopics = searchQuery.trim() === ''
    ? searchTopics
    : searchTopics.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 6, 8, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 350,
      padding: '20px'
    }}>
      {/* Main Documentation Modal Container */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '860px',
        height: '82vh',
        borderRadius: '16px',
        border: '1px solid var(--border-gold)',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.85), 0 0 20px rgba(212, 175, 55, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--bg-primary)'
      }}>

        {/* ── Top Header Navigation Bar ────────────────────────────────────────────── */}
        <header style={{
          padding: '14px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 17, 22, 0.9)',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}>
          {/* Left Brand Title & Version Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/htmlonyis.png" alt="ONYIS Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)' }} />
              <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '2px' }}>
                ONYIS DOCS
              </span>
            </div>

            {/* BETA Badge */}
            <span style={{
              padding: '3px 10px',
              borderRadius: '16px',
              background: 'var(--accent-gold)',
              color: '#000',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '1px'
            }}>
              BETA
            </span>
          </div>

          {/* Center Search Bar Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 18px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-gold)',
              borderRadius: '20px',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '300px',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} color="var(--accent-gold)" />
              <span>Search docs...</span>
            </div>
            <kbd style={{
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid var(--border-gold)',
              color: 'var(--text-gold)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontFamily: 'monospace',
              fontWeight: 700
            }}>
              ⌘K
            </kbd>
          </button>

          {/* Right Action & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="https://robinhoodchain.blockscout.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Explorer <ExternalLink size={12} />
            </a>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ── Main Layout Body: Left Sidebar + Scrollable Content ─────────────────────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── Left Sidebar Navigation ──────────────────────────────────────────────── */}
          <aside style={{
            width: '190px',
            flexShrink: 0,
            borderRight: '1px solid var(--border-subtle)',
            padding: '16px 10px',
            background: 'rgba(10, 12, 16, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Group 1: Protocol */}
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '6px' }}>
                  Protocol
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'mechanics', label: 'Game Mechanics' },
                    { id: 'bolo', label: 'BOLO Plinko' },
                    { id: 'staking', label: 'Staking & Locks' },
                    { id: 'tokenomics', label: 'Tokenomics' },
                    { id: 'fees', label: 'Fees & Burn' },
                    { id: 'risks', label: 'Risks' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      style={{
                        textAlign: 'left',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: activeSection === item.id ? 700 : 500,
                        color: activeSection === item.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        background: activeSection === item.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                        border: activeSection === item.id ? '1px solid var(--border-gold)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group 2: Integration */}
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '6px' }}>
                  Integration
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {[
                    { id: 'network', label: 'Network Specs' },
                    { id: 'contracts', label: 'Smart Contracts' },
                    { id: 'viem', label: 'Viem Code' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      style={{
                        textAlign: 'left',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: activeSection === item.id ? 700 : 500,
                        color: activeSection === item.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        background: activeSection === item.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                        border: activeSection === item.id ? '1px solid var(--border-gold)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar Bottom Network Card */}
            <div style={{
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.7rem'
            }}>
              <div style={{ color: '#2EBD85', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2EBD85', boxShadow: '0 0 5px #2EBD85' }}></span>
                Robinhood Chain
              </div>
              <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Chain ID: 4663</div>
            </div>
          </aside>

          {/* ── Main Content Area ─────────────────────────────────────────────────────── */}
          <main ref={contentRef} style={{
            flex: 1,
            padding: '24px 32px',
            overflowY: 'auto',
            scrollBehavior: 'smooth'
          }}>

            {/* Hero Section */}
            <div style={{ marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.45rem',
                color: 'var(--text-primary)',
                letterSpacing: '1px',
                marginBottom: '4px'
              }}>
                Everything about ONYIS, in one place.
              </h1>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>
                Onchain Native Yield Instant Settlement
              </p>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '720px' }}>
                Official technical architecture, provably fair cryptographic specifications, staking economics, and game mechanics reference for the ONYIS platform on Robinhood Chain.
              </p>
            </div>

            {/* SECTION: Overview */}
            <section id="docs-sec-overview" style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.3rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Rocket size={18} /> Protocol Overview
              </h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p>
                  <strong>ONYIS</strong> (<em>Onchain Native Yield Instant Settlement</em>) is a non-custodial Web3 instant gaming protocol engineered specifically for Robinhood Chain. It blends zero-friction 50/50 PvP coin tosses (<strong>FLIPO</strong>), curve crash chart battles (<strong>RUGO</strong>), physics-driven Plinko drops (<strong>BOLO</strong>), and a high-yield staking mechanism (<strong>STAKE</strong>).
                </p>
                <p>
                  ONYIS never holds custody of your gaming funds. All wagers and payouts are processed instantaneously using Robinhood Chain Session Vaults with 100% cryptographic transparent execution.
                </p>

                {/* Callout Box */}
                <div style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.06)',
                  border: '1px solid var(--border-gold)',
                  marginTop: '6px'
                }}>
                  <strong style={{ color: 'var(--text-gold)', display: 'block', marginBottom: '10px', fontSize: '0.9rem' }}>Key Protocol Principles</strong>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.84rem', lineHeight: 1.7 }}>
                    <li><strong>Non-Custodial</strong>: Every wager and payout executes directly to your session vault.</li>
                    <li><strong>Provably Fair</strong>: All game outcomes are calculated using SHA-256 server seed hashes generated before your bet.</li>
                    <li><strong>Native Yield</strong>: 50% of protocol house edge is distributed directly to $ONYIS stakers in native ETH.</li>
                    <li><strong>Zero Delay</strong>: 1-tap instant execution optimized for low latency on Robinhood Chain.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* SECTION: Game Mechanics */}
            <section id="docs-sec-mechanics" style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.3rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} /> How Games Work
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '20px' }}>
                Every game in ONYIS follows a strict 3-step transparent execution lifecycle:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-gold)', fontWeight: 800, marginBottom: '6px' }}>STEP 01</div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Wager Placement</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    Select your bet amount (ETH or USDG) and place your wager. Funds are locked upfront in your session vault.
                  </p>
                </div>

                <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-gold)', fontWeight: 800, marginBottom: '6px' }}>STEP 02</div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Physics & Hash Roll</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    The cryptographic seed hash evaluates the outcome using true vector physics or curve multipliers.
                  </p>
                </div>

                <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-gold)', fontWeight: 800, marginBottom: '6px' }}>STEP 03</div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Instant Settlement</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    Payouts are credited back to your balance immediately upon game completion without extra claim gas.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION: BOLO Plinko */}
            <section id="docs-sec-bolo" style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.3rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} /> BOLO Plinko Physics & Odds
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '16px' }}>
                <strong>BOLO Plinko</strong> features 100% continuous Newtonian vector physics combined with official Stake/Roobet probability distributions:
              </p>

              <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <strong style={{ color: 'var(--text-gold)', display: 'block', marginBottom: '8px', fontSize: '0.88rem' }}>Organic Gaussian Peg Reflection</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  For 99.9% of standard drops, outer peg collisions reflect horizontal velocity inward (`ball.vx *= -0.55`). This ensures a natural bell curve distribution clustering 99.9% of balls in the center multiplier slots (`0.3x`–`1.2x`).
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                  <div style={{ color: 'var(--text-gold)', fontWeight: 700, marginBottom: '4px' }}>Jackpot Drop Odds (0.01%)</div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    When RNG rolls 0.01% (1 in 10,000 drops), boundary reflection is disabled, allowing the ball to reach extreme edge slots (`1000x`, `170x`, `29x`).
                  </div>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                  <div style={{ color: 'var(--text-gold)', fontWeight: 700, marginBottom: '4px' }}>Big Win Drop Odds (0.1%)</div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    When RNG rolls 0.1% (1 in 1,000 drops), high multiplier boundaries unlock for smooth outer slot landings (`10x`, `26x`, `41x`).
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION: Staking */}
            <section id="docs-sec-staking" style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.3rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} /> Staking Architecture & Multipliers
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '16px' }}>
                Holders can stake minimum <strong>100,000 $ONYIS</strong> to earn real ETH yield generated directly from platform house edge fees.
              </p>

              {/* Multipliers Table */}
              <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <strong style={{ color: 'var(--text-gold)', display: 'block', marginBottom: '12px', fontSize: '0.88rem' }}>Lock Duration Multipliers</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', textAlign: 'center' }}>
                  {[
                    { days: '7 Days', mult: '1.0x', color: '#9DA6B4' },
                    { days: '14 Days', mult: '1.3x', color: '#4AB9F5' },
                    { days: '30 Days', mult: '1.75x', color: '#2EBD85' },
                    { days: '60 Days', mult: '2.25x', color: '#FFBF00' },
                    { days: '90 Days', mult: '3.0x', color: '#D4AF37' }
                  ].map(opt => (
                    <div key={opt.days} style={{ padding: '10px 6px', background: 'var(--bg-card)', borderRadius: '8px', border: `1px solid ${opt.color}40` }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{opt.days}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: opt.color, fontFamily: 'var(--font-heading)' }}>{opt.mult}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Early Unstake Rule Callout */}
              <div style={{
                padding: '16px 18px',
                borderRadius: '12px',
                background: 'rgba(246, 70, 93, 0.06)',
                border: '1px solid rgba(246, 70, 93, 0.25)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <AlertTriangle size={18} color="#F6465D" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong style={{ color: '#F6465D', display: 'block', marginBottom: '2px' }}>Early Unstake Policy</strong>
                  Stakers can request unstake at any time. However, unstaking before the selected lock duration completes results in <strong style={{ color: '#F6465D' }}>100% forfeiture of all accumulated ETH rewards</strong>. Your original $ONYIS tokens are always safely returned.
                </div>
              </div>
            </section>

            {/* SECTION: Tokenomics */}
            <section id="docs-sec-tokenomics" style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.3rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={18} /> Tokenomics & Revenue Share
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '16px' }}>
                The <strong>$ONYIS</strong> token has a fixed total supply of <strong>1,000,000,000 ONYIS</strong> (Dev allocation: 5% = 50M ONYIS). Platform revenue from game house edge is distributed as follows:
              </p>

              <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-gold)' }}>50%</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Staker ETH RevShare</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#2EBD85' }}>25%</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Automated Buyback & Burn</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#FF5400' }}>25%</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Protocol Reserve</div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION: Fees */}
            <section id="docs-sec-fees" style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.3rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} /> House Edge & Auto-Burn
              </h2>

              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p>
                  ONYIS maintains a competitive <strong>2% house edge</strong> across all gaming modes (FLIPO 1.96x, RUGO curve, BOLO Plinko).
                </p>
                <p>
                  25% of house edge proceeds are routed directly to automated TWAP smart contract buybacks that acquire $ONYIS tokens from Robinhood Chain liquidity pools and send them to the `0x000...dead` burn address, permanently reducing circulating supply.
                </p>
              </div>
            </section>

            {/* SECTION: Risks */}
            <section id="docs-sec-risks" style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.3rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} /> Risk Disclosures & Security
              </h2>

              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p>
                  All gaming carries inherent financial risk. Stakers and players should only wager funds they can afford to lose.
                </p>
                <p>
                  ONYIS uses isolated session vaults to prevent unauthorized main wallet drain. Seed hashes are verifiably logged before game execution to ensure mathematical fairness.
                </p>
              </div>
            </section>

            {/* SECTION: Network Specs */}
            <section id="docs-sec-network" style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.3rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} /> Robinhood Chain Network Specs
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { k: 'Network Name', v: 'Robinhood Chain Mainnet' },
                  { k: 'Chain ID', v: '4663' },
                  { k: 'RPC Endpoint', v: 'https://rpc.mainnet.chain.robinhood.com' },
                  { k: 'Currency Symbol', v: 'ETH' },
                  { k: 'Block Explorer', v: 'robinhoodchain.blockscout.com' },
                  { k: 'Architecture', v: 'Arbitrum Layer-2 EVM' }
                ].map(item => (
                  <div key={item.k} style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '2px' }}>{item.k}</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'monospace' }}>{item.v}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION: Smart Contracts */}
            <section id="docs-sec-contracts" style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.3rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} /> Verified Smart Contracts
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '20px' }}>
                Verified smart contracts deployed on Robinhood Chain Mainnet:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {contractsList.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '16px 20px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.role}</div>
                      {item.note && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.note}</div>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-gold)', background: 'rgba(212,175,55,0.08)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-gold)' }}>
                        {item.address}
                      </code>
                      <button
                        onClick={() => handleCopy(item.address, idx)}
                        style={{
                          background: copiedAddress === idx ? 'rgba(46,189,133,0.2)' : 'rgba(255,255,255,0.05)',
                          border: '1px solid ' + (copiedAddress === idx ? '#2EBD85' : 'var(--border-subtle)'),
                          borderRadius: '6px',
                          padding: '6px 10px',
                          color: copiedAddress === idx ? '#2EBD85' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {copiedAddress === idx ? <><CheckCheck size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION: Onchain Code Snippet */}
            <section id="docs-sec-viem" style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', fontSize: '1.3rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} /> Onchain Integration Code
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '14px' }}>
                Example Viem JS integration for reading vault balance and provably fair seed verification:
              </p>

              <div style={{
                background: '#090B0E',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '20px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#E5C158',
                lineHeight: 1.6,
                overflowX: 'auto'
              }}>
                <pre style={{ margin: 0 }}>
{`import { createPublicClient, http, parseAbi } from 'viem';

const client = createPublicClient({
  chain: {
    id: 4663,
    name: 'Robinhood Chain',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.mainnet.chain.robinhood.com'] } }
  },
  transport: http()
});

// Read Session Vault Balance
const balance = await client.getBalance({
  address: '0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB'
});

console.log('Live Vault Balance (ETH):', Number(balance) / 1e18);`}
                </pre>
              </div>
            </section>

          </main>
        </div>

      </div>

      {/* ── Cmd+K Interactive Search Modal Overlay ────────────────────────────────────── */}
      {isSearchOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 400,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '100px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '560px',
            borderRadius: '16px',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 0 40px rgba(0,0,0,0.9)',
            overflow: 'hidden',
            background: 'var(--bg-primary)'
          }}>
            {/* Search Input Bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={18} color="var(--accent-gold)" />
              <input
                type="text"
                autoFocus
                placeholder="Search topics, contracts, mechanics, staking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Results List */}
            <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '10px' }}>
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => scrollToSection(topic.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{topic.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{topic.text}</div>
                    </div>
                    <ChevronRight size={16} color="var(--accent-gold)" />
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No matching documentation topics found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
