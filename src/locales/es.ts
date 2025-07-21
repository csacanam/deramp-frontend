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
    close: 'Cerrar',
    back: 'Volver',
    copy: 'Copiar',
    copied: '¡Copiado!',
    copiedMessage: 'Link copiado al portapapeles'
  },

  // Header
  header: {
    orderNumber: 'Pedido #',
    logo: 'Voulti'
  },

  // Order Information
  order: {
    title: 'Detalles del pedido',
    orderId: 'Número de Orden',
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
    preparing: 'Preparando tu pago...',
    authorize: 'Autorizar {token}',
    authorizing: 'Autorizando {token}...',
    confirm: 'Confirmar pago',
    processing: 'Procesando pago...',
    completed: '¡Pago completado!',
    completedDescription: 'Este pedido ha sido pagado exitosamente.',
    expired: 'Pedido expirado',
    expiredDescription: 'Este pedido ha expirado y ya no puede ser pagado.',
    refunded: 'Pago reembolsado',
    refundedDescription: 'Este pedido ha sido reembolsado exitosamente.',
    amountToPay: 'Importe a pagar',
    price: 'Precio {symbol}',
    lastUpdated: 'Actualizado {time}',
    dateNotAvailable: 'Fecha no disponible',
    paymentCancelled: 'Cancelaste el pago. Puede intentar de nuevo.',
    // Error messages
    networkConfigError: 'Problema de configuración de red. Intenta de nuevo o contacta soporte.',
    unableToPrepare: 'No se pudo preparar el pago. Intenta de nuevo.',
    unableToCreateBlockchain: 'No se pudo crear el pago en blockchain. Intenta de nuevo.',
    unableToVerifyStatus: 'No se pudo verificar el estado del pago. Intenta de nuevo.',
    tokenAuthRequired: 'Autorización de tokens requerida. Autoriza los tokens primero.',
    transactionFailed: 'La transacción de pago falló. Intenta de nuevo.',
    insufficientBalance: 'Saldo insuficiente. Revisa tu wallet.',
    networkIssue: 'Problema de red. Revisa tu conexión e intenta de nuevo.',
    connectionIssue: 'Problema de conexión. Revisa tu internet e intenta de nuevo.',
    tokenNotSupported: 'El token seleccionado no es compatible. Elige otro token.',
    networkNotSupported: 'La red seleccionada no es compatible. Elige otra red.',
    walletNotFound: 'Wallet no encontrada. Conecta tu wallet primero.',
    paymentOptionNotFound: 'Opción de pago no disponible. Intenta de nuevo.',
    tokenAuthFailed: 'Autorización de tokens falló. Intenta de nuevo.',
    paymentFailed: 'El pago falló. Intenta de nuevo.',
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
    builtWithLove: 'Hecho con ❤️ por'
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
    createInvoiceError: 'Error al crear el cobro',
    networkError: 'Error de red. Por favor verifica tu conexión e intenta de nuevo.',
    minimum: 'Mínimo',
    maximum: 'Máximo',
    supportedTokens: 'Tokens soportados'
  },

  // Home
  home: {
    heroTitle: '💸 Pagos con cripto simples para comercios',
    heroSubtitle: 'Acepta pagos en cripto en cualquier lugar: tienda física u online. Sin intermediarios. Solo 1% de comisión.',
    ctaButton: 'Probar el demo ahora',
    subcopy: 'Soportamos cCOP, cUSD, cEUR y más próximamente.',
    howItWorksTitle: '🚀 Cómo funciona',
    step1Title: 'Genera un link de pago',
    step1Description: 'Desde la API o el dashboard, crea un link único para tu comercio.',
    step2Title: 'Muéstralo o compártelo',
    step2Description: 'Pon el QR en tu tienda física o envía el link por chat a tus clientes.',
    step3Title: 'Recibe pagos en cripto',
    step3Description: 'Recibe el pago al instante. Sin intermediarios. Solo 1% de comisión.',
    tagline: 'La forma más fácil de aceptar cripto. En cualquier lugar.',
    whyChooseTitle: '¿Por qué los comercios eligen Voulti?',
    whyChoose: {
      instantPayments: {
        title: 'Recibe pagos al instante',
        description: 'Recibe pagos al instante, sin esperas ni intermediarios.'
      },
      lowFees: {
        title: 'Solo 1% de comisión',
        description: 'Solo 1% de comisión. Sin costos ocultos ni custodia.'
      },
      realWorld: {
        title: 'Diseñado para el mundo real',
        description: 'Perfecto para tiendas físicas, ventas online y APIs personalizadas.'
      }
    }
  },

  // Demo
  demo: {
    title: 'Descubre todas las formas de usar Voulti',
    subtitle: 'Entiende cómo Voulti habilita pagos con cripto en tiendas físicas, en línea y sistemas personalizados.',
    inStore: {
      title: 'Recibe pagos en cripto en tu tienda física',
      description: 'Muestra este código QR en tu caja y recibe pagos al instante en criptomonedas.',
      cta: 'Probar este',
      demoTitle: 'Demo de Código QR',
      demoDescription: 'Imagina este QR en la caja de un comercio.',
      demoCta: 'Escanear QR y continuar',
      downloadCta: 'Descargar Código QR'
    },
    online: {
      title: 'Recibe pagos en cripto en línea',
      description: 'Comparte un link de pago con tus clientes por redes sociales o correo para recibir pagos al instante en criptomonedas.',
      cta: 'Probar este',
      demoTitle: 'Link de Pago Online',
      demoDescription: 'Los comercios pueden compartir este link directamente con sus clientes en línea.',
      demoCta: 'Abrir Link de Pago'
    },
    api: {
      title: 'Integra pagos en cripto en tus sistemas',
      description: 'Usa la API de Voulti para aceptar pagos en cripto directamente en tu sitio web, app o sistema de punto de venta.',
      cta: 'Ver documentación API',
      demoTitle: 'Integración API',
      demoDescription: 'Ejemplo de llamada API para crear una factura:',
      demoCta: 'Ver documentación API (Próximamente)',
      step1Title: 'Paso 1: Haz una solicitud para un cobro',
      step1Description: 'Envía una solicitud POST a la API de Voulti para crear un nuevo cobro.',
      step2Title: 'Paso 2: Obtén el ID del cobro desde la respuesta',
      step2Description: 'La API devolverá un id para el cobro creado.',
      step3Title: 'Paso 3: Redirige a tu cliente a la página de checkout',
      step3Description: 'Envía a tu cliente al link de checkout devuelto en la respuesta de la API para completar el pago.',
      step3Example: '🌐 Ejemplo:',
      note: '📢 Si configuraste las URLs de confirmación y respuesta, Voulti notificará a la URL de confirmación cuando se complete el pago y redirigirá al usuario a la URL de respuesta.'
    }
  },

  // Errors
  errors: {
    invoiceNotFound: 'Este cobro no existe o ha sido eliminado.',
    commerceNotFound: 'Este comercio no existe o ha sido eliminado.',
    networkError: 'Error de red. Por favor verifica tu conexión e intenta de nuevo.',
    serverError: 'Error del servidor. Por favor intenta más tarde.',
    unknownError: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
    configError: 'Error de configuración del backend'
  },

  // QR Code
  qrCode: {
    header: 'Paga con Cripto',
    subtitle: 'en Trutix'
  }
}; 