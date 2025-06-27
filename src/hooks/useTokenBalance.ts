import { useBalance, useAccount, useChainId } from 'wagmi';
import { useMemo } from 'react';
import { base, polygon, celo } from 'wagmi/chains';

interface UseTokenBalanceProps {
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  requiredChainId?: number;
  enabled?: boolean;
}

// Map network names to chain IDs
const NETWORK_TO_CHAIN_ID: Record<string, number> = {
  'Base': base.id,
  'Polygon': polygon.id,
  'Polygon POS': polygon.id,
  'Celo': celo.id,
};

export const useTokenBalance = ({ 
  tokenAddress, 
  tokenSymbol, 
  tokenDecimals,
  requiredChainId,
  enabled = true 
}: UseTokenBalanceProps) => {
  const { address: walletAddress, isConnected } = useAccount();
  const currentChainId = useChainId();

  // Check if we're on the wrong network
  const isWrongNetwork = useMemo(() => {
    if (!isConnected || !requiredChainId) return false;
    return currentChainId !== requiredChainId;
  }, [isConnected, currentChainId, requiredChainId]);

  const { data: balance, isLoading, error } = useBalance({
    address: walletAddress,
    token: tokenAddress as `0x${string}`,
    query: {
      enabled: enabled && isConnected && !!tokenAddress && !!walletAddress && !isWrongNetwork,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: (failureCount, error) => {
        // Don't retry if we're on wrong network
        if (isWrongNetwork) return false;
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
    },
  });

  const formattedBalance = useMemo(() => {
    if (!balance) return null;

    return {
      value: balance.value,
      formatted: balance.formatted,
      symbol: tokenSymbol || balance.symbol,
      decimals: tokenDecimals || balance.decimals,
    };
  }, [balance, tokenSymbol, tokenDecimals]);

  return {
    balance: formattedBalance,
    isLoading: isLoading && enabled && !isWrongNetwork,
    error: isWrongNetwork ? null : error,
    hasBalance: formattedBalance ? Number(formattedBalance.formatted) > 0 : false,
    isConnected,
    isWrongNetwork,
    currentChainId,
    requiredChainId,
  };
}; 