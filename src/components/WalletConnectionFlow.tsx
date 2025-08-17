import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';
import { ConnectWalletButton } from './ConnectWalletButton';
import { NetworkChangeModal } from './NetworkChangeModal';
import { SUPPORTED_CHAINS } from '../config/chains';

interface WalletConnectionFlowProps {
  children: React.ReactNode;
  expectedNetwork?: string; // Keep for backward compatibility
  className?: string;
}

export const WalletConnectionFlow: React.FC<WalletConnectionFlowProps> = ({
  children,
  expectedNetwork,
  className = ''
}) => {
  const { isConnected, address, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { t } = useLanguage();
  const [isNetworkChangeModalOpen, setIsNetworkChangeModalOpen] = useState(false);

  // Check if wallet is on any compatible network
  const isOnCompatibleNetwork = (): boolean => {
    if (!chainId) return false;
    
    return SUPPORTED_CHAINS
      .filter(config => config.enabled)
      .some(config => config.chain.id === chainId);
  };

  // Get current network info
  const getCurrentNetworkInfo = () => {
    if (!chainId) return null;
    
    const chainConfig = SUPPORTED_CHAINS
      .filter(config => config.enabled)
      .find(config => config.chain.id === chainId);
    
    return chainConfig ? {
      name: chainConfig.chain.name,
      isTestnet: chainConfig.chain.testnet || false
    } : null;
  };

  // Handle network change
  const handleNetworkChange = async (targetChainId: number) => {
    try {
      console.log(`🔄 Switching to network ${targetChainId}...`);
      
      if (!window.ethereum) {
        console.error('❌ No ethereum provider available');
        return;
      }
      
      const ethereum = window.ethereum as any;
      
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
        console.log('✅ Network switched successfully');
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          const targetChain = SUPPORTED_CHAINS.find(config => config.chain.id === targetChainId);
          if (targetChain) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: targetChain.chain.name,
                  nativeCurrency: targetChain.chain.nativeCurrency,
                  rpcUrls: targetChain.chain.rpcUrls.default.http,
                  blockExplorerUrls: targetChain.chain.blockExplorers?.default.url ? [targetChain.chain.blockExplorers.default.url] : undefined,
                }],
              });
              console.log('✅ Network added and switched successfully');
            } catch (addError) {
              console.error('❌ Error adding network:', addError);
            }
          }
        } else {
          console.error('❌ Error switching network:', switchError);
        }
      }
    } catch (error) {
      console.error('❌ Error in handleNetworkChange:', error);
    }
  };

  // Step 1: Check if wallet is connected
  if (!isConnected) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
          <div className="mb-4">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {t.wallet?.connectFirst || 'Connect your wallet first'}
            </h2>
            <p className="text-gray-400 mb-6">
              {t.wallet?.connectDescription || 'You need to connect your wallet to continue with the payment'}
            </p>
          </div>
          
          <ConnectWalletButton 
            className="w-full max-w-md mx-auto"
            onConnected={() => {
              console.log('✅ Wallet connected, proceeding to network check...');
            }}
          />
        </div>
      </div>
    );
  }

  // Step 2: Check if we're on a compatible network
  if (!isOnCompatibleNetwork()) {
    const currentNetworkInfo = getCurrentNetworkInfo();
    
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-2">
              {t.wallet?.wrongNetwork || 'Incompatible network detected'}
            </h2>
            <p className="text-gray-400 mb-6">
              {currentNetworkInfo 
                ? t.wallet?.youAreOn?.replace('{network}', currentNetworkInfo.name).replace('{type}', currentNetworkInfo.isTestnet ? 'Testnet' : 'Mainnet') || `You are on ${currentNetworkInfo.name} (${currentNetworkInfo.isTestnet ? 'Testnet' : 'Mainnet'}), but you need to be on a compatible network to continue`
                : t.wallet?.needToChange || 'You need to switch to a compatible network to continue'
              }
            </p>
          </div>
          
          {/* Wallet info and disconnect button */}
          {address && (
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 text-sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => disconnect()}
                className="text-red-300 hover:text-red-200 text-xs underline decoration-dotted hover:decoration-solid transition-all duration-200"
                title={t.wallet?.disconnect || 'Disconnect wallet'}
              >
                {t.wallet?.disconnect || 'Disconnect'}
              </button>
            </div>
          )}
          
          {/* Change network button */}
          <div className="space-y-3">
            <button
              onClick={() => setIsNetworkChangeModalOpen(true)}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>{t.wallet?.changeNetwork || 'Change network'}</span>
            </button>
          </div>
        </div>
        
        {/* Network Change Modal for wrong network section */}
        <NetworkChangeModal
          isOpen={isNetworkChangeModalOpen}
          onClose={() => setIsNetworkChangeModalOpen(false)}
          onNetworkChange={handleNetworkChange}
        />
      </div>
    );
  }

  // Step 3: Wallet connected and on compatible network - show payment content
  const currentNetworkInfo = getCurrentNetworkInfo();
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Success indicator with wallet info and actions */}
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">
            {t.wallet?.connectedTitle || 'Wallet connected'}
          </h2>
        </div>
        
        {/* Wallet info and disconnect button */}
        {address && (
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 text-sm">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            <button
              onClick={() => disconnect()}
              className="text-red-300 hover:text-red-200 text-xs underline decoration-dotted hover:decoration-solid transition-all duration-200"
              title={t.wallet?.disconnect || 'Disconnect wallet'}
            >
              {t.wallet?.disconnect || 'Disconnect'}
            </button>
          </div>
        )}
        
        {/* Network info and switch button */}
        {currentNetworkInfo && (
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 text-sm">
                {currentNetworkInfo.name} ({currentNetworkInfo.isTestnet ? 'Testnet' : 'Mainnet'})
              </span>
            </div>
            <button
              onClick={() => setIsNetworkChangeModalOpen(true)}
              className="text-red-300 hover:text-red-200 text-xs underline decoration-dotted hover:decoration-solid transition-all duration-200"
              title={t.wallet?.changeNetwork || 'Change network'}
            >
              {t.wallet?.changeNetwork || 'Change'}
            </button>
          </div>
        )}
      </div>

      {/* Network Change Modal */}
      <NetworkChangeModal
        isOpen={isNetworkChangeModalOpen}
        onClose={() => setIsNetworkChangeModalOpen(false)}
        onNetworkChange={handleNetworkChange}
      />

      {/* Payment content */}
      {children}
    </div>
  );
};
