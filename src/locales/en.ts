export const en = {
  // Status
  status: {
    pending: 'Pending',
    paid: 'Paid',
    expired: 'Expired',
    refunded: 'Refunded'
  },
  
  // General
  general: {
    loading: 'Loading...',
    error: 'Error',
    connect: 'Connect',
    disconnect: 'Disconnect',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    copy: 'Copy',
    copied: 'Copied!',
    copiedMessage: 'Link copied to clipboard'
  },

  // Header
  header: {
    orderNumber: 'Order #',
    logo: 'Voulti'
  },

  // Order Information
  order: {
    title: 'Order details',
    orderId: 'Order ID',
    totalToPay: 'Total amount',
    timeRemaining: 'Time left',
    pageTitle: 'Complete your payment',
    pageDescription: 'Select your preferred payment method and complete the transaction.',
    blockchainTransaction: 'Blockchain Transaction',
    viewOnExplorer: 'View on explorer 🔗'
  },

  // Payment
  payment: {
    method: 'Payment Method',
    selectToken: 'Token',
    selectTokenPlaceholder: 'Select Token',
    selectNetwork: 'Select Network',
    network: 'Network',
    connectWallet: 'Connect Wallet',
    connectWalletDescription: 'Connect your wallet to continue with payment',
    makePayment: 'Pay Now',
    preparing: 'Preparing your payment...',
    authorize: 'Authorize {token}',
    authorizing: 'Authorizing {token}...',
    confirm: 'Confirm Payment',
    processing: 'Processing payment...',
    completed: 'Payment Completed!',
    completedDescription: 'This order has been paid successfully.',
    expired: 'Order Expired',
    expiredDescription: 'This order has expired and can no longer be paid.',
    refunded: 'Payment Refunded',
    refundedDescription: 'This order has been refunded successfully.',
    amountToPay: 'Payment Amount',
    price: '{symbol} Price',
    lastUpdated: 'Updated {time}',
    dateNotAvailable: 'Date not available',
    paymentCancelled: 'Payment cancelled. You can try again.',
    // Error messages
    networkConfigError: 'Network configuration issue. Please try again or contact support.',
    unableToPrepare: 'Unable to prepare payment. Please try again.',
    unableToCreateBlockchain: 'Unable to create payment on blockchain. Please try again.',
    unableToVerifyStatus: 'Unable to verify payment status. Please try again.',
    tokenAuthRequired: 'Token authorization required. Please authorize tokens first.',
    transactionFailed: 'Payment transaction failed. Please try again.',
    insufficientBalance: 'Insufficient balance. Please check your wallet.',
    networkIssue: 'Network issue. Please check your connection and try again.',
    connectionIssue: 'Connection issue. Please check your internet and try again.',
    tokenNotSupported: 'Selected token is not supported. Please choose another token.',
    networkNotSupported: 'Selected network is not supported. Please choose another network.',
    walletNotFound: 'Wallet not found. Please connect your wallet first.',
    paymentOptionNotFound: 'Payment option not available. Please try again.',
    tokenAuthFailed: 'Token authorization failed. Please try again.',
    paymentFailed: 'Payment failed. Please try again.',
  },

  // Balance
  balance: {
    label: 'Balance:',
    insufficient: 'Insufficient Balance',
    insufficientDescription: 'You need {required} {symbol} but only have {current} {symbol}',
    noFunds: '(No funds)',
    notAvailable: 'Balance not available',
    loading: 'Loading balance...',
    error: 'Error loading balance'
  },

  // Network
  network: {
    unsupported: 'Unsupported Network',
    switching: 'Switching network...',
    switchError: 'Error switching network',
    changeTokenNetwork: 'Change token/network above'
  },

  // Countdown
  countdown: {
    timeRemaining: 'Time left:',
    expired: 'Order Expired',
    hours: 'h',
    minutes: 'm',
    seconds: 's'
  },

  // Tokens
  tokens: {
    buy: 'Buy {symbol}',
    buyingSoon: 'Function to buy {symbol} coming soon'
  },

  // Networks
  networks: {
    network: 'network',
    networks: 'networks'
  },

  // Footer
  footer: {
    builtWithLove: 'Built with ❤️ by'
  },

  // Features
  features: {
    noSetupFees: 'No setup fees',
    instantSettlement: 'Instant settlement',
    globalReach: 'Global reach'
  },

  // Commerce
  commerce: {
    title: 'Pay with crypto at {name}',
    subtitle: 'Make your payment securely at {name} using crypto with Voulti.',
    amountLabel: 'Enter the amount to pay',
    amountPlaceholder: '0',
    generateButton: 'Continue',
    generating: 'Generating...',
    amountRequired: 'Please enter a valid amount',
    amountMin: 'Amount must be at least {min} {currency}',
    amountMax: 'Amount cannot exceed {max} {currency}',
    createInvoiceError: 'Failed to create invoice',
    networkError: 'Network error. Please check your connection and try again.',
    minimum: 'Minimum',
    maximum: 'Maximum',
    supportedTokens: 'Supported tokens'
  },

  // Home
  home: {
    heroTitle: '💸 Crypto payments made simple for merchants',
    heroSubtitle: 'Accept crypto payments anywhere: in-store or online. No middlemen. Only 1% fee.',
    ctaButton: 'Try the Demo Now',
    subcopy: 'Supports cCOP, cUSD, cEUR and more coming soon.',
    howItWorksTitle: '🚀 How it works',
    step1Title: 'Generate a payment link',
    step1Description: 'Create a unique payment link from the API or dashboard.',
    step2Title: 'Display or share it',
    step2Description: 'Display the QR code at your store or share the link online.',
    step3Title: 'Receive crypto payments',
    step3Description: 'Get paid instantly. No middlemen. Only 1% fee.',
    tagline: 'The easiest way to accept crypto. Anywhere.',
    whyChooseTitle: 'Why merchants choose Voulti?',
    whyChoose: {
      instantPayments: {
        title: 'Get paid instantly',
        description: 'Receive payments instantly, no waiting or intermediaries.'
      },
      lowFees: {
        title: 'Low fees, no surprises',
        description: 'Only 1% fee. No hidden costs or custody.'
      },
      realWorld: {
        title: 'Designed for the real world',
        description: 'Perfect for physical stores, online sales and custom APIs.'
      }
    }
  },

  // Demo
  demo: {
    title: 'Discover all the ways to use Voulti',
    subtitle: 'Understand how Voulti enables crypto payments in physical stores, online, and custom systems.',
    inStore: {
      title: 'Receive crypto payments at your physical store',
      description: 'Display this QR code at checkout to receive instant payments in cryptocurrencies.',
      cta: 'Try this',
      demoTitle: 'QR Code Demo',
      demoDescription: 'Imagine this QR displayed at a physical store\'s checkout.',
      demoCta: 'Scan QR and continue',
      downloadCta: 'Download QR Code'
    },
    online: {
      title: 'Receive crypto payments online',
      description: 'Share a payment link with your customers via social media or email to receive instant payments in cryptocurrencies.',
      cta: 'Try this',
      demoTitle: 'Online Payment Link',
      demoDescription: 'Merchants can share this payment link directly with customers online.',
      demoCta: 'Open Payment Link'
    },
    api: {
      title: 'Integrate crypto payments into your systems',
      description: 'Use Voulti\'s API to accept crypto payments directly in your website, app, or point-of-sale system.',
      cta: 'View API Docs',
      demoTitle: 'API Integration',
      demoDescription: 'Example API call to create an invoice:',
      demoCta: 'View API Docs (Coming Soon)',
      step1Title: 'Step 1: Make a request for an invoice',
      step1Description: 'Send a POST request to Voulti\'s API to create a new invoice.',
      step2Title: 'Step 2: Get the invoice ID from the response',
      step2Description: 'The API will return an id for the created invoice.',
      step3Title: 'Step 3: Redirect your client to the checkout page',
      step3Description: 'Send your customer to the checkout link returned in the API response to complete the payment.',
      step3Example: '🌐 Example:',
      note: '📢 If you\'ve set up confirmation and response URLs, Voulti will notify your confirmation URL when the payment is completed and redirect the user to your response URL.'
    }
  },

  // Errors
  errors: {
    invoiceNotFound: 'This order does not exist or has been deleted.',
    commerceNotFound: 'This commerce does not exist or has been deleted.',
    networkError: 'Network error. Please check your connection and try again.',
    serverError: 'Server error. Please try again later.',
    unknownError: 'An unexpected error occurred. Please try again.',
    configError: 'Backend configuration error'
  },

  // QR Code
  qrCode: {
    header: 'Pay with Crypto',
    subtitle: 'at Trutix'
  },

  // Powered by
  poweredBy: '⚡ Powered by',

  // Network
  network: {
    status: 'Network Status',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    refreshNetwork: 'Refresh Network',
    lastRefresh: 'Last refresh',
    switching: 'Switching...',
    switchTo: 'Switch to',
    connected: 'Connected to correct network',
    wrongNetwork: 'Wrong network detected',
    networkSwitchError: 'Error switching network',
    networkSwitchSuccess: 'Network switched successfully',
    detecting: 'Detecting network...'
  },

  // Wallet
  wallet: {
    connectFirst: 'Connect your wallet first',
    connectDescription: 'You need to connect your wallet to continue with the payment',
    wrongNetwork: 'Wrong network detected',
    switchNetworkDescription: 'You need to switch to the correct network to continue',
    readyToPay: 'Ready to pay',
    connectedToCorrectNetwork: 'Wallet connected and on correct network',
    disconnect: 'Disconnect',
    connectedAddress: 'Address',
    connect: 'Connect Wallet',
    connecting: 'Connecting...',
    browserExtensions: 'Browser Extensions',
    mobileWallets: 'Mobile Wallets',
    installWallet: 'Install Wallet'
  }
}; 