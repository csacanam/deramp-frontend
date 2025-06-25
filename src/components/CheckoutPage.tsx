import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet, CheckCircle, XCircle, Store, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useInvoice } from '../hooks/useInvoice';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { GroupedToken } from '../types/invoice';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { TokenDropdown } from './TokenDropdown';
import { NetworkDropdown } from './NetworkDropdown';
import { StatusBadge } from './StatusBadge';
import { ConnectWalletButton } from './ConnectWalletButton';
import { TokenBalance } from './TokenBalance';
import { PaymentAmount } from './PaymentAmount';

import { groupTokensBySymbol } from '../utils/tokenUtils';

export const CheckoutPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { invoice, error, loading } = useInvoice(invoiceId || '');
  const { isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState<GroupedToken | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');


  // Get selected token network info
  const selectedTokenNetwork = (() => {
    if (!selectedToken || !selectedNetwork) return null;
    return selectedToken.networks.find(n => n.network === selectedNetwork);
  })();

  // Get token balance for the selected token
  const { balance } = useTokenBalance({
    tokenAddress: selectedTokenNetwork?.contract_address,
    tokenSymbol: selectedToken?.symbol,
    tokenDecimals: selectedTokenNetwork?.decimals,
    enabled: !!selectedTokenNetwork && isConnected,
  });

  // Check if user has sufficient balance
  const amountToPay = selectedTokenNetwork?.amount_to_pay ? Number(selectedTokenNetwork.amount_to_pay) : 0;
  const userBalance = balance ? Number(balance.formatted) : 0;
  const hasSufficientBalance = userBalance >= amountToPay;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !invoice) {
    return <ErrorMessage message={error || 'Esta orden no existe o ha sido eliminada.'} />;
  }

  const groupedTokens = groupTokensBySymbol(invoice.tokens);

  // Get available networks from invoice tokens
  const availableNetworks = [...new Set(invoice.tokens.map(token => token.network))];

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' ' + currency;
  };

  const handleTokenSelect = (token: GroupedToken) => {
    setSelectedToken(token);
    // Reset network selection when token changes
    setSelectedNetwork('');
  };

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
  };

  const renderStatusContent = () => {
    if (invoice.status === 'paid') {
      return (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">¡Pago completado!</h2>
          <p className="text-green-300">Esta orden ha sido pagada exitosamente.</p>
        </div>
      );
    }

    if (invoice.status === 'expired') {
      return (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Orden expirada</h2>
          <p className="text-red-300">Esta orden ha expirado y ya no puede ser pagada.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Token Selection */}
        <div>
          <label className="block text-white font-medium mb-2">Seleccionar token</label>
          <TokenDropdown
            tokens={groupedTokens}
            selectedToken={selectedToken}
            onTokenSelect={handleTokenSelect}
          />
        </div>

        {/* Network Selection */}
        <div>
          <label className="block text-white font-medium mb-2">Red</label>
          <NetworkDropdown
            networks={selectedToken?.networks.map(n => n.network) || []}
            selectedNetwork={selectedNetwork}
            onNetworkSelect={handleNetworkSelect}
            disabled={!selectedToken}
          />
        </div>

        {/* Payment Information */}
        {selectedTokenNetwork && (
          <div className="space-y-4">
            {/* Payment Amount */}
            <PaymentAmount
              amountToPay={selectedTokenNetwork.amount_to_pay}
              tokenSymbol={selectedToken?.symbol}
              tokenDecimals={selectedTokenNetwork.decimals}
              rateToUsd={selectedTokenNetwork.rate_to_usd}
              updatedAt={selectedTokenNetwork.updated_at}
              amountFiat={invoice.amount_fiat}
              fiatCurrency={invoice.fiat_currency}
            />

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              {!isConnected ? (
                <>
                  <p className="text-gray-300 text-sm mb-3">
                    Conecta tu wallet para continuar con el pago
                  </p>
                  <div className="w-full">
                    <ConnectWalletButton 
                      selectedNetwork={selectedNetwork}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <TokenBalance
                      tokenAddress={selectedTokenNetwork.contract_address}
                      tokenSymbol={selectedToken?.symbol}
                      tokenDecimals={selectedTokenNetwork.decimals}
                    />
                  </div>
                  {/* Payment button with balance validation */}
                  {!hasSufficientBalance && amountToPay > 0 ? (
                    <div className="space-y-3">
                      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-red-300 font-medium">Saldo insuficiente</p>
                          <p className="text-red-400 text-sm">
                            Necesitas {amountToPay.toFixed(6)} {selectedToken?.symbol} pero solo tienes {userBalance.toFixed(6)} {selectedToken?.symbol}
                          </p>
                          <div className="mt-2">
                            <a
                              href="#"
                                                              onClick={(e) => {
                                  e.preventDefault();
                                  // TODO: Integrate with exchange or buying service
                                  alert(`Función para comprar ${selectedToken?.symbol} próximamente`);
                                }}
                              className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Comprar {selectedToken?.symbol}</span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <button 
                        disabled
                        className="w-full bg-gray-600 text-gray-400 font-medium py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Wallet className="h-5 w-5" />
                        <span>Saldo Insuficiente</span>
                      </button>
                    </div>
                  ) : (
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Wallet className="h-5 w-5" />
                      <span>Realizar Pago</span>
                    </button>
                  )}
                  <div className="mt-3 text-center">
                    <ConnectWalletButton 
                      selectedNetwork={selectedNetwork}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gray-700 p-2 rounded-lg">
              <Store className="h-6 w-6 text-gray-300" />
            </div>
            <div>
              <h1 className="text-white font-medium">{invoice.commerce_name}</h1>
              <p className="text-gray-400 text-sm">{invoice.commerce_id}</p>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Información de la orden</h2>
            <StatusBadge status={invoice.status} />
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Total a pagar</p>
              <p className="text-2xl font-bold text-white">
                {formatAmount(invoice.amount_fiat, invoice.fiat_currency)}
              </p>
            </div>
            
            {invoice.status === 'pending' && (
              <div>
                <p className="text-gray-400 text-sm">Tiempo restante</p>
                <p className="text-orange-300">Esta orden expira en 1 hora</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-white font-semibold mb-4">Método de pago</h2>
          {renderStatusContent()}
        </div>
      </div>
      
    </div>
  );
};