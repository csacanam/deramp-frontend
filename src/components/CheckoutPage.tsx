import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet, CheckCircle, XCircle, Store, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
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
import { CountdownTimer } from './CountdownTimer';
import { base, polygon, celo } from 'wagmi/chains';

import { groupTokensBySymbol } from '../utils/tokenUtils';

// Map network names to chain IDs
const NETWORK_TO_CHAIN_ID: Record<string, number> = {
  'Base': base.id,
  'Polygon': polygon.id,
  'Polygon POS': polygon.id, // Backend uses "Polygon POS"
  'Celo': celo.id,
};

export const CheckoutPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { invoice, error, loading } = useInvoice(invoiceId || '');
  const { isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState<GroupedToken | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [forceExpired, setForceExpired] = useState(false);


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

  // Get the required chain ID for the selected network
  const requiredChainId = useMemo(() => {
    if (!selectedNetwork) return undefined;
    return NETWORK_TO_CHAIN_ID[selectedNetwork];
  }, [selectedNetwork]);

  // Check if invoice is expired based on expires_at field
  const isExpiredByTime = useMemo(() => {
    if (!invoice?.expires_at) return false;
    const now = new Date().getTime();
    const expiration = new Date(invoice.expires_at).getTime();
    return now > expiration || forceExpired;
  }, [invoice?.expires_at, forceExpired]);

  // Get the effective status (considering expiration time)
  const effectiveStatus = useMemo(() => {
    if (!invoice) return null;
    if (isExpiredByTime && invoice.status === 'Pending') {
      return 'Expired';
    }
    return invoice.status;
  }, [invoice?.status, isExpiredByTime]);

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
    if (effectiveStatus === 'Paid') {
      return (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">¡Pago completado!</h2>
          <p className="text-green-300">Esta orden ha sido pagada exitosamente.</p>
        </div>
      );
    }

    if (effectiveStatus === 'Expired') {
      return (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Orden expirada</h2>
          <p className="text-red-300">Esta orden ha expirado y ya no puede ser pagada.</p>
        </div>
      );
    }

    if (effectiveStatus === 'Refunded') {
      return (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 text-center">
          <RefreshCw className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Pago reembolsado</h2>
          <p className="text-blue-300">Esta orden ha sido reembolsada exitosamente.</p>
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
                      requiredChainId={requiredChainId}
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
                        <span>Saldo insuficiente</span>
                      </button>
                    </div>
                  ) : (
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Wallet className="h-5 w-5" />
                      <span>Realizar pago</span>
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
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-700">
              {invoice.commerce_icon_url ? (
                <img 
                  src={invoice.commerce_icon_url} 
                  alt={`${invoice.commerce_name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si la imagen falla al cargar, mostrar el ícono por defecto
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Store className={`h-6 w-6 text-gray-300 ${invoice.commerce_icon_url ? 'hidden' : ''}`} />
            </div>
            <div>
              <h1 className="text-white font-medium">{invoice.commerce_name}</h1>
              <p className="text-gray-400 text-sm">{invoice.id}</p>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Información de la orden</h2>
            <StatusBadge status={effectiveStatus || 'Pending'} />
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Total a pagar</p>
              <p className="text-2xl font-bold text-white">
                {formatAmount(invoice.amount_fiat, invoice.fiat_currency)}
              </p>
            </div>
            
            {effectiveStatus === 'Pending' && (
              <CountdownTimer 
                expiresAt={invoice.expires_at} 
                onExpire={() => setForceExpired(true)}
              />
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          {effectiveStatus === 'Pending' && (
            <h2 className="text-white font-semibold mb-4">Método de pago</h2>
          )}
          {renderStatusContent()}
        </div>

        {/* Powered by DeRamp */}
        <div className="text-center mt-8 pb-4">
          <p className="text-gray-400 text-sm">
            Powered by <span className="font-bold text-white">DeRamp</span>
          </p>
        </div>
      </div>
      
    </div>
  );
};