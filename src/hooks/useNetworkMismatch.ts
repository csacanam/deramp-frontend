import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';

interface UseNetworkMismatchProps {
  selectedNetwork?: number;
}

interface UseNetworkMismatchReturn {
  hasMismatch: boolean;
  expectedNetwork: string;
  currentNetwork: string;
  isSwitching: boolean;
  switchToCorrectNetwork: () => Promise<void>;
}

export const useNetworkMismatch = ({ selectedNetwork }: UseNetworkMismatchProps): UseNetworkMismatchReturn => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [isSwitching, setIsSwitching] = useState(false);

  // Get network names for display
  const getNetworkName = useCallback((chainId: number): string => {
    switch (chainId) {
      case 44787: return 'Celo Alfajores';
      case 1: return 'Ethereum Mainnet';
      case 137: return 'Polygon';
      case 56: return 'BNB Smart Chain';
      default: return `Chain ID ${chainId}`;
    }
  }, []);

  // Check if there's a network mismatch - calculate directly without useCallback
  const hasMismatch = (() => {
    if (!isConnected || !chainId || !selectedNetwork) {
      return false; // No mismatch if not connected or no network selected
    }
    
    const mismatch = chainId !== selectedNetwork;
    return mismatch;
  })();

  // Switch to the correct network
  const switchToCorrectNetwork = useCallback(async (): Promise<void> => {
    if (!selectedNetwork || !isConnected) return;

    try {
      setIsSwitching(true);

      if (!window.ethereum) {
        throw new Error('No Ethereum provider found');
      }

      const ethereum = window.ethereum as any;

      try {
        // Try to switch to the network
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${selectedNetwork.toString(16)}` }],
        });
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          const networkConfig = getNetworkConfig(selectedNetwork);
          if (networkConfig) {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfig],
            });
          }
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('❌ Error switching network:', error);
      throw error;
    } finally {
      setIsSwitching(false);
    }
  }, [selectedNetwork, isConnected]);

  // Get network configuration for adding new networks
  const getNetworkConfig = useCallback((chainId: number) => {
    switch (chainId) {
      case 44787: // Celo Alfajores
        return {
          chainId: `0x${chainId.toString(16)}`,
          chainName: 'Celo Alfajores',
          nativeCurrency: {
            name: 'CELO',
            symbol: 'CELO',
            decimals: 18,
          },
          rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
          blockExplorerUrls: ['https://explorer.celo.org/alfajores'],
        };
      case 1: // Ethereum Mainnet
        return {
          chainId: `0x${chainId.toString(16)}`,
          chainName: 'Ethereum Mainnet',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://mainnet.infura.io/v3/your-project-id'],
          blockExplorerUrls: ['https://etherscan.io'],
        };
      default:
        return null;
    }
  }, []);

  return {
    hasMismatch: hasMismatch,
    expectedNetwork: selectedNetwork ? getNetworkName(selectedNetwork) : '',
    currentNetwork: chainId ? getNetworkName(chainId) : '',
    isSwitching,
    switchToCorrectNetwork,
  };
};
