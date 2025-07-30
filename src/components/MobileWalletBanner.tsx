import React, { useState } from 'react';
import { Copy, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MobileWalletBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { t } = useLanguage();

  // Only show on mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile || !isVisible) {
    return null;
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex-1">
          <p className="text-sm font-medium">
            {t.mobileWalletBanner?.message || 'For a better experience, open it in a wallet browser (e.g. MetaMask).'}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-700 hover:bg-blue-800 rounded text-xs font-medium transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>{copyFeedback ? (t.mobileWalletBanner?.copied || 'Copied!') : (t.mobileWalletBanner?.copyLink || 'Copy link')}</span>
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}; 