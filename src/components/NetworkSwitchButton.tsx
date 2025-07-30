import React from 'react';
import { useWalletClient } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';

interface NetworkSwitchButtonProps {
  targetChainId: number;
  onSwitch?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const NetworkSwitchButton: React.FC<NetworkSwitchButtonProps> = ({
  targetChainId,
  onSwitch,
  onError,
  className = ''
}) => {
  const { data: walletClient } = useWalletClient();
  const { t } = useLanguage();

  const handleSwitchNetwork = async () => {
    try {
      console.log('🔄 User clicked to switch network...');
      console.log('🔄 Target Chain ID:', targetChainId);
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
      
      // Reload the page to refresh the connection
      window.location.reload();
      
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
          window.location.reload();
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
    }
  };

  return (
    <button
      onClick={handleSwitchNetwork}
      className={`
        w-full px-4 py-3 font-medium rounded-lg transition-colors
        bg-green-600 hover:bg-green-700 text-white
        flex items-center justify-center space-x-2
        ${className}
      `}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Cambiar a Celo Alfajores</span>
    </button>
  );
}; 