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
  const { isConnected, address, chainId, walletType, lastUpdate, setWalletType } = useWalletState();
  const { t } = useLanguage();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Universal wallet connection - simple and direct
  const connectWallet = async () => {
    console.log('🦊 Attempting universal wallet connection...');
    
    if (!window.ethereum) {
      setError('No wallet detected. Please install MetaMask or Base Wallet.');
      return;
    }
    
    if (isConnecting) {
      console.log('⏳ Connection already in progress, skipping...');
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
        walletName: ethereum.walletName || 'Unknown',
        providers: ethereum.providers?.length || 0
      });
      
      let accounts;
      
      if (isBaseWallet) {
        console.log('🪙 Using Base Wallet specific connection method');
        
        // Base Wallet specific connection - try multiple methods
        try {
          // Method 1: Standard eth_requestAccounts
          console.log('🔄 Method 1: Standard eth_requestAccounts');
          accounts = await ethereum.request({ method: 'eth_requestAccounts' });
          console.log('✅ Method 1 successful:', accounts);
        } catch (method1Error: any) {
          console.log('⚠️ Method 1 failed:', method1Error.message);
          
          // Method 2: Try specific provider if multiple exist
          if (ethereum.providers && ethereum.providers.length > 0) {
            try {
              console.log('🔄 Method 2: Finding Base Wallet provider');
              const baseProvider = ethereum.providers.find((p: any) => 
                p.isCoinbaseWallet || p.isBaseWallet
              );
              
              if (baseProvider) {
                console.log('✅ Found Base Wallet provider, trying eth_requestAccounts');
                accounts = await baseProvider.request({ method: 'eth_requestAccounts' });
                console.log('✅ Method 2 successful:', accounts);
              } else {
                console.log('❌ No Base Wallet provider found in providers array');
              }
            } catch (method2Error: any) {
              console.log('⚠️ Method 2 failed:', method2Error.message);
            }
          }
          
          // Method 3: Try ethereum.enable() as last resort
          if (!accounts && ethereum.enable) {
            try {
              console.log('🔄 Method 3: Using ethereum.enable()');
              accounts = await ethereum.enable();
              console.log('✅ Method 3 successful:', accounts);
            } catch (method3Error: any) {
              console.log('⚠️ Method 3 failed:', method3Error.message);
            }
          }
        }
        
        // If all methods failed, throw error
        if (!accounts) {
          throw new Error('All Base Wallet connection methods failed');
        }
        
      } else {
        // Standard connection for other wallets (MetaMask, etc.)
        console.log('🔗 Using standard connection method');
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      }
      
      if (accounts && accounts.length > 0) {
        console.log('✅ Wallet connected successfully:', accounts[0]);
        setError(null);
        
        // Update wallet type for UI
        if (isBaseWallet) {
          setWalletType('coinbase');
        } else if (ethereum.isMetaMask) {
          setWalletType('metamask');
        } else {
          setWalletType('unknown');
        }
        
        // Force a refresh to sync with Wagmi
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } else {
        throw new Error('No accounts returned from wallet');
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
      } else if (error.message?.includes('All Base Wallet connection methods failed')) {
        setError('Base Wallet connection failed. Please try again or restart the app.');
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