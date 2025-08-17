import React, { useEffect, useState, useRef } from 'react';
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
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  
  // Prevent multiple simultaneous connection attempts
  const connectionRef = useRef<boolean>(false);
  
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
      setError('No wallet detected. Please install MetaMask or Coinbase Wallet.');
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
          setError('Mobile wallet detected but connection not available. Please connect manually.');
          return false;
        }
      } catch (error: any) {
        console.log(`❌ Mobile connection failed for ${walletContext}:`, error);
        setError(`Failed to connect to ${walletContext}. Please try again.`);
        return false;
      }
    }

    // Desktop wallet connection
    console.log(`🦊 Attempting desktop connection to ${walletContext}...`);
    
    try {
      if (!window.ethereum) {
        console.log('❌ Window.ethereum not available');
        setError('Wallet not available. Please install MetaMask or Coinbase Wallet.');
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
        setError('No accounts found. Please unlock your wallet.');
        return false;
      }
    } catch (error: any) {
      if (error.code === 4001) {
        console.log(`⏳ User rejected connection to ${walletContext}`);
        setError('Connection rejected. Please try again.');
      } else {
        console.error(`❌ Error connecting to ${walletContext}:`, error);
        setError(`Connection failed: ${error.message || 'Unknown error'}`);
      }
      return false;
    }
  };

  // Handle connect wallet button click
  const handleConnectWallet = async () => {
    console.log('🔗 Connect wallet button clicked');
    
    // Prevent multiple simultaneous connection attempts
    if (connectionRef.current || connectionInProgress) {
      console.log('⏳ Connection already in progress, ignoring click');
      setError('Connection already in progress. Please wait...');
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    setConnectionInProgress(true);
    connectionRef.current = true;
    
    try {
      // Try direct connection
      const connected = await attemptDirectConnection();
      
      if (connected) {
        console.log('✅ Direct connection successful!');
        // The wallet state should update automatically via useWalletState
      }
    } catch (error) {
      console.error('❌ Unexpected error during connection:', error);
      setError('Unexpected error. Please try again.');
    } finally {
      setIsConnecting(false);
      setConnectionInProgress(false);
      connectionRef.current = false;
      
      // Clear error after a delay to allow user to try again
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
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
        onClick={handleConnectWallet}
        disabled={isConnecting || connectionInProgress}
        className={`
          w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl
          ${className}
        `}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-base">
          {isConnecting || connectionInProgress 
            ? 'Conectando...' 
            : (t.wallet?.connect || 'Conectar Wallet')
          }
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