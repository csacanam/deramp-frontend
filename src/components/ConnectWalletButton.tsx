import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Wallet } from 'lucide-react';
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Universal wallet connection - simple and direct
  const connectWallet = async () => {
    console.log('🔗 Connect wallet button clicked');
    
    if (!window.ethereum) {
      setError('No wallet detected. Please install MetaMask or Coinbase Wallet.');
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('🦊 Attempting universal wallet connection...');
      
      // Simple connection attempt - works with any wallet
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts && accounts.length > 0) {
        console.log('✅ Successfully connected:', accounts[0]);
        // Wallet state will update automatically via useWalletState
      } else {
        console.log('❌ No accounts returned');
        setError('No accounts found. Please unlock your wallet.');
      }
    } catch (error: any) {
      console.error('❌ Connection failed:', error);
      
      if (error.code === 4001) {
        setError('Connection rejected. Please try again.');
      } else {
        setError(`Connection failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsConnecting(false);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 ConnectWalletButton Debug:');
    console.log('  - Is Connected:', isConnected);
    console.log('  - Address:', address);
    console.log('  - Chain ID:', chainId);
    console.log('  - Wallet Type:', walletType);
    console.log('  - Last Update:', lastUpdate);
    console.log('  - Window Ethereum:', !!window.ethereum);
    console.log('  - Timestamp:', new Date().toISOString());
  }, [isConnected, address, chainId, walletType, lastUpdate]);

  // Call onConnected callback when wallet connects
  useEffect(() => {
    if (isConnected && onConnected) {
      console.log('✅ Wallet connected, calling onConnected callback');
      onConnected();
    }
  }, [isConnected, onConnected]);

  // If connected, show wallet info
  if (isConnected) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg">
          <Wallet className="w-5 h-5" />
          <span className="text-base">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet'}</span>
        </div>
      </div>
    );
  }

  // If not connected, show connect button
  return (
    <div className="w-full space-y-3">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`
          w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl
          ${className}
        `}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-base">
          {isConnecting ? 'Conectando...' : (t.wallet?.connect || 'Conectar Wallet')}
        </span>
      </button>
      
      {/* Error message */}
      {error && (
        <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-700 rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  );
}; 