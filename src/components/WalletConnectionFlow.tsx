import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';
import { ConnectWalletButton } from './ConnectWalletButton';
import { NetworkChangeModal } from './NetworkChangeModal';
import { SUPPORTED_CHAINS } from '../config/chains';
import { useWalletState } from '../hooks/useWalletState';

interface WalletConnectionFlowProps {
  isInWalletApp: boolean;
  onOpenWalletSelection: () => void;
}

export const WalletConnectionFlow: React.FC<WalletConnectionFlowProps> = ({
  isInWalletApp,
  onOpenWalletSelection,
}) => {
  const { t } = useLanguage();
  const { isConnected, address, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { walletType } = useWalletState();
  const [isNetworkChangeModalOpen, setIsNetworkChangeModalOpen] = useState(false);

  // If not connected, show connection options
  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t.wallet?.connectFirst || 'Connect your wallet first'}
          </h3>
          <p className="text-gray-600 mb-6">
            {t.wallet?.connectDescription || 'Choose how to connect your wallet'}
          </p>
          
          {isInWalletApp ? (
            // In wallet app - use normal connect button
            <ConnectWalletButton />
          ) : (
            // In regular browser - show wallet selection modal
            <button
              onClick={onOpenWalletSelection}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.payment?.connectWallet || 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    );
  }

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

  // Step 2: Check if we're on a compatible network
  if (!isOnCompatibleNetwork()) {
    const currentNetworkInfo = getCurrentNetworkInfo();
    
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to proceed with payment
          </h3>
          <p className="text-gray-600">
            Your wallet is connected and on a compatible network.
          </p>
        </div>
      </div>
    </div>
  );
};
