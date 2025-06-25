import React from 'react';
import { Wallet, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useTokenBalance } from '../hooks/useTokenBalance';

interface TokenBalanceProps {
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  requiredAmount?: number; // Optional: to check if balance is sufficient
  className?: string;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  requiredAmount,
  className = '',
}) => {
  const { balance, isLoading, error, hasBalance, isConnected } = useTokenBalance({
    tokenAddress,
    tokenSymbol,
    tokenDecimals,
  });

  if (!isConnected) {
    return null;
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