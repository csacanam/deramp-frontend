import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Wallet } from 'lucide-react';
import { useConnect } from 'wagmi';

interface ConnectWalletButtonProps {
  selectedNetwork?: string;
  onConnected?: () => void;
  className?: string;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ 
  onConnected,
  className = ''
}) => {
  const { connect, connectors, isPending } = useConnect();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  
  const connectWallet = async () => {
    console.log('🦊 Attempting wallet connection...');
    
    if (!window.ethereum) {
      setError('No wallet detected. Please install MetaMask or Base Wallet.');
      return;
    }
    
    try {
      setError(null);
      
      // Use the first available connector (usually MetaMask or injected)
      const connector = connectors[0];
      if (connector) {
        console.log('🔗 Connecting with connector:', connector.name);
        await connect({ connector });
        console.log('✅ Wallet connected successfully');
        
        if (onConnected) {
          onConnected();
        }
      } else {
        throw new Error('No wallet connector available');
      }
      
    } catch (error: any) {
      console.error('❌ Connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={connectWallet}
        disabled={isPending}
        className={`w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 ${className}`}
      >
        {isPending ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="h-5 w-5" />
            <span>{t.payment?.connectWallet || 'Connect Wallet'}</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}; 