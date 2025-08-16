import React, { useState } from 'react';
import { useWalletClient } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';
import { useNetworkDetection } from '../hooks/useNetworkDetection';
import { NetworkRefreshButton } from './NetworkRefreshButton';

interface NetworkSwitchButtonProps {
  targetChainId: number;
  onSwitch?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showRefreshButton?: boolean;
}

export const NetworkSwitchButton: React.FC<NetworkSwitchButtonProps> = ({
  targetChainId,
  onSwitch,
  onError,
  className = '',
  showRefreshButton = true
}) => {
  const { data: walletClient } = useWalletClient();
  const { t } = useLanguage();
  const [isSwitching, setIsSwitching] = useState(false);
  
  // Use our enhanced network detection
  const { networkInfo, isCorrectNetwork, refreshNetwork, isRefreshing } = useNetworkDetection('alfajores');

  const handleSwitchNetwork = async () => {
    try {
      setIsSwitching(true);
      console.log('🔄 User clicked to switch network...');
      console.log('🔄 Target Chain ID:', targetChainId);
      console.log('🔄 Current Network Info:', networkInfo);
      console.log('🔄 Wallet Client:', !!walletClient);
      
      if (!walletClient) {
        throw new Error('No wallet client available');
      }

      // Convert chainId to hex
      const chainIdHex = `0x${targetChainId.toString(16)}`;
      console.log('🔄 Chain ID Hex:', chainIdHex);

      await walletClient.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      
      console.log('✅ Network switch successful');
      
      // Call success callback
      onSwitch?.();
      
      // Refresh network detection instead of reloading page
      setTimeout(() => {
        refreshNetwork();
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Failed to switch network:', error);
      
      // Handle specific error cases
      if (error.code === 4902) {
        // Chain not added to wallet, try to add it
        try {
          await walletClient?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: 'Celo Alfajores',
              nativeCurrency: {
                name: 'CELO',
                symbol: 'CELO',
                decimals: 18,
              },
              rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
              blockExplorerUrls: ['https://explorer.celo.org/alfajores'],
            }],
          });
          console.log('✅ Chain added successfully');
          
          // Refresh network detection
          setTimeout(() => {
            refreshNetwork();
          }, 500);
          
        } catch (addError) {
          console.error('❌ Failed to add chain:', addError);
          onError?.('Error al agregar la red. Por favor, agrega Celo Alfajores manualmente en tu wallet.');
        }
      } else if (error.code === 4001) {
        // User rejected the request
        onError?.('Cambio de red cancelado por el usuario.');
      } else {
        onError?.('Error al cambiar de red. Por favor, cambia manualmente a Celo Alfajores en tu wallet.');
      }
    } finally {
      setIsSwitching(false);
    }
  };

  // Show current network status
  const getNetworkStatusText = () => {
    if (!networkInfo) return 'Detectando red...';
    
    if (networkInfo.isCorrect) {
      return `✅ Conectado a ${networkInfo.expectedName}`;
    }
    
    if (networkInfo.isSupported) {
      return `⚠️ Red incorrecta: ${networkInfo.name} (ID: ${networkInfo.chainId})`;
    }
    
    return `❌ Red no soportada (ID: ${networkInfo.chainId})`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Network Status Display */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">
            {t.network?.status || 'Estado de la Red'}
          </h3>
          {showRefreshButton && (
            <NetworkRefreshButton
              onRefresh={refreshNetwork}
              isRefreshing={isRefreshing}
              className="text-sm"
            />
          )}
        </div>
        
        <div className="text-sm text-gray-300 mb-3">
          {getNetworkStatusText()}
        </div>
        
        {networkInfo && !networkInfo.isCorrect && (
          <div className="text-xs text-gray-400 space-y-1">
            <div>Red esperada: {networkInfo.expectedName} (ID: {networkInfo.expectedChainId})</div>
            <div>Red actual: {networkInfo.name} (ID: {networkInfo.chainId})</div>
          </div>
        )}
      </div>

      {/* Switch Network Button - only show if not on correct network */}
      {networkInfo && !networkInfo.isCorrect && (
        <button
          onClick={handleSwitchNetwork}
          disabled={isSwitching}
          className={`
            w-full px-4 py-3 font-medium rounded-lg transition-colors
            ${isSwitching 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
            }
            flex items-center justify-center space-x-2
          `}
        >
          <svg className={`w-5 h-5 ${isSwitching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>
            {isSwitching 
              ? (t.network?.switching || 'Cambiando red...') 
              : (t.network?.switchTo || 'Cambiar a') + ' ' + (networkInfo.expectedName || 'Celo Alfajores')
            }
          </span>
        </button>
      )}

      {/* Success message when on correct network */}
      {networkInfo && networkInfo.isCorrect && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 text-center">
          <div className="text-green-400 text-sm font-medium">
            ✅ {t.network?.connected || 'Conectado a la red correcta'}
          </div>
        </div>
      )}
    </div>
  );
}; 