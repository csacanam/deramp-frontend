import { useMemo } from 'react';
import { Chain } from 'wagmi/chains';
import { base, polygon, celo } from 'wagmi/chains';
import { Token } from '../types/invoice';

// Map network names to chain objects
const NETWORK_TO_CHAIN: Record<string, Chain> = {
  'Base': base,
  'Polygon': polygon,
  'Polygon POS': polygon, // Backend uses "Polygon POS"
  'Celo': celo,
};

export const useAvailableChains = (tokens: Token[]) => {
  return useMemo(() => {
    if (!tokens || tokens.length === 0) {
      return [];
    }

    // Get unique networks from tokens
    const availableNetworks = [...new Set(tokens.map(token => token.network))];
    
    // Map to chain objects
    const availableChains = availableNetworks
      .map(network => NETWORK_TO_CHAIN[network])
      .filter(Boolean); // Remove undefined values

    return availableChains;
  }, [tokens]);
}; 