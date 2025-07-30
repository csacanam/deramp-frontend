import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wallet, CheckCircle, XCircle, Store, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { getBlockExplorerUrl } from '../blockchain/config/networks';
import { useInvoice } from '../hooks/useInvoice';
import { useCommerce } from '../hooks/useCommerce';
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
import { PaymentButton } from './PaymentButton';
import { useLanguage } from '../contexts/LanguageContext';
import { interpolate } from '../utils/i18n';
import { LanguageSelector } from './LanguageSelector';
import { groupTokensBySymbol } from '../utils/tokenUtils';
import { findChainIdByBackendName } from '../config/chains';
import { PaymentOption } from '../blockchain/types';

export const CheckoutPageWithPaymentButton: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { invoice, error, loading, refetch } = useInvoice(invoiceId || '');
  const { commerce, loading: commerceLoading } = useCommerce(invoice?.commerce_id || '');
  const { isConnected } = useAccount();
  const { t, language } = useLanguage();
  const [selectedToken, setSelectedToken] = useState<GroupedToken | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [forceExpired, setForceExpired] = useState(false);

  // Update document title when invoice data is available
  useEffect(() => {
    if (invoice) {
      const title = language === 'es' 
        ? `Paga con Cripto en ${invoice.commerce_name} - Voulti`
        : `Pay with Crypto at ${invoice.commerce_name} - Voulti`;
      document.title = title;
    }
  }, [invoice, language]);

  // Get selected token network info
  const selectedTokenNetwork = (() => {
    if (!selectedToken || !selectedNetwork) return null;
    return selectedToken.networks.find(n => n.network === selectedNetwork);
  })();

  // Get the required chain ID for the selected network using centralized config
  const requiredChainId = useMemo(() => {
    if (!selectedNetwork) return undefined;
    return findChainIdByBackendName(selectedNetwork);
  }, [selectedNetwork]);

  // Get token balance for the selected token
  const { balance } = useTokenBalance({
    tokenAddress: selectedTokenNetwork?.contract_address,
    tokenSymbol: selectedToken?.symbol,
    tokenDecimals: selectedTokenNetwork?.decimals,
    requiredChainId: requiredChainId,
    enabled: !!selectedTokenNetwork && isConnected,
  });

  // Check if user has sufficient balance
  const amountToPay = selectedTokenNetwork?.amount_to_pay ? Number(selectedTokenNetwork.amount_to_pay) : 0;
  const userBalance = balance ? Number(balance.formatted) : 0;
  const hasSufficientBalance = userBalance >= amountToPay;

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

  // Convert invoice tokens to PaymentOption format for the PaymentButton
  const paymentOptions: PaymentOption[] = useMemo(() => {
    if (!selectedTokenNetwork || !selectedTokenNetwork.amount_to_pay) return [];
    return [{
      token: selectedToken?.symbol || '',
      amount: selectedTokenNetwork.amount_to_pay.toString()
    }];
  }, [selectedTokenNetwork, selectedToken]);

  const handlePaymentSuccess = () => {
    // Handle successful payment
    console.log('Payment completed successfully!');
    // You could redirect to a success page or show a success message
    window.location.reload(); // Refresh to show updated status
  };

  const handlePaymentError = (error: string) => {
    // Handle payment error
    console.error('Payment error:', error);
    // You could show an error message to the user
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !invoice) {
    return <ErrorMessage message={error || t.errors.invoiceNotFound} />;
  }

  const groupedTokens = groupTokensBySymbol(invoice.tokens);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat(language === 'es' ? 'es-CO' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleTokenSelect = (token: GroupedToken) => {
    setSelectedToken(token);
    setSelectedNetwork(''); // Reset network when token changes
  };

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
  };

  const renderStatusContent = () => {
    if (effectiveStatus === 'Paid') {
      return (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">{t.payment.completed}</h2>
          <p className="text-green-300">{t.payment.completedDescription}</p>
        </div>
      );
    }

    if (effectiveStatus === 'Expired') {
      return (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">{t.payment.expired}</h2>
          <p className="text-red-300">{t.payment.expiredDescription}</p>
        </div>
      );
    }

    if (effectiveStatus === 'Refunded') {
      return (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 text-center">
          <RefreshCw className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">{t.payment.refunded}</h2>
          <p className="text-blue-300">{t.payment.refundedDescription}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Token Selection */}
        <div>
          <label className="block text-white font-medium mb-2">{t.payment.selectToken}</label>
          <TokenDropdown
            tokens={groupedTokens}
            selectedToken={selectedToken}
            onTokenSelect={handleTokenSelect}
          />
        </div>

        {/* Network Selection */}
        <div>
          <label className="block text-white font-medium mb-2">{t.payment.network}</label>
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
                    {t.payment.connectWalletDescription}
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
                          <p className="text-red-300 font-medium">{t.balance.insufficient}</p>
                          <p className="text-red-400 text-sm">
                            {interpolate(t.balance.insufficientDescription, {
                              required: amountToPay.toFixed(6),
                              current: userBalance.toFixed(6),
                              symbol: selectedToken?.symbol || ''
                            })}
                          </p>
                          <div className="mt-2">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                // TODO: Integrate with exchange or buying service
                                alert(interpolate(t.tokens.buyingSoon, { symbol: selectedToken?.symbol || '' }));
                              }}
                              className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>{interpolate(t.tokens.buy, { symbol: selectedToken?.symbol || '' })}</span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <button 
                        disabled
                        className="w-full bg-gray-600 text-gray-400 font-medium py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Wallet className="h-5 w-5" />
                        <span>{t.balance.insufficient}</span>
                      </button>
                    </div>
                  ) : (
                    // NEW: Using PaymentButton component instead of regular button
                    <PaymentButton
                      invoiceId={invoiceId || ''}
                      paymentOptions={paymentOptions}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      className="flex items-center justify-center space-x-2"
                    />
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
      <div className="max-w-md mx-auto p-4 pt-6 sm:pt-8">
        {/* Language Selector - Top Right */}
        <div className="flex justify-end mb-2">
          <LanguageSelector />
        </div>

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
                    // If image fails to load, show default icon
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Store className={`h-6 w-6 text-gray-300 ${invoice.commerce_icon_url ? 'hidden' : ''}`} />
            </div>
            <div>
              <h1 className="text-white font-medium text-lg">{invoice.commerce_name}</h1>
              {(commerce?.description_spanish || commerce?.description_english) && (
                <p className="text-gray-400 text-sm">
                  {language === 'es' 
                    ? (commerce.description_spanish || commerce.description_english)
                    : (commerce.description_english || commerce.description_spanish)
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">{t.order.title}</h2>
            <StatusBadge status={effectiveStatus || 'Pending'} />
          </div>
          
          <div className="space-y-3">
            {/* Show Order ID when invoice is paid */}
            {effectiveStatus === 'Paid' && (
              <div>
                <p className="text-gray-400 text-sm">{t.order.orderId}</p>
                <p className="text-lg font-semibold text-white">
                  {invoice.id}
                </p>
              </div>
            )}
            
            <div>
              <p className="text-gray-400 text-sm">{t.order.totalToPay}</p>
              <p className="text-2xl font-bold text-white">
                {formatAmount(invoice.amount_fiat, invoice.fiat_currency)}
              </p>
            </div>
            
            {/* Show Blockchain Transaction when invoice is paid */}
            {effectiveStatus === 'Paid' && invoice.paid_tx_hash && invoice.paid_network && (
              <div>
                <p className="text-gray-400 text-sm">{t.order.blockchainTransaction}</p>
                {getBlockExplorerUrl(invoice.paid_network, invoice.paid_tx_hash) && (
                  <a
                    href={getBlockExplorerUrl(invoice.paid_network, invoice.paid_tx_hash)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    {t.order.viewOnExplorer}
                  </a>
                )}
              </div>
            )}
            
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
            <>
              <div className="text-left mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {t.order.pageTitle}
                </h2>
                <p className="text-gray-300 text-sm">
                  {t.order.pageDescription}
                </p>
              </div>
            </>
          )}
          {renderStatusContent()}
        </div>

        {/* Powered by Voulti */}
        <div className="text-center mt-4 pb-4">
          <Link to="/" className="inline-block">
            <p className="text-gray-400 text-sm hover:text-gray-300 transition-colors">
              {t.poweredBy} <span className="font-bold text-white hover:text-blue-400 transition-colors">Voulti</span>
            </p>
          </Link>
        </div>
      </div>
      
    </div>
  );
}; 