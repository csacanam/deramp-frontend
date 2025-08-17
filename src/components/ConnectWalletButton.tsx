import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Wallet } from 'lucide-react';
import { useConnect } from 'wagmi';

interface ConnectWalletButtonProps {
  selectedNetwork?: string;
  onConnected?: () => void;
  className?: string;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ 
  onConnected,
  className = ''
}) => {
  const { connect, connectors, isPending } = useConnect();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const connectWallet = async () => {
    console.log('🦊 === INICIO CONEXIÓN WALLET ===');
    console.log('📊 Estado actual:', { isConnecting, isPending, hasError: !!error });
    
    // Prevenir solo clicks simultáneos, no reconexiones
    if (isConnecting) {
      console.log('⏳ ❌ BLOQUEADO: Connection already in progress, ignoring click');
      return;
    }
    
    if (!window.ethereum) {
      console.log('❌ ERROR: No window.ethereum detected');
      setError('No wallet detected. Please install MetaMask or Base Wallet.');
      return;
    }
    
    console.log('✅ window.ethereum detected, proceeding with connection...');
    
    try {
      console.log('🔄 Setting isConnecting = true');
      setIsConnecting(true);
      setError(null);
      
      const ethereum = window.ethereum as any;
      console.log('🔍 Ethereum provider properties:', {
        isMetaMask: ethereum?.isMetaMask,
        isCoinbaseWallet: ethereum?.isCoinbaseWallet,
        isBaseWallet: ethereum?.isBaseWallet,
        isTrust: ethereum?.isTrust,
        isPhantom: ethereum?.isPhantom,
        isRainbow: ethereum?.isRainbow,
        walletName: ethereum?.walletName,
        providers: ethereum?.providers?.length
      });
      
      // CASO ESPECIAL: MetaMask MOBILE - usar Wagmi como Base Wallet
      if (ethereum.isMetaMask && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log('📱 🎯 MetaMask MOBILE detected - using Wagmi connection');
        
        try {
          // Usar el mismo método que Base Wallet
          const connector = connectors[0];
          if (connector) {
            console.log('📱 🚀 Starting Wagmi connect for MetaMask mobile...');
            await connect({ connector });
            console.log('📱 ✅ MetaMask mobile connected via Wagmi');
            if (onConnected) onConnected();
          } else {
            throw new Error('No wallet connector available');
          }
        } catch (error: any) {
          // Mensaje específico para MetaMask mobile
          if (error.message?.includes('already pending') || error.message?.includes('wallet_requestPermissions')) {
            throw new Error(t.wallet?.metamaskPendingError || 'Close MetaMask completely and try again. The error indicates there is a pending request.');
          }
          throw error;
        }
        return;
      }
      
      // CASO ESPECIAL: MetaMask DESKTOP - mantener lógica actual
      if (ethereum.isMetaMask) {
        console.log('🦊 🎯 MetaMask DESKTOP detected - using direct connection');
        
        try {
          // PRIMERO: Verificar si ya hay cuentas conectadas (sin solicitar permisos)
          console.log('🦊 🔍 Checking existing accounts with eth_accounts...');
          const existingAccounts = await ethereum.request({ method: 'eth_accounts' });
          console.log('🦊 📊 Existing accounts:', existingAccounts);
          
          if (existingAccounts && existingAccounts.length > 0) {
            // ✅ Ya hay cuentas conectadas, usar directamente
            console.log('🦊 🎉 Using existing connected account:', existingAccounts[0]);
            if (onConnected) {
              console.log('🦊 🔄 Calling onConnected callback...');
              onConnected();
            }
            return;
          }
          
          // SEGUNDO: Solo si no hay cuentas, solicitar permisos
          console.log('🦊 🔐 No existing accounts, requesting permissions with eth_requestAccounts...');
          console.log('🦊 🚀 About to call ethereum.request...');
          
          try {
            // PRIMERO: Limpiar estado pendiente de MetaMask si existe
            console.log('🦊 🧹 Cleaning pending MetaMask state...');
            try {
              await ethereum.request({ method: 'wallet_requestPermissions', params: [] });
              console.log('🦊 ✅ Pending state cleaned successfully');
            } catch (cleanupError: any) {
              if (cleanupError.code === -32002) {
                console.log('🦊 ⚠️ Pending state cleanup failed (already pending), continuing...');
              } else {
                console.log('🦊 ℹ️ No pending state to clean:', cleanupError.message);
              }
            }
            
            // SEGUNDO: Ahora solicitar permisos normalmente
            console.log('🦊 🔐 Requesting permissions with eth_requestAccounts...');
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            console.log('🦊 ✅ eth_requestAccounts response:', accounts);
            
            if (accounts && accounts.length > 0) {
              console.log('🦊 🎉 MetaMask desktop connected successfully:', accounts[0]);
              if (onConnected) {
                console.log('🦊 🔄 Calling onConnected callback...');
                onConnected();
              }
            } else {
              console.log('🦊 ⚠️ No accounts returned from eth_requestAccounts');
            }
          } catch (requestError: any) {
            console.log('🦊 ❌ Error in eth_requestAccounts:', requestError);
            console.log('🦊 ❌ Error details:', {
              message: requestError.message,
              code: requestError.code,
              name: requestError.name
            });
            throw requestError;
          }
          
        } catch (error: any) {
          console.log('🦊 ❌ Error in MetaMask desktop connection flow:', error);
          // Re-lanzar el error para que se maneje en el catch general
          throw error;
        }
        
        return;
      }
      
      // CASO NORMAL: Usar Wagmi como antes
      console.log('🔗 🎯 Using Wagmi connector connection');
      const connector = connectors[0];
      console.log('🔗 Connector info:', { 
        name: connector?.name, 
        ready: connector?.ready,
        id: connector?.id 
      });
      
      if (connector) {
        console.log('🔗 🚀 Starting Wagmi connect...');
        await connect({ connector });
        console.log('🔗 ✅ Wagmi connection successful');
        if (onConnected) {
          console.log('🔗 🔄 Calling onConnected callback...');
          onConnected();
        }
      } else {
        throw new Error('No wallet connector available');
      }
      
    } catch (error: any) {
      console.error('❌ 🚨 CONNECTION ERROR:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name
      });
      
      // Manejar específicamente el error de request pendiente
      if (error.message?.includes('already pending') || error.message?.includes('wallet_requestPermissions')) {
        console.log('⚠️ 🚨 CRITICAL ERROR: wallet_requestPermissions already pending');
        setError('Connection request already in progress. Please wait...');
        // Resetear isConnecting después de un delay para permitir reconexión
        console.log('⏰ Setting timeout to reset isConnecting in 2 seconds...');
        setTimeout(() => {
          console.log('⏰ Timeout expired, resetting isConnecting = false');
          setIsConnecting(false);
        }, 2000);
      } else {
        console.log('⚠️ 🚨 REGULAR ERROR: Setting error message and resetting immediately');
        setError(error.message || 'Failed to connect wallet');
        // Resetear inmediatamente para otros errores
        setIsConnecting(false);
      }
      return; // No ejecutar finally para estos casos
    }
    
    // Solo resetear si no hubo error o si fue un error no crítico
    console.log('✅ 🎉 Connection successful or non-critical error, resetting isConnecting = false');
    setIsConnecting(false);
    console.log('🦊 === FIN CONEXIÓN WALLET ===');
  };

  return (
    <div className="space-y-3">
      <button
        onClick={connectWallet}
        disabled={isPending}
        className={`w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 ${className}`}
      >
        {isPending ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="h-5 w-5" />
            <span>{t.payment?.connectWallet || 'Connect Wallet'}</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}; 