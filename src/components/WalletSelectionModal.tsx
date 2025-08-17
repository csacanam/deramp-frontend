import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MetaMaskLogo, BaseLogo } from '../assets/walletLogos';

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
      // MetaMask deep link - solo codificar la URL sin el protocolo
      const cleanUrl = currentUrl.replace(/^https?:\/\//, '');
      const metamaskUrl = `https://metamask.app.link/dapp/${cleanUrl}`;
      window.open(metamaskUrl, '_blank');
    } else if (walletType === 'base') {
      // Base Wallet deep link - usar el formato correcto cbwallet://
      const baseUrl = `cbwallet://dapp?url=${encodeURIComponent(currentUrl)}`;
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-left">
          {t.wallet?.selectWallet || 'Select Wallet'}
        </h2>

        {/* Wallet options */}
        <div className="space-y-4">
          {/* MetaMask */}
          <button
            onClick={() => handleWalletSelect('metamask')}
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center space-x-3"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <MetaMaskLogo size={32} />
            </div>
            <span className="text-gray-900 font-medium">Metamask</span>
          </button>

          {/* Base Wallet */}
          <button
            onClick={() => handleWalletSelect('base')}
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center space-x-3"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <BaseLogo size={40} />
            </div>
            <span className="text-gray-900 font-medium">Base</span>
          </button>
        </div>
      </div>
    </div>
  );
};
