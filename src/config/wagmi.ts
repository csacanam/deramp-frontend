import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, polygon, celo, bsc, mainnet, arbitrum, optimism, avalanche } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';

// All supported chains
export const allChains: readonly [Chain, ...Chain[]] = [
  mainnet,    // Ethereum mainnet
  base,       // Base
  polygon,    // Polygon
  arbitrum,   // Arbitrum
  optimism,   // Optimism
  avalanche,  // Avalanche
  bsc,        // Binance Smart Chain
  celo        // Celo
];

export const config = getDefaultConfig({
  appName: 'Crypto Stablecoins Checkout',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2f5a2c1c23b54e8e9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8', // Get your own from https://cloud.walletconnect.com
  chains: allChains,
  ssr: false, // If your dApp uses server side rendering (SSR)
}); 