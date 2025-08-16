import { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNetworkDetection } from './useNetworkDetection';
import { BlockchainService } from '../services/blockchainService';
import { TOKENS } from '../blockchain/config/tokens';
import { useWalletState } from './useWalletState';

export const usePaymentButton = (
  invoiceId: string,
  paymentOptions: any[],
  onError?: (message: string) => void
) => {
  const { isConnected, address, chainId, walletType, lastUpdate } = useWalletState();
  const { language, t } = useLanguage();
  
  // Debug logging - Always active for production debugging
  console.log('🔍 usePaymentButton Debug (Centralized State):', {
    invoiceId,
    paymentOptions,
    isConnected,
    address,
    chainId,
    walletType,
    lastUpdate,
    language,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });

  // Debug state for UI display
  const [debugInfo, setDebugInfo] = useState({
    lastCheck: new Date().toISOString(),
    wagmiState: { isConnected, address, chainId },
    ethereumState: null as any,
    localStorage: null as any
  });

  // Update debug info when state changes
  useMemo(() => {
    setDebugInfo({
      lastCheck: new Date().toISOString(),
      wagmiState: { isConnected, address, chainId },
      ethereumState: window.ethereum ? {
        isMetaMask: (window.ethereum as any).isMetaMask,
        isCoinbaseWallet: (window.ethereum as any).isCoinbaseWallet,
        selectedAddress: (window.ethereum as any).selectedAddress,
        chainId: (window.ethereum as any).chainId,
        isConnected: (window.ethereum as any).isConnected
      } : null,
      localStorage: {
        wagmi: localStorage.getItem('wagmi') ? 'EXISTS' : 'EMPTY',
        walletconnect: localStorage.getItem('walletconnect') ? 'EXISTS' : 'EMPTY',
        sessionStorage: Object.keys(sessionStorage).length > 0 ? `${Object.keys(sessionStorage).length} items` : 'EMPTY'
      }
    });
  }, [isConnected, address, chainId]);

  // Use enhanced network detection
  const { isCorrectNetwork, networkInfo } = useNetworkDetection('alfajores');

  // Get network name from chain ID
  const getNetworkName = useCallback((chainId: number): string => {
    if (chainId === 44787) return 'alfajores';
    if (chainId === 42220) return 'celo';
    return 'unknown';
  }, []);

  // Handle payment button click
  const handlePayNow = useCallback(async () => {
    if (!isConnected || !address || !chainId) {
      console.log('❌ Payment blocked - Wallet not connected:', { isConnected, address, chainId });
      onError?.('Please connect your wallet first');
      return;
    }

    console.log('✅ Payment proceeding - Wallet connected:', { isConnected, address, chainId });
    
    // Add your payment logic here
    onError?.('Payment functionality not yet implemented');
  }, [isConnected, address, chainId, onError]);

  return {
    isConnected,
    address,
    chainId,
    walletType,
    lastUpdate,
    isCorrectNetwork,
    networkInfo,
    debugInfo,
    handlePayNow
  };
}; 