import React, { useState, useEffect, useMemo } from 'react';
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
import { StatusBadge } from './StatusBadge';
import { ConnectWalletButton } from './ConnectWalletButton';
import { TokenBalance } from './TokenBalance';
import { PaymentAmount } from './PaymentAmount';
import { CountdownTimer } from './CountdownTimer';
import { PaymentButton } from './PaymentButton';
import { WalletConnectionFlow } from './WalletConnectionFlow';
import { useLanguage } from '../contexts/LanguageContext';
import { interpolate } from '../utils/i18n';
import { LanguageSelector } from './LanguageSelector';
import { groupTokensBySymbol } from '../utils/tokenUtils';
import { findChainIdByBackendName } from '../config/chains';
import { PaymentOption } from '../blockchain/types';

export const CheckoutPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { invoice, error, loading, refetch } = useInvoice(invoiceId || '');
  const { commerce, loading: commerceLoading } = useCommerce(invoice?.commerce_id || '');
  const { isConnected, chainId: connectedChainId } = useAccount();
  const { t, language } = useLanguage();
  const [selectedToken, setSelectedToken] = useState<GroupedToken | null>(null);
  const [forceExpired, setForceExpired] = useState(false);

  // Auto-connect MetaMask when checkout loads
  useEffect(() => {
    // TEMPORARILY DISABLED TO DEBUG REFRESH ISSUE
    /*
    const autoConnectMetaMask = async () => {
      // Only attempt if not already connected and MetaMask is available
      if (!isConnected && window.ethereum && (window.ethereum as any)?.isMetaMask) {
        console.log('🦊 Checkout: Attempting automatic MetaMask connection...');
        
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          
          if (accounts && accounts.length > 0) {
            console.log('✅ Checkout: MetaMask connected automatically:', accounts[0]);
          } else {
            console.log('⏳ Checkout: User must connect manually');
          }
        } catch (error: any) {
          if (error.code === 4001) {
            console.log('⏳ Checkout: User rejected MetaMask connection');
          } else {
            console.error('❌ Checkout: MetaMask connection error:', error);
          }
        }
      }
    };

    // Small delay to ensure page is fully loaded
    const timer = setTimeout(autoConnectMetaMask, 500);
    
    return () => clearTimeout(timer);
    */
    console.log('🔍 Auto-connect temporarily disabled for debugging');
  }, [isConnected]);

  // Wallet/Browser Detection Debug Component
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const detectWalletAndBrowser = () => {
      const ethereum = window.ethereum as any;
      let walletInfo = '';
      
      // Essential detection: Wallet vs Browser
      if (ethereum) {
        // Wallet detection - only show the main wallet type
        if (ethereum.isMetaMask) {
          walletInfo += '🦊 MetaMask Wallet\n';
        } else if (ethereum.isCoinbaseWallet || ethereum.isBaseWallet) {
          walletInfo += '🪙 Base Wallet\n';
        } else if (ethereum.isTrust) {
          walletInfo += '🛡️ Trust Wallet\n';
        } else if (ethereum.isPhantom) {
          walletInfo += '👻 Phantom Wallet\n';
        } else if (ethereum.isRainbow) {
          walletInfo += '🌈 Rainbow Wallet\n';
        } else {
          walletInfo += '❓ Unknown Wallet\n';
        }
        
        // Essential wallet info
        if (ethereum.selectedAddress) {
          walletInfo += `📍 Address: ${ethereum.selectedAddress.slice(0, 6)}...${ethereum.selectedAddress.slice(-4)}\n`;
        }
        if (ethereum.chainId) {
          walletInfo += `⛓️ Chain: ${ethereum.chainId}\n`;
        }
      } else {
        // No wallet detected - check if we're in a wallet's in-app browser
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('MetaMask')) {
          walletInfo += '🦊 MetaMask In-App Browser\n';
        } else if (userAgent.includes('Coinbase') || userAgent.includes('Base')) {
          walletInfo += '🪙 Base Wallet In-App Browser\n';
        } else if (userAgent.includes('Trust')) {
          walletInfo += '🛡️ Trust Wallet In-App Browser\n';
        } else if (userAgent.includes('Phantom')) {
          walletInfo += '👻 Phantom Wallet In-App Browser\n';
        } else if (userAgent.includes('Rainbow')) {
          walletInfo += '🌈 Rainbow Wallet In-App Browser\n';
        } else if (userAgent.includes('Chrome')) {
          walletInfo += '🌐 Chrome Mobile\n';
        } else if (userAgent.includes('Safari')) {
          walletInfo += '🌐 Safari Mobile\n';
        } else if (userAgent.includes('Firefox')) {
          walletInfo += '🌐 Firefox Mobile\n';
        } else {
          walletInfo += '🌐 Mobile Browser (Unknown)\n';
        }
      }
      
      // Device type detection
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Mobile')) {
        walletInfo += '📱 Mobile Device\n';
      } else if (userAgent.includes('Tablet')) {
        walletInfo += '📱 Tablet Device\n';
      } else {
        walletInfo += '💻 Desktop Device\n';
      }
      
      // Platform detection
      if (userAgent.includes('Android')) {
        walletInfo += '🤖 Android\n';
      } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        walletInfo += '🍎 iOS\n';
      } else if (userAgent.includes('Windows')) {
        walletInfo += '🪟 Windows\n';
      } else if (userAgent.includes('Mac')) {
        walletInfo += '🍎 macOS\n';
      } else if (userAgent.includes('Linux')) {
        walletInfo += '🐧 Linux\n';
      }
      
      // Additional mobile-specific detection
      if (userAgent.includes('Mobile')) {
        // Check for in-app browser indicators
        if (userAgent.includes('wv')) {
          walletInfo += '🔍 Android WebView\n';
        }
        if (userAgent.includes('FBAN') || userAgent.includes('FBAV')) {
          walletInfo += '📱 Facebook In-App\n';
        }
        if (userAgent.includes('Instagram')) {
          walletInfo += '📸 Instagram In-App\n';
        }
        if (userAgent.includes('Twitter') || userAgent.includes('Tweetbot')) {
          walletInfo += '🐦 Twitter In-App\n';
        }
        if (userAgent.includes('WhatsApp')) {
          walletInfo += '💬 WhatsApp In-App\n';
        }
        if (userAgent.includes('Telegram')) {
          walletInfo += '📬 Telegram In-App\n';
        }
      }
      
      setDebugInfo(walletInfo);
      console.log('🔍 Wallet Detection Info:', walletInfo);
    };

    // Try to detect wallet multiple times with increasing delays
    const delays = [1000, 2000, 3000, 5000];
    delays.forEach((delay, index) => {
      setTimeout(() => {
        console.log(`🔄 Attempt ${index + 1} to detect wallet (${delay}ms delay)`);
        detectWalletAndBrowser();
      }, delay);
    });

    return () => {
      delays.forEach((delay) => {
        clearTimeout(delay);
      });
    };
  }, []);

  // Update document title when invoice data is available
  useEffect(() => {
    if (invoice) {
      const title = language === 'es' 
        ? `Paga con Cripto en ${invoice.commerce_name} - Voulti`
        : `Pay with Crypto at ${invoice.commerce_name} - Voulti`;
      document.title = title;
    }
  }, [invoice, language]);

  // Get selected token network info based on connected chain
  const selectedTokenNetwork = useMemo(() => {
    if (!selectedToken || !connectedChainId) {
      return null;
    }
    
    // Use the chain_id directly from the token networks instead of recalculating
    const foundNetwork = selectedToken.networks.find(n => n.chain_id === connectedChainId);
    
    return foundNetwork;
  }, [selectedToken, connectedChainId]);

  // Get the required chain ID from connected wallet
  const requiredChainId = useMemo(() => {
    return connectedChainId;
  }, [connectedChainId]);

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
    alert(`${t.general.error}: ${error}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !invoice) {
    return <ErrorMessage message={error || t.errors.invoiceNotFound} />;
  }

  const groupedTokens = groupTokensBySymbol(invoice.tokens);

  // Get available networks from invoice tokens (commented out as not currently used)
  // const availableNetworks = [...new Set(invoice.tokens.map(token => token.network))];

  const formatAmount = (amount: number, currency: string) => {
    const locale = language === 'es' ? 'es-CO' : 'en-US';
    const formattedNumber = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    // Format like "COP $ 50,000" to be consistent with pay page
    return `${currency} $ ${formattedNumber}`;
  };

  const handleTokenSelect = (token: GroupedToken) => {
    setSelectedToken(token);
    // No need to set selectedNetwork anymore since we use the connected chain directly
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
      <WalletConnectionFlow expectedNetwork="alfajores">
        <div className="space-y-6">
          {/* Token Selection */}
          <div>
            <label className="block text-white font-medium mb-2">{t.payment.selectToken}</label>
            <TokenDropdown
              tokens={groupedTokens}
              selectedToken={selectedToken}
              onTokenSelect={handleTokenSelect}
              currentChainId={requiredChainId}
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
                  <PaymentButton
                    invoiceId={invoiceId || ''}
                    paymentOptions={paymentOptions}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    disabled={!hasSufficientBalance || amountToPay <= 0}
                    hasSufficientBalance={hasSufficientBalance}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </WalletConnectionFlow>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t.payment?.makePayment || 'Checkout'}
            </h1>
            <p className="text-gray-600">
              {t.payment?.connectWalletDescription || 'Complete your payment'}
            </p>
          </div>

                  {/* Debug Info Panel */}
          {debugInfo && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🔍 Environment Detection
              </h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                {debugInfo}
              </pre>
              <div className="mt-3 text-xs text-gray-500">
                Shows if you're in a wallet app or regular browser, plus device details.
              </div>
            </div>
          )}

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
                <p className="text-sm font-semibold text-white">
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