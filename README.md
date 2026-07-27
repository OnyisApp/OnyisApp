# ⚡ ONYIS — Onchain Native Yield Instant Settlement

> **Next-Generation Web3 Casino & Real-Time Gaming Protocol on Robinhood Chain Mainnet**

[![Network: Robinhood Chain](https://img.shields.io/badge/Network-Robinhood_Chain_Mainnet-D4AF37?style=for-the-badge&logo=ethereum)](https://robinhoodchain.blockscout.com)
[![Chain ID: 4663](https://img.shields.io/badge/Chain_ID-4663-2EBD85?style=for-the-badge)](https://rpc.mainnet.chain.robinhood.com)
[![Built with React 19](https://img.shields.io/badge/React-19.2.7-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Powered by Vite](https://img.shields.io/badge/Vite-8.1.1-646CFF?style=for-the-badge&logo=vite)](https://vite.dev)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase_Realtime-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

---

## 🌟 Overview

**ONYIS** (*Onchain Native Yield Instant Settlement*) is a high-performance Web3 gaming platform designed for Robinhood Chain. Combining real-time provably fair gaming engines with custodial vault queues, multi-token balance tracking (ETH & USDG), and a RevShare staking system powered by protocol house fees.

---

## 🎮 Game Suite & Mechanics

### 1. 🪙 FLIPO — Instant Coinflip
- **Fair Odds**: 50 / 50 random coin toss backed by WebCrypto & SHA-256 randomness.
- **Payout Multiplier**: `1.96x` (2% protocol house fee).
- **Features**: Synchronous double-click lock protection, flip animations, multi-token wagering (ETH / USDG).

### 2. 📈 RUGO — Memecoin Chart Crash
- **Engine**: Volatile candlestick chart simulation with exponential price curves.
- **Crash Distribution**: Mathematical curve `E = 0.97 / (1.0001 - r * 0.96)` providing a 3% house edge.
- **Rugged Reset**: Resets multiplier instantly to `0.00x` (`RUGGED @ 0.00x`) upon crash.
- **Automated Strategies**:
  - **Auto-Cashout**: Set a target multiplier (e.g. `2.00x`) for automatic claim.
  - **Martingale Strategy**: Auto-doubles wager on loss and resets to initial wager on win.

### 3. 🎯 BOLO — Plinko Drop
- **Physics**: Real-time canvas ball drop simulation with peg-collision mechanics.
- **Customization**: Adjustable peg rows (**8 to 16 rows**) and risk levels (**Low, Medium, High**).
- **RTP & Safety**: Calibrated slot multipliers providing 98.0% Return to Player (RTP) with isolated per-ball currency tracking.

---

## 🔒 Custodial Vault & Queue Architecture

```
[ User Deposit ] ──> [ Protocol Treasury Vault ] ──> [ Supabase PENDING Queue ] ──> [ Admin Verifies & Credits Burner Vault ]
[ User Withdraw] ──> [ Request PENDING Queue ]   ──> [ Admin Transfers from Vault ] ──> [ Destination User Wallet ]
```

### Verified Protocol Addresses (Robinhood Chain Mainnet)

| Role | Contract / Vault Address | Note |
| :--- | :--- | :--- |
| **Official Protocol Treasury Vault** | `0x0A9A846a8A7f84395E6d618B3F80bA1f7F8ee66a` | Main Protocol Deposit Treasury |
| **Managed Staking Vault** | `0xEE29A5dC23eC52542B7Ac1dAeFff1458320D73FD` | ETH RevShare & Lock Escrow Vault |
| **$ONYIS Token Contract** | `TBD (Launching Soon)` | Fixed Supply 1,000,000,000 $ONYIS |
| **Provably Fair SHA-256 Oracle** | `0x736D76699C26D0d966744cAe304C000d471f7F35` | Onchain Seed & Randomness Verifier |

---

## 💎 $ONYIS Tokenomics & Staking Architecture

- **Total Supply**: `1,000,000,000 $ONYIS` (1 Billion Fixed Supply)
- **Dev Team Allocation**: `5%` (`50,000,000 $ONYIS`)
- **Minimum Stake Amount**: `100,000 $ONYIS`
- **100% Fee Redistribution**: 100% of game house fees (2% - 3%) automatically route to `house_fee_logs` for Staking Pool distribution.

### Lock Period Multipliers

| Lock Duration | Reward Multiplier | Forfeiture Rule |
| :---: | :---: | :--- |
| **7 Days** | `1.00x` | Early unstake forfeits 100% ETH rewards (Principal returned) |
| **14 Days** | `1.30x` | Early unstake forfeits 100% ETH rewards (Principal returned) |
| **30 Days** | `1.75x` | Early unstake forfeits 100% ETH rewards (Principal returned) |
| **60 Days** | `2.25x` | Early unstake forfeits 100% ETH rewards (Principal returned) |
| **90 Days** | `3.00x` | Early unstake forfeits 100% ETH rewards (Principal returned) |

---

## 🗄️ Supabase Database Schemas

Execute the following SQL queries in your Supabase SQL Editor to initialize all required queue tables:

```sql
-- 1. Deposit Queue Requests
CREATE TABLE IF NOT EXISTS deposit_requests (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  source_wallet TEXT,
  protocol_vault TEXT NOT NULL,
  burner_vault TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETH',
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Withdrawal Queue Requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETH',
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Staking Lock Requests
CREATE TABLE IF NOT EXISTS stake_requests (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  staking_vault TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  lock_days INT NOT NULL,
  multiplier NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. House Fee Routing Logs
CREATE TABLE IF NOT EXISTS house_fee_logs (
  id BIGSERIAL PRIMARY KEY,
  game TEXT NOT NULL,
  player TEXT NOT NULL,
  wager_amount NUMERIC NOT NULL,
  fee_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETH',
  staking_vault TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🛠️ Tech Stack & Dependencies

- **Frontend**: React 19, Vite 8, Lucide React Icons, Canvas Confetti.
- **Styling**: Modern dark-mode glassmorphism, HSL tailormade design tokens.
- **Authentication & Web3**: `@privy-io/react-auth` with fallback demo mode.
- **RPC Integration**: Native Robinhood Chain Mainnet RPC (`https://rpc.mainnet.chain.robinhood.com`).
- **Database & Realtime**: `@supabase/supabase-js`.

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/OnyisApp/OnyisApp.git
cd OnyisApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration (`.env`)
Create a `.env` file in the root directory:
```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_SUPABASE_URL=https://your_supabase_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
```

---

## 📜 License & Security

Privately owned repository. Built for high-frequency Web3 gaming on Robinhood Chain Mainnet.
