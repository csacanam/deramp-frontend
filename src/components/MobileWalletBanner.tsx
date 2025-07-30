import React, { useState } from 'react';
import { Copy, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

export const MobileWalletBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  // Only show on mobile devices and specific routes
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isRelevantRoute = location.pathname.startsWith('/pay') || location.pathname.startsWith('/checkout');
  
  if (!isMobile || !isVisible || !isRelevantRoute) {
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
      <div className="max-w-md mx-auto">
        {/* Main content with close button */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-8">
            <p className="text-sm font-medium">
              {t.mobileWalletBanner?.message || 'For a better experience, open it in a wallet browser (e.g. MetaMask).'}
            </p>
            {/* Copy link positioned inline after the text */}
            <button
              onClick={handleCopyLink}
              className="inline-block mt-1 text-xs underline hover:no-underline transition-all"
            >
              {copyFeedback ? (t.mobileWalletBanner?.copied || 'Copied!') : (t.mobileWalletBanner?.copyLink || 'Copy link')}
            </button>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}; 