import React from 'react';
import { Wallet, AlertCircle, RefreshCw, CheckCircle, XCircle, Network } from 'lucide-react';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { useSwitchChain } from 'wagmi';
import { base, polygon, celo } from 'wagmi/chains';

interface TokenBalanceProps {
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  requiredChainId?: number; // Add required chain ID
  requiredAmount?: number; // Optional: to check if balance is sufficient
  className?: string;
}

// Map chain IDs to readable names
const CHAIN_ID_TO_NAME: Record<number, string> = {
  [base.id]: 'Base',
  [polygon.id]: 'Polygon',
  [celo.id]: 'Celo',
};

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  requiredChainId,
  requiredAmount,
  className = '',
}) => {
  const { balance, isLoading, error, hasBalance, isConnected, isWrongNetwork, currentChainId } = useTokenBalance({
    tokenAddress,
    tokenSymbol,
    tokenDecimals,
    requiredChainId,
  });

  const { switchChain, isPending: isSwitching } = useSwitchChain();

  if (!isConnected) {
    return null;
  }

  // Handle wrong network case
  if (isWrongNetwork && requiredChainId) {
    const currentNetworkName = CHAIN_ID_TO_NAME[currentChainId || 0] || 'Desconocida';
    const requiredNetworkName = CHAIN_ID_TO_NAME[requiredChainId] || 'Desconocida';
    
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center space-x-2 text-orange-400 text-sm">
          <Network className="h-4 w-4" />
          <span>Red incorrecta</span>
        </div>
        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-3">
          <p className="text-orange-300 text-sm mb-2">
            Estás conectado a <strong>{currentNetworkName}</strong> pero este token requiere <strong>{requiredNetworkName}</strong>
          </p>
          <button
            onClick={() => switchChain({ chainId: requiredChainId })}
            disabled={isSwitching}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isSwitching ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Cambiando red...</span>
              </>
            ) : (
              <>
                <Network className="h-4 w-4" />
                <span>Cambiar a {requiredNetworkName}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-400 text-sm ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span>Error al cargar balance</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 text-gray-400 text-sm animate-pulse ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Cargando balance...</span>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className={`flex items-center space-x-2 text-gray-400 text-sm ${className}`}>
        <Wallet className="h-4 w-4" />
        <span>Balance no disponible</span>
      </div>
    );
  }

  const balanceNumber = Number(balance.formatted);
  const isLowBalance = balanceNumber < 1; // Less than 1 token
  const hasSufficientBalance = requiredAmount ? balanceNumber >= requiredAmount : true;
  
  // Format balance to show fewer decimals for display
  const formatBalance = (value: string) => {
    const num = Number(value);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    return num.toFixed(2);
  };

  const getBalanceColor = () => {
    if (!hasBalance) return 'text-red-400';
    if (requiredAmount && !hasSufficientBalance) return 'text-orange-400';
    if (isLowBalance) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getBalanceIcon = () => {
    if (!hasBalance) return <XCircle className="h-4 w-4 text-red-400" />;
    if (requiredAmount && !hasSufficientBalance) return <AlertCircle className="h-4 w-4 text-orange-400" />;
    if (hasBalance) return <CheckCircle className="h-4 w-4 text-green-400" />;
    return <Wallet className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {getBalanceIcon()}
      <span className="text-gray-300">Balance:</span>
      <span className={`font-medium ${getBalanceColor()}`}>
        {formatBalance(balance.formatted)} {balance.symbol}
      </span>
      {!hasBalance && (
        <span className="text-red-400 text-xs">(Sin fondos)</span>
      )}
      {requiredAmount && hasBalance && !hasSufficientBalance && (
        <span className="text-orange-400 text-xs">(Insuficiente)</span>
      )}
    </div>
  );
}; 