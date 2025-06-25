import React from 'react';
import { Calculator, Clock } from 'lucide-react';

interface PaymentAmountProps {
  amountToPay?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  rateToUsd?: number;
  updatedAt?: string;
  amountFiat: number;
  fiatCurrency: string;
}

export const PaymentAmount: React.FC<PaymentAmountProps> = ({
  amountToPay,
  tokenSymbol,
  tokenDecimals,
  rateToUsd,
  updatedAt,
  amountFiat,
  fiatCurrency,
}) => {
  if (!amountToPay || !tokenSymbol) {
    return null;
  }

  // Format the amount to pay with appropriate decimals
  const formatAmount = (amount: string, decimals: number = 6) => {
    const num = Number(amount);
    if (num === 0) return '0';
    
    // For very large numbers (like cCOP), show fewer decimals
    if (num > 1000) return num.toFixed(2);
    // For normal amounts, show appropriate decimals
    if (num > 1) return num.toFixed(Math.min(4, decimals));
    // For small amounts, show more decimals
    return num.toFixed(Math.min(8, decimals));
  };

  // Format the rate
  const formatRate = (rate: number) => {
    if (rate >= 1) return rate.toFixed(4);
    if (rate >= 0.01) return rate.toFixed(6);
    return rate.toFixed(8);
  };

  // Format updated time to show actual date/time
  const formatUpdatedTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('es-CO', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const formatFiatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' ' + currency;
  };

  return (
    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Calculator className="h-5 w-5 text-blue-400" />
        <h3 className="text-blue-300 font-medium">Monto a pagar</h3>
      </div>
      
      <div className="space-y-3">
        {/* Main amount */}
        <div>
          <div className="text-2xl font-bold text-white">
            {formatAmount(amountToPay, tokenDecimals)} {tokenSymbol}
          </div>
          <div className="text-gray-400 text-sm">
            ≈ {formatFiatAmount(amountFiat, fiatCurrency)}
          </div>
        </div>

        {/* Rate info */}
        {rateToUsd && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Precio {tokenSymbol}:</span>
            <span className="text-gray-300">${formatRate(rateToUsd)} USD</span>
          </div>
        )}

        {/* Last updated */}
        {updatedAt && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Última actualización: {formatUpdatedTime(updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}; 