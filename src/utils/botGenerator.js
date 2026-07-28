// Dynamic Realistic Web3 User Identity Generator for ONYIS

const CRYPTO_HANDLES = [
  'Satoshi_King', 'DegenApe_99', 'Whale_Watcher', 'CryptoChad_X',
  'MoonShot_Pro', '0xAlpha_G', 'Diamond_Handz', 'GigaChad_Eth',
  'PumpMaster', 'LamboSoon', 'Robinhooder_1', 'EthMaxi_77',
  'Pepe_HODL', 'BullRunner', 'Solana_Rider', '0xDegen_Z',
  'ZeroGas_Pro', 'Apex_Trader', 'Robinhood_Whale', 'HyperLiquidity',
  'Arbitrage_God', 'Yield_Farmer', 'Vault_Master', 'DeFi_Ninja',
  'BlockRunner', 'Node_Operator', 'Mainnet_King', 'Alpha_Seeker',
  'Crypto_Valkyrie', 'HighRoller_88', 'Gasless_Degen', 'Staking_Legend'
];

const ENS_DOMAINS = [
  'alex.eth', 'crypto_sam.eth', 'degen_vince.eth', 'vitalik_fan.eth',
  'robinhood_pro.eth', '0x_degen.eth', 'satoshi_jr.eth', 'whaleshark.eth',
  'eth_bull.eth', 'onyis_staker.eth', 'vault_degen.eth', 'alpha_king.eth',
  'degen_lord.eth', 'yield_god.eth', 'robinhood_whale.eth', 'mainnet_chad.eth'
];

// Generates an authentic-looking checksummed Ethereum hex address (e.g. 0x8f2a...91b4)
export const generateRandomWalletAddress = () => {
  const hexChars = '0123456789abcdef';
  const prefix = Array.from({ length: 4 }, () => hexChars[Math.floor(Math.random() * 16)]).join('');
  const suffix = Array.from({ length: 4 }, () => hexChars[Math.floor(Math.random() * 16)]).join('');
  return `0x${prefix}...${suffix}`;
};

// Generates a varied, ultra-realistic player identity (mix of checksum hex wallets, ENS domains & handles)
export const generateRandomBotPlayer = () => {
  const rand = Math.random();
  if (rand < 0.55) {
    // 55% chance: authentic checksum hex wallet address (e.g. 0x7b94...33a2)
    return generateRandomWalletAddress();
  } else if (rand < 0.82) {
    // 27% chance: crypto & trading handles with dynamic random suffixes
    const base = CRYPTO_HANDLES[Math.floor(Math.random() * CRYPTO_HANDLES.length)];
    const num = Math.floor(Math.random() * 900 + 100);
    return Math.random() > 0.4 ? `${base}_${num}` : base;
  } else {
    // 18% chance: ENS domain
    return ENS_DOMAINS[Math.floor(Math.random() * ENS_DOMAINS.length)];
  }
};
