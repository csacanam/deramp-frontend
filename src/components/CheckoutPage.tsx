import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ConnectWalletButton } from './ConnectWalletButton';
import { LanguageSelector } from './LanguageSelector';
import { WalletSelectionModal } from './WalletSelectionModal';

export const CheckoutPage: React.FC = () => {
  const { t } = useLanguage();
  const [isWalletSelectionModalOpen, setIsWalletSelectionModalOpen] = useState(false);
  const [isInWalletApp, setIsInWalletApp] = useState(false);

  // Detect if we're in a wallet app or regular browser
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isWallet = userAgent.includes('MetaMask') || 
                     userAgent.includes('Coinbase') || 
                     userAgent.includes('Base') ||
                     userAgent.includes('Trust') ||
                     userAgent.includes('Phantom') ||
                     userAgent.includes('Rainbow');
    
    setIsInWalletApp(isWallet);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Language Selector - Top Right */}
        <div className="flex justify-end mb-2">
          <LanguageSelector />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.payment?.makePayment || 'Checkout'}
          </h1>
          <p className="text-gray-600">
            {t.payment?.connectWalletDescription || 'Complete your payment'}
          </p>
        </div>

        {/* Wallet Connection Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t.wallet?.connectFirst || 'Connect your wallet first'}
            </h3>
            <p className="text-gray-600 mb-6">
              {t.wallet?.connectDescription || 'Choose how to connect your wallet'}
            </p>
            
            {isInWalletApp ? (
              // In wallet app - use normal connect button
              <ConnectWalletButton />
            ) : (
              // In regular browser - show wallet selection modal
              <button
                onClick={() => setIsWalletSelectionModalOpen(true)}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.payment?.connectWallet || 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Wallet Selection Modal */}
        <WalletSelectionModal
          isOpen={isWalletSelectionModalOpen}
          onClose={() => setIsWalletSelectionModalOpen(false)}
        />
      </div>
    </div>
  );
};