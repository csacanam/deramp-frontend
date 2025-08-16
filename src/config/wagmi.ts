import { createConfig, http } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Debug: Log environment variables
console.log('🔍 Wagmi Config Debug:');
console.log('  - VITE_WALLETCONNECT_PROJECT_ID:', import.meta.env.VITE_WALLETCONNECT_PROJECT_ID);
console.log('  - NODE_ENV:', import.meta.env.NODE_ENV);
console.log('  - DEV:', import.meta.env.DEV);

// Define Celo Alfajores manually (same as in chains.ts)
const celoAlfajoresChain = {
  ...celoAlfajores,
  rpcUrls: {
    default: { http: ['https://alfajores-forno.celo-testnet.org', 'https://alfajores.celo-testnet.org'] },
    public: { http: ['https://alfajores-forno.celo-testnet.org', 'https://alfajores.celo-testnet.org'] },
  },
};

// Only Celo and Celo Alfajores are enabled
export const allChains = [celo, celoAlfajoresChain] as const;

export const config = createConfig({
  chains: allChains,
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2f5a2c1c23b54e8e9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8',
    }),
    coinbaseWallet({
      appName: 'Voulti',
    }),
  ],
  transports: {
    [celo.id]: http(),
    [celoAlfajoresChain.id]: http(),
  },
}); 