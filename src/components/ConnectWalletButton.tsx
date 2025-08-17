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
  
  // Detect wallet type
  const detectWalletType = (): 'metamask' | 'coinbase' | 'rainbow' | 'none' => {
    if (!window.ethereum) return 'none';
    
    if ((window.ethereum as any).isMetaMask) return 'metamask';
    if ((window.ethereum as any).isCoinbaseWallet) return 'coinbase';
    if ((window.ethereum as any).isRainbow) return 'rainbow';
    
    return 'none';
  };

  // Attempt direct connection to detected wallet
  const attemptDirectConnection = async (): Promise<boolean> => {
    const detectedWallet = detectWalletType();
    
    if (detectedWallet === 'none') {
      console.log('🔍 No wallet detected, will show modal');
      return false;
    }

    console.log(`🦊 Attempting direct connection to ${detectedWallet}...`);
    
    try {
      if (!window.ethereum) {
        console.log('❌ Window.ethereum not available');
        return false;
      }
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts && accounts.length > 0) {
        console.log(`✅ Successfully connected to ${detectedWallet}:`, accounts[0]);
        return true; // Connected successfully
      } else {
        console.log(`❌ No accounts returned from ${detectedWallet}`);
        return false;
      }
    } catch (error: any) {
      if (error.code === 4001) {
        console.log(`⏳ User rejected connection to ${detectedWallet}`);
      } else {
        console.error(`❌ Error connecting to ${detectedWallet}:`, error);
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
    console.log('  - Detected Wallet:', detectWalletType());
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