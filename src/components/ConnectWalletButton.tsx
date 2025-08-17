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
      setError('No wallet detected. Please install MetaMask or Base Wallet.');
      return;
    }
    
    // Check if already connected to prevent duplicate requests
    if (isConnecting) {
      console.log('⚠️ Connection already in progress, ignoring click');
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('🦊 Attempting universal wallet connection...');
      
      // Check if already connected via window.ethereum
      const ethereum = window.ethereum as any;
      if (ethereum.selectedAddress && ethereum.chainId) {
        console.log('✅ Already connected via window.ethereum:', {
          address: ethereum.selectedAddress,
          chainId: ethereum.chainId
        });
        // Force a refresh of the wallet state
        window.location.reload();
        return;
      }
      
      // Detect wallet type for better connection handling
      const isBaseWallet = ethereum.isCoinbaseWallet || ethereum.isBaseWallet || 
                          ethereum.providers?.some((p: any) => p.isCoinbaseWallet || p.isBaseWallet);
      
      console.log('🔍 Wallet detection:', {
        isMetaMask: ethereum.isMetaMask,
        isBaseWallet,
        walletName: ethereum.walletName || 'Unknown'
      });
      
      let accounts;
      
      if (isBaseWallet) {
        // Base Wallet specific connection method
        console.log('🪙 Using Base Wallet connection method');
        try {
          // Try the standard method first
          accounts = await ethereum.request({
            method: 'eth_requestAccounts'
          });
        } catch (baseError: any) {
          console.log('⚠️ Base Wallet standard method failed, trying alternative:', baseError);
          
          // Try alternative method for Base Wallet
          if (ethereum.providers) {
            const baseProvider = ethereum.providers.find((p: any) => p.isCoinbaseWallet || p.isBaseWallet);
            if (baseProvider) {
              accounts = await baseProvider.request({
                method: 'eth_requestAccounts'
              });
            }
          }
          
          // If still no success, try to enable the provider
          if (!accounts && ethereum.enable) {
            accounts = await ethereum.enable();
          }
        }
      } else {
        // Standard connection method for other wallets
        console.log('🔗 Using standard connection method');
        accounts = await ethereum.request({
          method: 'eth_requestAccounts'
        });
      }
      
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
      } else if (error.message?.includes('ALREADY PROCESSING') || error.message?.includes('PLEASE WAIT')) {
        setError('Connection in progress. Please wait a moment and try again.');
        // Force a page refresh to reset the connection state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(`Connection failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsConnecting(false);
      
      // Clear error after 8 seconds (longer for connection issues)
      setTimeout(() => {
        setError(null);
      }, 8000);
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
          {isConnecting ? 'Conectando...' : (t.payment?.connectWallet || 'Conectar Wallet')}
        </span>
      </button>
      
      {/* Error message */}
      {error && (
        <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-700 rounded-lg p-3">
          {error}
          
          {/* Reset button for connection issues */}
          {(error.includes('ALREADY PROCESSING') || error.includes('PLEASE WAIT') || error.includes('Connection in progress')) && (
            <div className="mt-3">
              <button
                onClick={() => {
                  console.log('🔄 Force resetting connection state...');
                  localStorage.removeItem('wagmi');
                  localStorage.removeItem('walletconnect');
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="text-xs text-red-300 hover:text-red-200 underline decoration-dotted hover:decoration-solid transition-all duration-200"
              >
                Reset connection state
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 