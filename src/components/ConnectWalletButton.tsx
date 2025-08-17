import React, { useEffect, useState } from 'react';
import { useConnect } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';
import { Wallet } from 'lucide-react';
import { WalletConnectionModal } from './WalletConnectionModal';
import { useWalletState } from '../hooks/useWalletState';

interface ConnectWalletButtonProps {
  selectedNetwork?: string;
  onConnected?: () => void;
  className?: string;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ 
  onConnected,
  className = ''
}) => {
  const { isConnected, address, chainId, walletType, lastUpdate } = useWalletState();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Detect wallet type and context (desktop vs mobile)
  const detectWalletContext = (): 'metamask-desktop' | 'metamask-mobile' | 'coinbase-desktop' | 'coinbase-mobile' | 'rainbow' | 'none' => {
    if (!window.ethereum) {
      // Check if we're in MetaMask mobile (no window.ethereum)
      if (navigator.userAgent.includes('MetaMask')) {
        return 'metamask-mobile';
      }
      
      // Check if we're in Coinbase Wallet mobile
      if (navigator.userAgent.includes('CoinbaseWallet')) {
        return 'coinbase-mobile';
      }
      
      // Check if we're in a WebView (mobile wallet context)
      if (navigator.userAgent.includes('WebView')) {
        return 'metamask-mobile'; // Likely MetaMask mobile
      }
      
      return 'none';
    }
    
    // Desktop wallet detection
    if ((window.ethereum as any).isMetaMask) {
      return 'metamask-desktop';
    }
    if ((window.ethereum as any).isCoinbaseWallet) {
      return 'coinbase-desktop';
    }
    if ((window.ethereum as any).isRainbow) {
      return 'rainbow';
    }
    
    return 'none';
  };

  // Attempt direct connection to detected wallet
  const attemptDirectConnection = async (): Promise<boolean> => {
    const walletContext = detectWalletContext();
    
    console.log('🔍 Detected wallet context:', walletContext);
    
    if (walletContext === 'none') {
      console.log('🔍 No wallet detected, will show modal');
      return false;
    }

    // For mobile wallets, we need to handle differently
    if (walletContext === 'metamask-mobile' || walletContext === 'coinbase-mobile') {
      console.log(`📱 Attempting connection in ${walletContext} context...`);
      
      // In mobile context, try to use the mobile wallet's connection method
      try {
        // Some mobile wallets support this method
        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          
          if (accounts && accounts.length > 0) {
            console.log(`✅ Successfully connected in ${walletContext}:`, accounts[0]);
            return true;
          }
        } else {
          // No window.ethereum in mobile context, try alternative approach
          console.log('📱 No window.ethereum in mobile context, trying alternative...');
          
          // For mobile wallets, we might need to trigger a connection event
          // This is a fallback for when direct connection isn't possible
          console.log('📱 Mobile wallet detected but direct connection not available');
          return false;
        }
      } catch (error: any) {
        console.log(`❌ Mobile connection failed for ${walletContext}:`, error);
        return false;
      }
    }

    // Desktop wallet connection
    console.log(`🦊 Attempting desktop connection to ${walletContext}...`);
    
    try {
      if (!window.ethereum) {
        console.log('❌ Window.ethereum not available');
        return false;
      }
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts && accounts.length > 0) {
        console.log(`✅ Successfully connected to ${walletContext}:`, accounts[0]);
        return true;
      } else {
        console.log(`❌ No accounts returned from ${walletContext}`);
        return false;
      }
    } catch (error: any) {
      if (error.code === 4001) {
        console.log(`⏳ User rejected connection to ${walletContext}`);
      } else {
        console.error(`❌ Error connecting to ${walletContext}:`, error);
      }
      return false;
    }
  };

  // Handle connect wallet button click
  const handleConnectWallet = async () => {
    console.log('🔗 Connect wallet button clicked');
    
    // 1. Try direct connection first
    const connected = await attemptDirectConnection();
    
    if (connected) {
      console.log('✅ Direct connection successful, no need for modal');
      // The wallet state should update automatically via useWalletState
      return;
    }
    
    // 2. If direct connection failed, open modal
    console.log('⏳ Direct connection failed, opening wallet selection modal');
    setIsModalOpen(true);
  };
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 ConnectWalletButton Debug (Centralized State):');
    console.log('  - Is Connected:', isConnected);
    console.log('  - Address:', address);
    console.log('  - Chain ID:', chainId);
    console.log('  - Wallet Type:', walletType);
    console.log('  - Last Update:', lastUpdate);
    console.log('  - Detected Wallet:', detectWalletContext());
    console.log('  - Timestamp:', new Date().toISOString());
  }, [isConnected, address, chainId, walletType, lastUpdate]);

  // Call onConnected callback when wallet connects
  useEffect(() => {
    if (isConnected && onConnected) {
      console.log('✅ Wallet connected, calling onConnected callback');
      onConnected();
    }
  }, [isConnected, onConnected]);

  // If connected, show wallet info button
  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`
            w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl
            ${className}
          `}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-base">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet'}</span>
        </button>

        <WalletConnectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConnected={onConnected}
        />
      </div>
    );
  }

  // If not connected, show connect button
  return (
    <div className="relative">
      <button
        onClick={handleConnectWallet}
        className={`
          w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl
          ${className}
        `}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-base">{t.wallet?.connect || 'Conectar Wallet'}</span>
      </button>

      <WalletConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnected={onConnected}
      />
    </div>
  );
}; 