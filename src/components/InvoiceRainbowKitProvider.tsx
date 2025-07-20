import React, { useMemo } from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { celo } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';
import { Token } from '../types/invoice';

interface InvoiceRainbowKitProviderProps {
  children: React.ReactNode;
  availableTokens?: Token[];
}

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

// Map network names to chain objects - solo Celo
const NETWORK_TO_CHAIN: Record<string, Chain> = {
  'Celo': celo,
  'CELO': celo,
  'Celo Mainnet': celo,
  'Celo Alfajores': celoAlfajores,
  'Alfajores': celoAlfajores,
  'Celo Testnet': celoAlfajores,
};

export const InvoiceRainbowKitProvider: React.FC<InvoiceRainbowKitProviderProps> = ({ 
  children, 
  availableTokens 
}) => {
  // Note: supportedChains is calculated but not currently used in RainbowKitProvider
  // This is kept for future use when we need to dynamically configure chains
  const _supportedChains = useMemo(() => {
    if (!availableTokens || availableTokens.length === 0) {
      // Fallback to Celo chains if no tokens provided
      return [celo, celoAlfajores] as const;
    }

    // Get unique networks from tokens
    const availableNetworks = [...new Set(availableTokens.map(token => token.network))];
    
    // Map to chain objects and ensure we have at least one chain
    const chains = availableNetworks
      .map(network => NETWORK_TO_CHAIN[network])
      .filter(Boolean);

    // Ensure we have at least one chain for RainbowKit
    return chains.length > 0 ? chains : [celo, celoAlfajores];
  }, [availableTokens]);

  return (
    <RainbowKitProvider>
      {children}
    </RainbowKitProvider>
  );
}; 