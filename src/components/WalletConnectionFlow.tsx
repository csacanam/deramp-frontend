import React from 'react';
import { useDisconnect } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';
import { ConnectWalletButton } from './ConnectWalletButton';
import { NetworkSwitchButton } from './NetworkSwitchButton';
import { useNetworkDetection } from '../hooks/useNetworkDetection';
import { useWalletConnection } from '../hooks/useWalletConnection';
import { LogOut } from 'lucide-react';

interface WalletConnectionFlowProps {
  children: React.ReactNode;
  expectedNetwork?: string;
  className?: string;
}

export const WalletConnectionFlow: React.FC<WalletConnectionFlowProps> = ({
  children,
  expectedNetwork = 'alfajores',
  className = ''
}) => {
  const { isConnected, address } = useWalletConnection();
  const { disconnect } = useDisconnect();
  const { t } = useLanguage();
  const { isCorrectNetwork, networkInfo } = useNetworkDetection(expectedNetwork);

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

  // Step 2: Check if we're on the correct network
  if (!isCorrectNetwork) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="mb-4">
            <div className="text-4xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {t.wallet?.wrongNetwork || 'Red incorrecta detectada'}
            </h2>
            <p className="text-gray-400 mb-6">
              {t.wallet?.switchNetworkDescription || 'Necesitas cambiar a la red correcta para continuar'}
            </p>
          </div>
          
          <NetworkSwitchButton
            targetChainId={44787} // Celo Alfajores
            onSwitch={() => {
              console.log('✅ Network switched, proceeding to payment...');
            }}
            onError={(error) => {
              console.error('❌ Network switch error:', error);
            }}
            showRefreshButton={true}
          />
        </div>
      </div>
    );
  }

  // Step 3: Wallet connected and on correct network - show payment content
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Success indicator with disconnect option */}
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-green-400 text-xl">✅</div>
            <div>
              <div className="text-green-400 font-medium">
                {t.wallet?.readyToPay || 'Listo para pagar'}
              </div>
              <div className="text-green-300 text-sm">
                {t.wallet?.connectedToCorrectNetwork || 'Wallet conectada y en la red correcta'}
              </div>
              {address && (
                <div className="text-green-200 text-xs mt-1">
                  {t.wallet?.connectedAddress || 'Dirección'}: {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              )}
            </div>
          </div>
          
          {/* Disconnect button */}
          <button
            onClick={() => disconnect()}
            className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            title={t.wallet?.disconnect || 'Desconectar wallet'}
          >
            <LogOut className="w-4 h-4" />
            <span>{t.wallet?.disconnect || 'Desconectar'}</span>
          </button>
        </div>
      </div>

      {/* Payment content */}
      {children}
    </div>
  );
};
