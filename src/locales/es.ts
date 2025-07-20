export const es = {
  // Status
  status: {
    pending: 'Pendiente',
    paid: 'Pagado',
    expired: 'Expirado',
    refunded: 'Reembolsado'
  },
  
  // General
  general: {
    loading: 'Cargando...',
    error: 'Error',
    connect: 'Conectar',
    disconnect: 'Desconectar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar'
  },

  // Header
  header: {
    orderNumber: 'Pedido #'
  },

  // Order Information
  order: {
    title: 'Detalles del pedido',
    totalToPay: 'Importe total',
    timeRemaining: 'Tiempo restante',
    pageTitle: 'Completa tu pago',
    pageDescription: 'Selecciona tu método de pago preferido y completa la transacción.'
  },

  // Payment
  payment: {
    method: 'Método de pago',
    selectToken: 'Token',
    selectTokenPlaceholder: 'Seleccionar token',
    selectNetwork: 'Seleccionar red',
    network: 'Red',
    connectWallet: 'Conectar wallet',
    connectWalletDescription: 'Conecta tu wallet para continuar con el pago',
    makePayment: 'Pagar ahora',
    processing: 'Procesando...',
    completed: '¡Pago completado!',
    completedDescription: 'Este pedido ha sido pagado exitosamente.',
    expired: 'Pedido expirado',
    expiredDescription: 'Este pedido ha expirado y ya no puede ser pagado.',
    refunded: 'Pago reembolsado',
    refundedDescription: 'Este pedido ha sido reembolsado exitosamente.',
    amountToPay: 'Importe a pagar',
    price: 'Precio {symbol}',
    lastUpdated: 'Actualizado {time}',
    dateNotAvailable: 'Fecha no disponible'
  },

  // Balance
  balance: {
    label: 'Balance:',
    insufficient: 'Saldo insuficiente',
    insufficientDescription: 'Necesitas {required} {symbol} pero solo tienes {current} {symbol}',
    noFunds: '(Sin fondos)',
    notAvailable: 'Balance no disponible',
    loading: 'Cargando balance...',
    error: 'Error al cargar balance'
  },

  // Network
  network: {
    unsupported: 'Red no soportada',
    switching: 'Cambiando red...',
    switchError: 'Error al cambiar red',
    changeTokenNetwork: 'Cambiar token/red arriba'
  },

  // Countdown
  countdown: {
    timeRemaining: 'Tiempo restante:',
    expired: 'Pedido expirado',
    hours: 'h',
    minutes: 'm',
    seconds: 's'
  },

  // Tokens
  tokens: {
    buy: 'Comprar {symbol}',
    buyingSoon: 'Función para comprar {symbol} próximamente'
  },

  // Networks
  networks: {
    network: 'red',
    networks: 'redes'
  },

  // Footer
  footer: {
    poweredBy: 'Powered by',
    deRamp: 'Voulti'
  },

  // Commerce
  commerce: {
    title: 'Paga con cripto en {name}',
    subtitle: 'Realiza tu pago de forma segura usando {name} con Voulti.',
    amountLabel: 'Ingresa el valor a pagar',
    amountPlaceholder: '0',
    generateButton: 'Continuar',
    generating: 'Generando...',
    amountRequired: 'Por favor ingresa un monto válido',
    amountMin: 'El monto debe ser al menos {min} {currency}',
    amountMax: 'El monto no puede exceder {max} {currency}',
    createInvoiceError: 'Error al crear la factura',
    networkError: 'Error de red. Por favor verifica tu conexión e intenta de nuevo.',
    minimum: 'Mínimo',
    maximum: 'Máximo',
    supportedTokens: 'Tokens soportados'
  },

  // Errors
  errors: {
    invoiceNotFound: 'Este pedido no existe o ha sido eliminado.',
    commerceNotFound: 'Este comercio no existe o ha sido eliminado.',
    networkError: 'Error de red. Por favor verifica tu conexión e intenta de nuevo.',
    serverError: 'Error del servidor. Por favor intenta más tarde.',
    unknownError: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
    configError: 'Error de configuración del backend'
  }
}; 