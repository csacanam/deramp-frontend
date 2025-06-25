import { useBalance, useAccount } from 'wagmi';
import { useMemo } from 'react';

interface UseTokenBalanceProps {
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  enabled?: boolean;
}

export const useTokenBalance = ({ 
  tokenAddress, 
  tokenSymbol, 
  tokenDecimals,
  enabled = true 
}: UseTokenBalanceProps) => {
  const { address: walletAddress, isConnected } = useAccount();

  const { data: balance, isLoading, error } = useBalance({
    address: walletAddress,
    token: tokenAddress as `0x${string}`,
    query: {
      enabled: enabled && isConnected && !!tokenAddress && !!walletAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
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
    isLoading: isLoading && enabled,
    error,
    hasBalance: formattedBalance ? Number(formattedBalance.formatted) > 0 : false,
    isConnected,
  };
}; 