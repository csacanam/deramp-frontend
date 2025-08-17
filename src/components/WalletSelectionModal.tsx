import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleWalletSelect = (walletType: 'metamask' | 'base') => {
    const currentUrl = window.location.href;
    
    if (walletType === 'metamask') {
      // MetaMask deep link
      const metamaskUrl = `https://metamask.app.link/dapp/${encodeURIComponent(currentUrl)}`;
      window.open(metamaskUrl, '_blank');
    } else if (walletType === 'base') {
      // Base Wallet deep link
      const baseUrl = `cbwallet://dapp/${encodeURIComponent(currentUrl)}`;
      window.location.href = baseUrl;
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          {t.wallet?.selectWallet || 'Select Wallet'}
        </h2>

        {/* Wallet options */}
        <div className="space-y-4">
          {/* MetaMask */}
          <button
            onClick={() => handleWalletSelect('metamask')}
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🦊</span>
            </div>
            <span className="text-gray-900 font-medium">MetaMask</span>
          </button>

          {/* Base Wallet */}
          <button
            onClick={() => handleWalletSelect('base')}
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🪙</span>
            </div>
            <span className="text-gray-900 font-medium">Base Wallet</span>
          </button>
        </div>

        {/* Info text */}
        <p className="text-sm text-gray-500 mt-6 text-center">
          {t.wallet?.selectWalletDescription || 'Choose your wallet to continue'}
        </p>
      </div>
    </div>
  );
};
