import React, { useState, createContext, useContext, useEffect } from 'react';
import { Copy, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

// Context to share banner visibility state
export const BannerContext = createContext<{ isBannerVisible: boolean; setIsBannerVisible: (visible: boolean) => void }>({ 
  isBannerVisible: false, 
  setIsBannerVisible: () => {} 
});

export const useBannerContext = () => useContext(BannerContext);

export const MobileWalletBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  const { setIsBannerVisible } = useBannerContext();

  // Only show on mobile devices and specific routes
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isRelevantRoute = location.pathname.startsWith('/pay') || location.pathname.startsWith('/checkout');
  const isBannerVisible = isMobile && isVisible && isRelevantRoute;
  
  // Update context when banner visibility changes
  useEffect(() => {
    setIsBannerVisible(isBannerVisible);
  }, [isBannerVisible, setIsBannerVisible]);
  
  if (!isBannerVisible) {
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-8">
            <p className="text-sm leading-tight font-medium">
              {t.mobileWalletBanner?.message || 'For a better experience, open it in a wallet browser (e.g. MetaMask).'}{' '}
              <button
                onClick={handleCopyLink}
                className="inline underline hover:no-underline transition-all"
              >
                {copyFeedback ? (t.mobileWalletBanner?.copied || 'Copied!') : (t.mobileWalletBanner?.copyLink || 'Copy link')}
              </button>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}; 