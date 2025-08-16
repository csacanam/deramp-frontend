import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

export interface WalletConnectionState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isDetecting: boolean;
  walletType: 'metamask' | 'coinbase' | 'rainbow' | 'trust' | 'phantom' | 'unknown';
  isConnecting: boolean;
}

export const useWalletConnection = (): WalletConnectionState => {
  const { isConnected: wagmiConnected, address: wagmiAddress, chainId: wagmiChainId } = useAccount();
  const [state, setState] = useState<WalletConnectionState>({
    isConnected: false,
    address: null,
    chainId: null,
    isDetecting: true,
    walletType: 'unknown',
    isConnecting: false
  });

  // Detect wallet type and connection status
  const detectWalletConnection = useCallback(async () => {
    setState(prev => ({ ...prev, isDetecting: true }));

    try {
      // Check if ethereum is available
      if (!window.ethereum) {
        setState(prev => ({
          ...prev,
          isDetecting: false,
          isConnecting: false
        }));
        return;
      }

      // Detect wallet type
      let walletType: WalletConnectionState['walletType'] = 'unknown';
      if (window.ethereum.isMetaMask) walletType = 'metamask';
      else if (window.ethereum.isCoinbaseWallet) walletType = 'coinbase';
      else if (window.ethereum.isRainbow) walletType = 'rainbow';
      else if (window.ethereum.isTrust) walletType = 'trust';
      else if (window.ethereum.isPhantom) walletType = 'phantom';

      // Try to get connection status directly from wallet
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        const isConnected = accounts && accounts.length > 0;
        const address = isConnected ? accounts[0] : null;
        const chainIdDecimal = chainId ? parseInt(chainId, 16) : null;

        setState(prev => ({
          ...prev,
          isConnected,
          address,
          chainId: chainIdDecimal,
          isDetecting: false,
          isConnecting: false
        }));

        console.log('🔍 Direct wallet detection:', {
          walletType,
          isConnected,
          address,
          chainId: chainIdDecimal
        });

      } catch (error) {
        console.warn('⚠️ Direct wallet detection failed, falling back to wagmi:', error);
        
        // Fallback to wagmi state
        setState(prev => ({
          ...prev,
          isConnected: wagmiConnected,
          address: wagmiAddress || null,
          chainId: wagmiChainId || null,
          isDetecting: false,
          isConnecting: false
        }));
      }

    } catch (error) {
      console.error('❌ Wallet detection failed:', error);
      
      // Fallback to wagmi state
      setState(prev => ({
        ...prev,
        isConnected: wagmiConnected,
        address: wagmiAddress || null,
        chainId: wagmiChainId || null,
        isDetecting: false,
        isConnecting: false
      }));
    }
  }, [wagmiConnected, wagmiAddress, wagmiChainId]);

  // Listen to wallet events
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('🔄 Accounts changed:', accounts);
      detectWalletConnection();
    };

    const handleChainChanged = (chainId: string) => {
      console.log('🔄 Chain changed:', chainId);
      detectWalletConnection();
    };

    const handleConnect = () => {
      console.log('🔄 Wallet connected');
      detectWalletConnection();
    };

    const handleDisconnect = () => {
      console.log('🔄 Wallet disconnected');
      detectWalletConnection();
    };

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('connect', handleConnect);
    window.ethereum.on('disconnect', handleDisconnect);

    // Initial detection
    detectWalletConnection();

    return () => {
      // Remove event listeners
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('connect', handleConnect);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [detectWalletConnection]);

  // Update state when wagmi changes
  useEffect(() => {
    if (!state.isDetecting) {
      setState(prev => ({
        ...prev,
        isConnected: wagmiConnected || prev.isConnected,
        address: wagmiAddress || prev.address,
        chainId: wagmiChainId || prev.chainId
      }));
    }
  }, [wagmiConnected, wagmiAddress, wagmiChainId, state.isDetecting]);

  return state;
};
