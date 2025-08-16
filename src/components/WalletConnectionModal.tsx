import React, { useState, useEffect } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  getAvailableWallets, 
  openWallet, 
  getWalletDownloadUrl, 
  type WalletConfig 
} from '../utils/walletDetection';
import { 
  Wallet, 
  X, 
  Download, 
  ExternalLink, 
  Smartphone, 
  Monitor,
  ChevronRight
} from 'lucide-react';
import { getWalletLogo } from '../assets/walletLogos';
import { useWalletConnection } from '../hooks/useWalletConnection';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  isOpen,
  onClose,
  onConnected
}) => {
  const { connect, connectors, isPending } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'mobile' | 'desktop'>('mobile');
  
  // Get available wallets for current device
  const availableWallets = getAvailableWallets();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Debug logging - Always active for production debugging
  console.log('🔍 WalletConnectionModal Debug:', {
    isOpen,
    isConnected,
    address,
    connectors: connectors.map(c => ({ id: c.id, name: c.name, ready: c.ready })),
    isPending,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });

  // Additional debug: Check window.ethereum - Always active
  useEffect(() => {
    if (window.ethereum) {
      const ethereum = window.ethereum as any;
      console.log('🔍 Window.ethereum Debug:', {
        isMetaMask: ethereum.isMetaMask,
        isCoinbaseWallet: ethereum.isCoinbaseWallet,
        selectedAddress: ethereum.selectedAddress,
        chainId: ethereum.chainId,
        isConnected: ethereum.isConnected,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ Window.ethereum not available');
    }
  }, []);

  // Debug: Check for state inconsistencies
  useEffect(() => {
    console.log('🔍 State Consistency Check:', {
      wagmiConnected: isConnected,
      wagmiAddress: address,
      ethereumAvailable: !!window.ethereum,
      ethereumConnected: window.ethereum ? (window.ethereum as any).isConnected : false,
      ethereumAddress: window.ethereum ? (window.ethereum as any).selectedAddress : null,
      timestamp: new Date().toISOString()
    });
  }, [isConnected, address]);

  // Auto-select category based on device
  React.useEffect(() => {
    setSelectedCategory(isMobile ? 'mobile' : 'desktop');
  }, [isMobile]);

  // Auto-close modal when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      console.log('✅ Wallet connected automatically, closing modal...');
      onClose();
    }
  }, [isConnected, address, onClose]);

  const handleConnect = async (connector: any) => {
    try {
      console.log('🔗 Connecting with connector:', connector.name);
      await connect({ connector });
      onConnected?.();
      onClose();
    } catch (error) {
      console.error('❌ Failed to connect:', error);
    }
  };

  // Simple deep link opening - no complex logic
  const handleConnectWallet = async (wallet: WalletConfig) => {
    try {
      console.log('🆔 Opening wallet:', wallet.name);
      
      // Get current URL for deep linking
      const currentUrl = window.location.origin + window.location.pathname;
      console.log('🌐 Current URL:', currentUrl);
      
      // Open wallet with deep link
      const success = await openWallet(wallet.id, currentUrl);
      
      if (success) {
        console.log('✅ Wallet opened successfully');
        console.log('⏳ Waiting for connection...');
        // Don't close modal - let user connect manually if needed
      } else {
        console.log('❌ Failed to open wallet');
      }
    } catch (error) {
      console.error('❌ Error opening wallet:', error);
    }
  };

  const handleInstallWallet = (wallet: WalletConfig) => {
    const downloadUrl = getWalletDownloadUrl(wallet.id);
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-700">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-white leading-tight">
                {isConnected ? 'Wallet Conectada' : 'Conectar Wallet'}
              </h2>
              <p className="text-sm text-gray-400 leading-tight mt-1">
                {isConnected ? 'Tu wallet está conectada' : 'Elige cómo conectar tu wallet'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connected Wallet Info */}
        {(() => {
          console.log('🔍 Rendering connected wallet section:', { isConnected, address });
          return isConnected && address ? (
            <div className="p-6 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Wallet Conectada</p>
                    <p className="text-xs text-gray-400 font-mono">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('🔌 Disconnect button clicked');
                    disconnect();
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors duration-200"
                >
                  Desconectar
                </button>
              </div>
            </div>
          ) : null;
        })()}
        
        {/* Debug: Show connection status - Always visible for production debugging */}
        <div className="p-4 bg-blue-900/30 border-b border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-200 font-mono">
                Debug: isConnected={String(isConnected)}, address={address ? 'YES' : 'NO'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  console.log('🔍 Full State Debug:', {
                    wagmi: { isConnected, address },
                    ethereum: window.ethereum ? {
                      isMetaMask: (window.ethereum as any).isMetaMask,
                      isCoinbaseWallet: (window.ethereum as any).isCoinbaseWallet,
                      selectedAddress: (window.ethereum as any).selectedAddress,
                      chainId: (window.ethereum as any).chainId,
                      isConnected: (window.ethereum as any).isConnected
                    } : 'Not available',
                    localStorage: {
                      wagmi: localStorage.getItem('wagmi'),
                      walletConnect: localStorage.getItem('walletconnect'),
                      timestamp: new Date().toISOString()
                    }
                  });
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
              >
                Debug State
              </button>
              <button
                onClick={() => {
                  console.log('🧹 Clearing session...');
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
              >
                Clear Session
              </button>
              <div className="text-xs text-blue-300">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
          {isConnected && address && (
            <div className="mt-2 text-xs text-blue-300">
              <p>Wallet: {address.slice(0, 10)}...{address.slice(-8)}</p>
              <p>Chain ID: {window.ethereum ? (window.ethereum as any).chainId : 'N/A'}</p>
            </div>
          )}
        </div>

        {/* Live Debug Logs Panel - Always visible for production debugging */}
        <div className="p-4 bg-gray-800 border-b border-gray-600 max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-yellow-300">🔍 Live Debug Logs</h4>
            <button
              onClick={() => window.location.reload()}
              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded"
            >
              Refresh
            </button>
          </div>
          <div className="text-xs font-mono space-y-1 text-gray-300">
            <div>🕐 {new Date().toLocaleString()}</div>
            <div>📱 User Agent: {navigator.userAgent.substring(0, 50)}...</div>
            <div>🌐 URL: {window.location.href}</div>
            <div>🔗 Wagmi Connected: {String(isConnected)}</div>
            <div>👛 Wagmi Address: {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'None'}</div>
            <div>⚡ Ethereum Available: {window.ethereum ? 'YES' : 'NO'}</div>
            {window.ethereum && (
              <>
                <div>🦊 isMetaMask: {String((window.ethereum as any).isMetaMask)}</div>
                <div>💰 isCoinbaseWallet: {String((window.ethereum as any).isCoinbaseWallet)}</div>
                <div>🔗 Ethereum Connected: {String((window.ethereum as any).isConnected)}</div>
                <div>📍 Ethereum Address: {(window.ethereum as any).selectedAddress ? `${(window.ethereum as any).selectedAddress.slice(0, 10)}...${(window.ethereum as any).selectedAddress.slice(-8)}` : 'None'}</div>
                <div>🌐 Chain ID: {(window.ethereum as any).chainId || 'N/A'}</div>
              </>
            )}
            <div>💾 localStorage.wagmi: {localStorage.getItem('wagmi') ? 'EXISTS' : 'EMPTY'}</div>
            <div>🔌 localStorage.walletconnect: {localStorage.getItem('walletconnect') ? 'EXISTS' : 'EMPTY'}</div>
            <div>📦 sessionStorage: {Object.keys(sessionStorage).length > 0 ? `${Object.keys(sessionStorage).length} items` : 'EMPTY'}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isConnected ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-green-400 font-medium">Wallet Conectada</div>
                    <div className="text-green-300 text-sm">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Dirección no disponible'}
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Desconectar Wallet
              </button>
            </div>
          ) : (
            /* Connection Options */
            <div className="space-y-6">
              {/* Category Tabs */}
              <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedCategory('mobile')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors duration-200 ${
                    selectedCategory === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm font-medium">Móvil</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('desktop')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors duration-200 ${
                    selectedCategory === 'desktop'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm font-medium">Desktop</span>
                </button>
              </div>

              {/* Mobile Wallets */}
              {selectedCategory === 'mobile' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Wallets Móviles
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {availableWallets
                      .filter(wallet => 
                        (wallet.downloadUrls.android || wallet.downloadUrls.ios) && 
                        wallet.id !== 'phantom' && 
                        wallet.id !== 'trustWallet'
                      )
                      .sort((a, b) => {
                        const order = ['metaMask', 'coinbaseWallet', 'rainbow'];
                        return order.indexOf(a.id) - order.indexOf(b.id);
                      })
                      .slice(0, 6)
                      .map((wallet) => (
                                                 <button
                           key={wallet.id}
                           onClick={() => handleConnectWallet(wallet)}
                           className="flex flex-col items-center space-y-2 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-gray-700 hover:border-gray-600"
                         >
                           <div className="w-12 h-12 flex items-center justify-center">
                             {getWalletLogo(wallet.id, 32)}
                           </div>
                           <span className="text-sm font-medium text-white">{wallet.shortName}</span>
                         </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Desktop Wallets */}
              {selectedCategory === 'desktop' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Extensiones del Navegador
                  </h3>
                  <div className="space-y-2">
                    {connectors.map((connector) => (
                                             <button
                         key={connector.uid}
                         onClick={() => handleConnect(connector)}
                         disabled={!connector.ready}
                         className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 flex items-center justify-center">
                             {getWalletLogo(connector.name, 24)}
                           </div>
                           <span className="text-white font-medium">{connector.name}</span>
                         </div>
                         {!connector.ready ? (
                           <span className="text-xs text-gray-400">No disponible</span>
                         ) : (
                           <ChevronRight className="w-4 h-4 text-gray-400" />
                         )}
                       </button>
                    ))}
                  </div>

                  {/* Install Options */}
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mt-4">
                    Instalar Wallet
                  </h3>
                  <div className="space-y-2">
                    {availableWallets
                      .filter(wallet => !wallet.isInstalled && (wallet.downloadUrls.chrome || wallet.downloadUrls.firefox))
                      .slice(0, 2)
                      .map((wallet) => (
                                                 <button
                           key={wallet.id}
                           onClick={() => handleInstallWallet(wallet)}
                           className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-gray-700 hover:border-gray-600"
                         >
                           <div className="flex items-center space-x-3">
                             <div className="w-6 h-6 flex items-center justify-center">
                               {getWalletLogo(wallet.id, 20)}
                             </div>
                             <span className="text-white font-medium">Instalar {wallet.shortName}</span>
                           </div>
                           <ExternalLink className="w-4 h-4 text-gray-400" />
                         </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
