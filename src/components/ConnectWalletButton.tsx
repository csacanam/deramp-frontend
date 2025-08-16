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
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 ConnectWalletButton Debug (Centralized State):');
    console.log('  - Is Connected:', isConnected);
    console.log('  - Address:', address);
    console.log('  - Chain ID:', chainId);
    console.log('  - Wallet Type:', walletType);
    console.log('  - Last Update:', lastUpdate);
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
        onClick={() => setIsModalOpen(true)}
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