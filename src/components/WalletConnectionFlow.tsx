import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';
import { ConnectWalletButton } from './ConnectWalletButton';
import { NetworkSwitchButton } from './NetworkSwitchButton';
import { NetworkChangeModal } from './NetworkChangeModal';
import { LogOut } from 'lucide-react';
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
              {t.wallet?.connectFirst || 'Conecta tu wallet primero'}
            </h2>
            <p className="text-gray-400 mb-6">
              {t.wallet?.connectDescription || 'Necesitas conectar tu wallet para continuar con el pago'}
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
            <div className="text-4xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {t.wallet?.wrongNetwork || 'Red no compatible detectada'}
            </h2>
            <p className="text-gray-400 mb-6">
              {currentNetworkInfo 
                ? `Estás en ${currentNetworkInfo.name} (${currentNetworkInfo.isTestnet ? 'Testnet' : 'Mainnet'}), pero necesitas estar en una red compatible para continuar`
                : 'Necesitas cambiar a una red compatible para continuar'
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              <strong>Redes compatibles:</strong>
            </p>
            {SUPPORTED_CHAINS
              .filter(config => config.enabled)
              .map(config => (
                <div key={config.chain.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium">{config.chain.name}</span>
                    <span className="text-xs text-gray-400">
                      {config.chain.testnet ? 'Testnet' : 'Mainnet'}
                    </span>
                  </div>
                  <NetworkSwitchButton
                    targetChainId={config.chain.id}
                    onSwitch={() => {
                      console.log(`✅ Switched to ${config.chain.name}`);
                    }}
                    onError={(error) => {
                      console.error(`❌ Error switching to ${config.chain.name}:`, error);
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Wallet connected and on compatible network - show payment content
  const currentNetworkInfo = getCurrentNetworkInfo();
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Success indicator with disconnect option */}
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div>
              <div className="text-green-400 font-medium text-lg">
                {t.wallet?.connectedTitle || 'Wallet conectada'}
              </div>
              <div className="text-green-300 text-sm">
                {currentNetworkInfo 
                  ? `Red: ${currentNetworkInfo.name} (${currentNetworkInfo.isTestnet ? 'Testnet' : 'Mainnet'})`
                  : 'Red: Compatible'
                }
              </div>
              {address && (
                <div className="text-green-200 text-xs mt-1">
                  {t.wallet?.connectedAddress || 'Dirección'}: {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-3 ml-12">
            <button
              onClick={() => setIsNetworkChangeModalOpen(true)}
              className="text-green-300 hover:text-green-200 text-xs underline decoration-dotted hover:decoration-solid transition-all duration-200"
              title={t.wallet?.changeNetwork || 'Cambiar red'}
            >
              {t.wallet?.changeNetwork || 'Cambiar red'}
            </button>
            
            <span className="text-green-300 text-xs">•</span>
            
            <button
              onClick={() => disconnect()}
              className="text-green-300 hover:text-green-200 text-xs underline decoration-dotted hover:decoration-solid transition-all duration-200"
              title={t.wallet?.disconnect || 'Desconectar wallet'}
            >
              {t.wallet?.disconnect || 'Desconectar'}
            </button>
          </div>
        </div>
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
