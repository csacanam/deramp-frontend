import React, { useMemo } from 'react';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, polygon, celo } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';
import { Token } from '../types/invoice';

interface InvoiceRainbowKitProviderProps {
  children: React.ReactNode;
  availableTokens?: Token[];
}

// Map network names to chain objects
const NETWORK_TO_CHAIN: Record<string, Chain> = {
  'Base': base,
  'Polygon': polygon,
  'Polygon POS': polygon, // Backend uses "Polygon POS"
  'Celo': celo,
};

export const InvoiceRainbowKitProvider: React.FC<InvoiceRainbowKitProviderProps> = ({ 
  children, 
  availableTokens 
}) => {
  const supportedChains = useMemo(() => {
    if (!availableTokens || availableTokens.length === 0) {
      // Fallback to all chains if no tokens provided
      return [base, polygon, celo] as const;
    }

    // Get unique networks from tokens
    const availableNetworks = [...new Set(availableTokens.map(token => token.network))];
    
    // Map to chain objects and ensure we have at least one chain
    const chains = availableNetworks
      .map(network => NETWORK_TO_CHAIN[network])
      .filter(Boolean);

    // Ensure we have at least one chain for RainbowKit
    return chains.length > 0 ? chains : [base, polygon, celo];
  }, [availableTokens]);

  return (
    <RainbowKitProvider>
      {children}
    </RainbowKitProvider>
  );
}; 