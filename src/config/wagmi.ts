import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { celo } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';

// Definir Celo Alfajores manualmente (igual que en chains.ts)
const celoAlfajores: Chain = {
  id: 44787,
  name: 'Celo Alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: { http: ['https://alfajores-forno.celo-testnet.org'] },
    public: { http: ['https://alfajores-forno.celo-testnet.org'] },
  },
  blockExplorers: {
    default: { name: 'Celo Explorer', url: 'https://explorer.celo.org/alfajores' },
  },
  testnet: true,
};

// Solo Celo y Celo Alfajores están habilitados
export const allChains: readonly [Chain, ...Chain[]] = [celo, celoAlfajores];

export const config = getDefaultConfig({
  appName: 'Crypto Stablecoins Checkout',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2f5a2c1c23b54e8e9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8', // Get your own from https://cloud.walletconnect.com
  chains: allChains,
  ssr: false, // If your dApp uses server side rendering (SSR)
}); 