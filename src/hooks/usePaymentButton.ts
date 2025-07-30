import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId, useWalletClient, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { BlockchainService } from '../services/blockchainService';
import { ButtonState, PaymentOption } from '../blockchain/types';
import { TOKENS } from '../blockchain/config/tokens';
import { CONTRACTS } from '../blockchain/config/contracts';
import { useLanguage } from '../contexts/LanguageContext';
import DerampProxyABI from '../blockchain/abi/DerampProxy.json';

interface UsePaymentButtonProps {
  invoiceId: string;
  paymentOptions: PaymentOption[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
  hasSufficientBalance?: boolean; // Add balance validation
}

export const usePaymentButton = ({ 
  invoiceId, 
  paymentOptions, 
  onSuccess, 
  onError,
  hasSufficientBalance = true
}: UsePaymentButtonProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>('initial');
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [pendingTxHash, setPendingTxHash] = useState<string>('');
  const [showNetworkSwitch, setShowNetworkSwitch] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { language, t } = useLanguage();

  // Check allowance when returning from authorization - IMPROVED
  useEffect(() => {
    const checkAllowanceOnReturn = async () => {
      if (buttonState === 'approving' && isConnected && address && chainId && selectedToken && pendingTxHash) {
        try {
          console.log('🔍 Checking allowance after approval transaction...');
          
          const networkName = getNetworkName(chainId);
          const networkTokens = TOKENS[networkName as keyof typeof TOKENS];
          if (!networkTokens) return;

          const tokenConfig = Object.values(networkTokens).find(
            token => token.symbol.toLowerCase() === selectedToken.toLowerCase()
          );
          if (!tokenConfig) return;

          const paymentOption = paymentOptions.find(option => option.token === selectedToken);
          if (!paymentOption) return;

          const networkContracts = CONTRACTS[networkName as keyof typeof CONTRACTS];
          if (!networkContracts || !walletClient) return;

          const provider = new ethers.BrowserProvider(walletClient);
          
          // Wait for transaction confirmation first
          console.log('⏳ Waiting for transaction confirmation...');
          const tx = await provider.getTransaction(pendingTxHash);
          if (!tx) {
            console.log('❌ Transaction not found, retrying...');
            return; // Will retry on next effect run
          }
          
          const receipt = await tx.wait();
          console.log('✅ Transaction confirmed, checking allowance...');
          
          const tokenContract = new ethers.Contract(
            tokenConfig.address,
            ['function allowance(address owner, address spender) external view returns (uint256)'],
            provider
          );

          const allowance = await tokenContract.allowance(address, networkContracts.DERAMP_PROXY);
          const requiredAmount = ethers.parseUnits(paymentOption.amount, tokenConfig.decimals);

          console.log('📊 Allowance check:', {
            allowance: ethers.formatUnits(allowance, tokenConfig.decimals),
            required: ethers.formatUnits(requiredAmount, tokenConfig.decimals),
            sufficient: allowance >= requiredAmount
          });

          if (allowance >= requiredAmount) {
            console.log('✅ Allowance verified, switching to confirm');
            setButtonState('confirm');
            setPendingTxHash(''); // Clear pending hash
          } else {
            console.log('❌ Allowance insufficient, staying in approving state');
            // Don't change state, let user retry
          }
        } catch (error) {
          console.log('⚠️ Error checking allowance on return:', error);
          // Don't change state on error, let user retry
        }
      }
    };

    // Check immediately and then every 2 seconds until we get a result
    if (buttonState === 'approving' && pendingTxHash) {
      checkAllowanceOnReturn();
      const intervalId = setInterval(checkAllowanceOnReturn, 2000);
      return () => clearInterval(intervalId);
    }
  }, [buttonState, isConnected, address, chainId, selectedToken, paymentOptions, walletClient, pendingTxHash]);

  // Get network name from chainId
  const getNetworkName = (chainId: number): string => {
    switch (chainId) {
      case 44787:
        return 'alfajores';
      default:
        return 'alfajores'; // Default to alfajores for now
    }
  };

  const getButtonText = useCallback((state: ButtonState, tokenSymbol?: string) => {
    const isSpanish = language === 'es';
    
    switch (state) {
      case 'initial':
        return isSpanish ? 'Pagar ahora' : 'Pay Now';
      case 'loading':
        return isSpanish ? 'Preparando tu pago...' : 'Preparing your payment...';
      case 'ready':
        return isSpanish ? `Autorizar ${tokenSymbol}` : `Authorize ${tokenSymbol}`;
      case 'approving':
        return isSpanish ? `Autorizando ${tokenSymbol}...` : `Authorizing ${tokenSymbol}...`;
      case 'confirm':
        return isSpanish ? 'Confirmar pago' : 'Confirm Payment';
      case 'processing':
        return isSpanish ? 'Procesando pago...' : 'Processing payment...';
      default:
        return isSpanish ? 'Pagar ahora' : 'Pay Now';
    }
  }, [language]);

  const handlePayNow = useCallback(async () => {
    if (!isConnected || !address || !chainId) {
      onError?.('Please connect your wallet first');
      return;
    }

    if (paymentOptions.length === 0) {
      onError?.('No payment options available');
      return;
    }

    if (!hasSufficientBalance) {
      onError?.('Insufficient balance');
      return;
    }

    setButtonState('loading');

    try {
      const networkName = getNetworkName(chainId);
      
      // Step 1: Check blockchain status
      const statusResponse = await BlockchainService.getStatus(invoiceId, networkName);
      
      if (statusResponse.success) {
        const { exists, status } = statusResponse.data;
        
        if (!exists) {
          // Convert token symbols to addresses for blockchain creation
          const networkTokens = TOKENS[networkName as keyof typeof TOKENS];
          if (!networkTokens) {
            throw new Error('Unsupported network');
          }

          const blockchainPaymentOptions = paymentOptions.map(option => {
            // Find token config by symbol (case-insensitive)
            const tokenConfig = Object.values(networkTokens).find(
              token => token.symbol.toLowerCase() === option.token.toLowerCase()
            );
            if (!tokenConfig) {
              throw new Error(`Unsupported token: ${option.token}`);
            }
            
            return {
              token: tokenConfig.address, // Use address instead of symbol
              amount: option.amount
            };
          });

          // Create invoice on blockchain
          
          // TEMPORARY: Try without supportsENS parameter to see if that was the issue
          const createResponse = await BlockchainService.createInvoice({
            invoiceId,
            paymentOptions: blockchainPaymentOptions, // Use converted options with addresses
            network: networkName,
            // supportsENS, // Commented out to test if this was causing the issue
          });
          
          if (createResponse.success) {
            setSelectedToken(paymentOptions[0].token);
            setButtonState('ready');
          } else {
            throw new Error('Failed to create invoice on blockchain');
          }
        } else if (status === 'pending') {
          // Invoice exists and is pending, ready to authorize
          setSelectedToken(paymentOptions[0].token);
          setButtonState('ready');
        } else if (['expired', 'refunded', 'paid'].includes(status)) {
          // Update backend and refresh page
          await BlockchainService.updateInvoiceStatus(invoiceId, status);
          window.location.reload();
        } else {
          throw new Error(`Unexpected invoice status: ${status}`);
        }
      } else {
        throw new Error('Failed to get blockchain status');
      }
    } catch (error) {
      console.error('Error in handlePayNow:', error);
      setButtonState('initial');
      
      // Provide user-friendly error messages
      let userMessage = t.payment.paymentFailed;
      
      if (error instanceof Error) {
        if (error.message.includes('ENS') || error.message.includes('network does not support')) {
          userMessage = t.payment.networkConfigError;
        } else if (error.message.includes('HTTP error! status: 400')) {
          userMessage = t.payment.unableToPrepare;
        } else if (error.message.includes('Failed to create invoice on blockchain')) {
          userMessage = t.payment.unableToCreateBlockchain;
        } else if (error.message.includes('Failed to get blockchain status')) {
          userMessage = t.payment.unableToVerifyStatus;
        } else {
          userMessage = error.message;
        }
      }
      
      onError?.(userMessage);
    }
  }, [invoiceId, paymentOptions, isConnected, address, chainId, onError, getNetworkName, hasSufficientBalance, t]);

  const handleAuthorize = useCallback(async () => {
    console.log('🔐 ===== AUTHORIZE START =====');
    console.log('🔐 Selected Token:', selectedToken);
    console.log('🔐 Is Connected:', isConnected);
    console.log('🔐 Address:', address);
    console.log('🔐 Chain ID:', chainId);
    console.log('🔐 Wallet Client:', !!walletClient);
    console.log('🔐 Public Client:', !!publicClient);
    console.log('🔐 Window Ethereum:', !!window.ethereum);
    console.log('🔐 User Agent:', navigator.userAgent);
    console.log('🔐 ==========================');
    
    if (!isConnected || !address || !chainId || !selectedToken) {
      console.error('❌ Missing required data for authorization');
      console.error('❌ Is Connected:', isConnected);
      console.error('❌ Address:', address);
      console.error('❌ Chain ID:', chainId);
      console.error('❌ Selected Token:', selectedToken);
      onError?.('Please connect your wallet and select a token');
      return;
    }

    setButtonState('approving');

    let tokenConfig: any = null;
    
    try {
      const networkName = getNetworkName(chainId);
      console.log('🌐 Network Name:', networkName);
      console.log('🌐 Chain ID:', chainId);
      console.log('🌐 Expected Chain ID for Alfajores: 44787');
      
      // Verify we're on the correct network
      if (chainId !== 44787) {
        console.error('❌ Wrong network detected');
        console.error('❌ Current Chain ID:', chainId);
        console.error('❌ Expected Chain ID: 44787');
        
        // Get more detailed network info
        try {
          const currentChainId = await walletClient?.request({ method: 'eth_chainId' });
          const accounts = await walletClient?.request({ method: 'eth_accounts' });
          console.log('🔍 Detailed Network Info:');
          console.log('   - Chain ID from wallet:', currentChainId);
          console.log('   - Connected accounts:', accounts);
          console.log('   - Chain ID from app:', chainId);
          console.log('   - Is connected:', isConnected);
        } catch (error) {
          console.error('❌ Error getting network details:', error);
        }
        
        // Show network switch option instead of creating button dynamically
        setButtonState('ready');
        setShowNetworkSwitch(true);
        onError?.('Red incorrecta detectada. Por favor, cambia a Celo Alfajores en tu wallet.');
        
        return;
      }
      
      // Hide network switch if we're on the correct network
      setShowNetworkSwitch(false);
      
      // Get token configuration
      const networkTokens = TOKENS[networkName as keyof typeof TOKENS];
      if (!networkTokens) {
        throw new Error('Unsupported network');
      }

      // Find token config by symbol (case-insensitive)
      tokenConfig = Object.values(networkTokens).find(
        token => token.symbol.toLowerCase() === selectedToken.toLowerCase()
      );
      if (!tokenConfig) {
        throw new Error('Unsupported token');
      }

      // Create provider and signer using Wagmi
      if (!walletClient) {
        throw new Error('No wallet client available');
      }
      
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      // Get payment option for selected token
      const paymentOption = paymentOptions.find(option => option.token === selectedToken);
      if (!paymentOption) {
        throw new Error('Payment option not found for selected token');
      }

      const networkContracts = CONTRACTS[networkName as keyof typeof CONTRACTS];
      if (!networkContracts) {
        throw new Error('Network contracts not found');
      }

      // Create token contract instance
      const tokenContract = new ethers.Contract(
        tokenConfig.address,
        [
          'function approve(address spender, uint256 amount) external returns (bool)',
          'function allowance(address owner, address spender) external view returns (uint256)',
          'function balanceOf(address account) external view returns (uint256)',
          'function decimals() external view returns (uint8)',
          'function symbol() external view returns (string)',
        ],
        signer
      );

      // Verify contract is working
      try {
        console.log('🔍 Verifying contract accessibility...');
        console.log('🔍 Contract Address:', tokenConfig.address);
        console.log('🔍 Network Name:', networkName);
        
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        console.log('✅ Contract verification successful');
        console.log('✅ Token Symbol:', symbol);
        console.log('✅ Token Decimals:', decimals);
      } catch (contractError) {
        console.error('❌ Contract verification failed:', contractError);
        console.error('❌ Error details:', {
          message: contractError instanceof Error ? contractError.message : 'Unknown error',
          code: contractError && typeof contractError === 'object' && 'code' in contractError ? contractError.code : 'No code',
          data: contractError && typeof contractError === 'object' && 'data' in contractError ? contractError.data : 'No data'
        });
        throw new Error('Token contract not accessible');
      }

      // Check if approval is needed
      console.log('🔍 Checking allowance...');
      const allowance = await tokenContract.allowance(address, networkContracts.DERAMP_PROXY);
      const requiredAmount = ethers.parseUnits(paymentOption.amount, tokenConfig.decimals);

      console.log('📊 Allowance:', ethers.formatUnits(allowance, tokenConfig.decimals), 'Required:', ethers.formatUnits(requiredAmount, tokenConfig.decimals));

      if (allowance < requiredAmount) {
        // Approve token
        console.log('🔄 Sending approval transaction...');
        console.log('🔄 Approving spender (DERAMP_PROXY):', networkContracts.DERAMP_PROXY);
        console.log('🔄 To spend amount:', ethers.formatUnits(requiredAmount, tokenConfig.decimals));
        
        try {
          const approveTx = await tokenContract.approve(
            networkContracts.DERAMP_PROXY,
            requiredAmount
          );
          
          console.log('📊 Transaction hash:', approveTx.hash);
          console.log('⏳ Waiting for confirmation...');
          
          // Store the transaction hash for the useEffect to monitor
          setPendingTxHash(approveTx.hash);
          
          // Don't wait here, let the useEffect handle the confirmation
          console.log('✅ Approval transaction sent, monitoring for confirmation...');
          
        } catch (approvalError) {
          console.error('❌ Approval transaction failed:', approvalError);
          setPendingTxHash(''); // Clear pending hash
          setButtonState('ready'); // Reset to ready state
          
          // Log detailed error information in one line for easy copying
          console.log('🔍 ===== COMPLETE ERROR FOR COPYING =====');
          console.log('🔍 Error:', JSON.stringify(approvalError, null, 2));
          console.log('🔍 ===========================================');
          
          // For other errors, re-throw
          throw approvalError;
        }
      } else {
        // Allowance is already sufficient, skip approval
        setButtonState('confirm');
        return;
      }
    } catch (error) {
      console.error('Error in handleAuthorize:', error);
      setButtonState('ready');
      setPendingTxHash(''); // Clear pending hash
      
      // Provide user-friendly error messages
      let userMessage = t.payment.tokenAuthFailed;
      
      if (error instanceof Error) {
        if (error.message.includes('Unsupported token')) {
          userMessage = t.payment.tokenNotSupported;
        } else if (error.message.includes('Unsupported network')) {
          userMessage = t.payment.networkNotSupported;
        } else if (error.message.includes('No Ethereum provider found')) {
          userMessage = t.payment.walletNotFound;
        } else if (error.message.includes('Payment option not found')) {
          userMessage = t.payment.paymentOptionNotFound;
        } else {
          userMessage = error.message;
        }
      }
      
      onError?.(userMessage);
    }
  }, [selectedToken, paymentOptions, isConnected, address, chainId, onError, getNetworkName, t]);

  const handleConfirm = useCallback(async () => {
    if (!isConnected || !address || !chainId || !selectedToken) {
      onError?.('Please connect your wallet and select a token');
      return;
    }

    setButtonState('processing');

    try {
      const networkName = getNetworkName(chainId);
      
      // Get token configuration
      const networkTokens = TOKENS[networkName as keyof typeof TOKENS];
      if (!networkTokens) {
        throw new Error('Unsupported network');
      }

      // Find token config by symbol (case-insensitive)
      const tokenConfig = Object.values(networkTokens).find(
        token => token.symbol.toLowerCase() === selectedToken.toLowerCase()
      );
      if (!tokenConfig) {
        throw new Error('Unsupported token');
      }

      // Get payment option for selected token
      const paymentOption = paymentOptions.find(option => option.token === selectedToken);
      if (!paymentOption) {
        throw new Error('Payment option not found for selected token');
      }

      const networkContracts = CONTRACTS[networkName as keyof typeof CONTRACTS];
      if (!networkContracts) {
        throw new Error('Network contracts not found');
      }

      // Create provider and signer using Wagmi
      if (!walletClient) {
        throw new Error('No wallet client available');
      }
      
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      // Import the full ABI from the JSON file
      const derampProxyAbi = (await import('../blockchain/abi/DerampProxy.json')).abi;
      
      // Create DerampProxy contract instance with full ABI
      const derampProxyContract = new ethers.Contract(
        networkContracts.DERAMP_PROXY,
        derampProxyAbi,
        signer
      );

      // Convert invoiceId to bytes32 using ethers.id (same as backend)
      const invoiceIdBytes32 = ethers.id(invoiceId);
      
      // Parse amount to wei (the contract expects wei, not decimal units)
      const amount = ethers.parseUnits(paymentOption.amount, tokenConfig.decimals);

      // Check if invoice exists first by calling a view function
      try {
        // Let's also check the blockchain status again to make sure the invoice exists
        const statusCheck = await BlockchainService.getStatus(invoiceId, networkName);
        
        if (!statusCheck.success || !statusCheck.data.exists) {
          throw new Error('Invoice does not exist in blockchain');
        }
        
        if (statusCheck.data.status !== 'pending') {
          throw new Error(`Invoice is not in pending status: ${statusCheck.data.status}`);
        }
        
        // Check allowance again before payment
        const tokenContract = new ethers.Contract(
          tokenConfig.address,
          [
            'function allowance(address owner, address spender) external view returns (uint256)',
          ],
          provider
        );
        
        const allowance = await tokenContract.allowance(address, networkContracts.DERAMP_PROXY);
        
        if (allowance < amount) {
          throw new Error('Insufficient allowance. Please approve tokens first.');
        }
        
      } catch (error) {
        throw error;
      }

      // Call payInvoice directly on the contract
      const payTx = await derampProxyContract.payInvoice(
        invoiceIdBytes32,
        tokenConfig.address,
        amount,
        {
          gasLimit: 500000,
          value: 0
        }
      );

      // Wait for transaction confirmation
      const receipt = await payTx.wait();

      if (receipt && receipt.status === 1) {
        // Payment successful - try to update backend with payment data and status
        try {
          const paymentData = {
            paid_token: tokenConfig.address,
            paid_network: networkName,
            paid_tx_hash: payTx.hash,
            wallet_address: address,
            paid_amount: parseFloat(paymentOption.amount) // Convert to number as backend expects
          };
          
          // Update payment data
          await BlockchainService.updatePaymentData(invoiceId, paymentData);
          
          // Update invoice status to "paid"
          await BlockchainService.updateInvoiceStatus(invoiceId, 'paid');
          
        } catch (backendError: any) {
          // Don't fail the entire process if backend update fails
        }
        
        // Call success callback
        onSuccess?.();
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      console.error('Error in handleConfirm:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        data: error.data,
        transaction: error.transaction,
        receipt: error.receipt
      });
      
      // Check if user cancelled the transaction
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        setButtonState('confirm');
        alert(t.payment.paymentCancelled);
      } else {
        setButtonState('confirm');
        
        // Provide user-friendly error messages
        let userMessage = t.payment.paymentFailed;
        
        if (error.message) {
          if (error.message.includes('insufficient allowance')) {
            userMessage = t.payment.tokenAuthRequired;
          } else if (error.message.includes('transaction execution reverted')) {
            userMessage = t.payment.transactionFailed;
          } else if (error.message.includes('insufficient balance')) {
            userMessage = t.payment.insufficientBalance;
          } else if (error.message.includes('network')) {
            userMessage = t.payment.networkIssue;
          } else if (error.message.includes('Failed to fetch')) {
            userMessage = t.payment.connectionIssue;
          } else {
            userMessage = error.message;
          }
        }
        
        onError?.(userMessage);
      }
    }
  }, [selectedToken, paymentOptions, isConnected, address, chainId, onError, onSuccess, getNetworkName, language, t]);

  const handleButtonClick = useCallback(() => {
    switch (buttonState) {
      case 'initial':
        handlePayNow();
        break;
      case 'ready':
        handleAuthorize();
        break;
      case 'confirm':
        handleConfirm();
        break;
      default:
        // Do nothing for loading/approving/processing states
        break;
    }
  }, [buttonState, handlePayNow, handleAuthorize, handleConfirm]);

  const isButtonDisabled = buttonState === 'loading' || buttonState === 'approving' || buttonState === 'processing';

  return {
    buttonState,
    buttonText: getButtonText(buttonState, selectedToken),
    isButtonDisabled,
    handleButtonClick,
    selectedToken,
    showNetworkSwitch,
  };
}; 