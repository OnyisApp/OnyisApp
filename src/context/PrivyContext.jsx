import React, { createContext, useState } from 'react';
import { PrivyProvider as OfficialPrivyProvider } from '@privy-io/react-auth';

const PrivyContext = createContext(null);

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || '';
const isRealAppId = Boolean(PRIVY_APP_ID && PRIVY_APP_ID !== 'YOUR_PRIVY_APP_ID' && PRIVY_APP_ID.trim().length > 5);

// Official Robinhood Chain EVM Specification
const ROBINHOOD_CHAIN = {
  id: 4663,
  name: 'Robinhood',
  network: 'robinhood',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.chain.robinhood.com'],
    },
    public: {
      http: ['https://rpc.mainnet.chain.robinhood.com'],
    }
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://robinhoodchain.blockscout.com',
    },
  },
};

function FallbackPrivyProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = () => {
    setAuthenticated(true);
    setUser({
      wallet: {
        address: '0x8f3c2a1b99e44f09d300c1f2a99988ff2a1b99e4'
      }
    });
  };

  const logout = () => {
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <PrivyContext.Provider value={{ ready: true, authenticated, user, login, logout, isDemo: true }}>
      {children}
    </PrivyContext.Provider>
  );
}

export function PrivyProvider({ children }) {
  if (isRealAppId) {
    return (
      <OfficialPrivyProvider
        appId={PRIVY_APP_ID.trim()}
        config={{
          appearance: {
            theme: 'dark',
            accentColor: '#D4AF37',
            logo: '/htmlonyis.png'
          },
          defaultChain: ROBINHOOD_CHAIN,
          supportedChains: [ROBINHOOD_CHAIN],
          embeddedWallets: {
            createOnLogin: 'all-users',
            requireUserPasswordOnCreate: false
          }
        }}
      >
        {children}
      </OfficialPrivyProvider>
    );
  }

  return <FallbackPrivyProvider>{children}</FallbackPrivyProvider>;
}
