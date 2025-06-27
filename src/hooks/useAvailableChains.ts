import { useMemo } from 'react';
import { Chain } from 'wagmi/chains';
import { base, polygon, celo, bsc, mainnet, arbitrum, optimism, avalanche } from 'wagmi/chains';
import { Token } from '../types/invoice';

// Map network names to chain objects
const NETWORK_TO_CHAIN: Record<string, Chain> = {
  'Ethereum': mainnet,
  'Ethereum Mainnet': mainnet,
  'Base': base,
  'Polygon': polygon,
  'Polygon POS': polygon, // Backend uses "Polygon POS"
  'Arbitrum': arbitrum,
  'Arbitrum One': arbitrum,
  'Optimism': optimism,
  'OP Mainnet': optimism,
  'Avalanche': avalanche,
  'Avalanche C-Chain': avalanche,
  'BSC': bsc,
  'BNB Smart Chain': bsc,
  'Binance Smart Chain': bsc,
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