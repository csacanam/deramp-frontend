import React, { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSwitchChain, useDisconnect } from 'wagmi';
import { base, polygon, celo } from 'wagmi/chains';

interface ConnectWalletButtonProps {
  selectedNetwork?: string;
  onConnected?: () => void;
}

// Map network names to chain IDs
const NETWORK_TO_CHAIN_ID: Record<string, number> = {
  'Base': base.id,
  'Polygon': polygon.id,
  'Polygon POS': polygon.id, // Backend uses "Polygon POS"
  'Celo': celo.id,
};

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ 
  selectedNetwork, 
  onConnected 
}) => {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();

  // Auto-switch to the selected network when connected
  useEffect(() => {
    if (isConnected && selectedNetwork && chain) {
      const targetChainId = NETWORK_TO_CHAIN_ID[selectedNetwork];
      if (targetChainId && chain.id !== targetChainId) {
        switchChain({ chainId: targetChainId });
      }
    }
  }, [isConnected, selectedNetwork, chain, switchChain]);

  // Call onConnected callback when wallet connects
  useEffect(() => {
    if (isConnected && onConnected) {
      onConnected();
    }
  }, [isConnected, onConnected]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Conectar Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <div className="text-center">
                    <span className="text-red-400 text-sm">
                      Red no soportada - Cambiar token/red arriba
                    </span>
                  </div>
                );
              }

              return (
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {account.displayName}
                    </button>
                    <button
                      onClick={() => disconnect()}
                      type="button"
                      className="text-gray-400 hover:text-red-400 transition-colors underline"
                    >
                      Desconectar
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}; 