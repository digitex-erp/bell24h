export const esTranslations = {
  common: {
    // Navigation
    dashboard: "Panel de Control",
    rfqs: "Solicitudes de Cotización",
    suppliers: "Proveedores",
    wallet: "Billetera",
    settings: "Configuración",
    voiceRfq: "RFQ por Voz",
    videoRfq: "RFQ por Video",
    riskScoring: "Evaluación de Riesgo",
    pricing: "Precios",
    blockchainPayment: "Pago Blockchain",
    blockchainSimulator: "Simulador Blockchain",
    milestoneApproval: "Aprobación de Hitos",
    
    // Actions
    submit: "Enviar",
    cancel: "Cancelar",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
    approve: "Aprobar",
    reject: "Rechazar",
    search: "Buscar",
    filter: "Filtrar",
    refresh: "Actualizar",
    loading: "Cargando...",
    processing: "Procesando...",
    
    // Status
    awaiting: "Esperando",
    notYet: "Aún no",
    of: "de",
    complete: "Completo",
    close: "Cerrar",
    noEvidenceProvided: "No se proporcionó evidencia.",
    
    // Common UI elements
    welcome: "Bienvenido a Bell24h",
    profile: "Perfil",
    logout: "Cerrar Sesión",
    notifications: "Notificaciones",
    messages: "Mensajes",
    language: "Idioma",
    theme: "Tema",
    dark: "Oscuro",
    light: "Claro",
    system: "Sistema",
    error: "Error",
    success: "Éxito",
    warning: "Advertencia",
    info: "Información",
    
    // Time
    today: "Hoy",
    yesterday: "Ayer",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mes",
    lastMonth: "Mes Pasado",
    custom: "Personalizado",
  },
  
  dashboard: {
    title: "Panel de Control",
    overview: "Resumen",
    recentActivity: "Actividad Reciente",
    marketInsights: "Información del Mercado",
    pendingApprovals: "Aprobaciones Pendientes",
    quickActions: "Acciones Rápidas",
    stats: {
      totalRfqs: "Total de RFQs",
      pendingRfqs: "RFQs Pendientes",
      completedRfqs: "RFQs Completados",
      activeSuppliers: "Proveedores Activos",
      walletBalance: "Saldo de Billetera",
      escrowBalance: "Saldo en Custodia"
    },
    createRfq: "Crear Nueva RFQ",
    viewAll: "Ver Todo",
  },
  
  rfq: {
    title: "Solicitud de Cotización",
    new: "Nueva RFQ",
    edit: "Editar RFQ",
    details: "Detalles de RFQ",
    voice: "RFQ por Voz",
    video: "RFQ por Video",
    status: {
      draft: "Borrador",
      submitted: "Enviado",
      inProgress: "En Progreso",
      completed: "Completado",
      canceled: "Cancelado"
    },
    form: {
      title: "Título",
      description: "Descripción",
      category: "Categoría",
      quantity: "Cantidad",
      budget: "Presupuesto",
      deadline: "Fecha Límite",
      attachments: "Adjuntos",
      requirements: "Requisitos",
      additionalInfo: "Información Adicional"
    },
    action: {
      record: "Grabar",
      stopRecording: "Detener Grabación",
      preview: "Vista Previa",
      upload: "Subir",
      process: "Procesar",
      submit: "Enviar RFQ",
      save: "Guardar como Borrador"
    },
    voiceHelp: "Haga clic en grabar y hable sobre los detalles de su RFQ. Nuestra IA procesará su entrada de voz.",
    videoHelp: "Grabe o suba un video describiendo los requisitos de su RFQ."
  },
  
  suppliers: {
    title: "Proveedores",
    matched: "Proveedores Coincidentes",
    all: "Todos los Proveedores",
    verified: "Proveedores Verificados",
    new: "Nuevos Proveedores",
    details: "Detalles del Proveedor",
    actions: {
      contact: "Contactar",
      invite: "Invitar a RFQ",
      view: "Ver Perfil",
      rate: "Calificar Proveedor"
    },
    stats: {
      rating: "Calificación",
      responseTime: "Tiempo de Respuesta Promedio",
      completionRate: "Tasa de Finalización",
      disputeRate: "Tasa de Disputas"
    },
    filters: {
      location: "Ubicación",
      category: "Categoría",
      rating: "Calificación",
      verified: "Solo Verificados"
    }
  },
  
  wallet: {
    title: "Billetera",
    balance: "Saldo",
    transactions: "Transacciones",
    deposit: "Depositar",
    withdraw: "Retirar",
    transfer: "Transferir",
    escrow: "Custodia",
    history: "Historial de Transacciones",
    pending: "Transacciones Pendientes",
    blockchain: "Billetera Blockchain",
    connect: "Conectar Billetera",
    disconnect: "Desconectar Billetera",
    address: "Dirección de Billetera",
    actions: {
      view: "Ver Detalles",
      export: "Exportar Historial",
      verify: "Verificar Transacción"
    }
  },
  
  blockchain: {
    title: "Pagos Blockchain",
    simulator: "Simulador Blockchain",
    walletTitle: "Billetera Blockchain",
    payment: "Crear Pago",
    milestone: "Pago por Hito",
    transaction: {
      create: "Crear Transacción",
      fund: "Financiar Transacción",
      release: "Liberar Fondos",
      dispute: "Disputar Transacción",
      resolve: "Resolver Disputa"
    },
    status: {
      pending: "Pendiente",
      completed: "Completado",
      funded: "Financiado",
      released: "Liberado",
      disputed: "En Disputa",
      resolved: "Resuelto"
    },
    wallet: {
      notConnected: "Billetera no conectada",
      connectToApprove: "Por favor conecte su billetera para aprobar hitos",
      connectWallet: "Conectar Billetera",
      connecting: "Conectando...",
      connected: "Conectado",
      disconnect: "Desconectar",
      address: "Dirección de Billetera",
      balance: "Saldo",
      noProvider: "No se detectó proveedor de billetera",
      installMetamask: "Por favor instale MetaMask u otra billetera compatible",
      connectionError: "Error de conexión de billetera",
      connectionFailed: "Error al conectar con la billetera"
    },
    info: {
      securePayment: "Los pagos Blockchain son seguros, transparentes e inmutables. Todas las transacciones se registran en la blockchain y no pueden ser alteradas.",
      simulator: "El simulador le permite probar transacciones blockchain sin usar criptomoneda real."
    }
  },
  
  milestone: {
    title: "Aprobación de Hitos",
    progress: "Progreso del Hito",
    completed: "Completado",
    pending: "Pendiente",
    in_progress: "En Progreso",
    approved: "Aprobado",
    rejected: "Rechazado",
    released: "Liberado",
    disputed: "En Disputa",
    paymentReleased: "El pago para el hito \"{name}\" ha sido liberado al proveedor.",
    approvedMessage: "El hito \"{name}\" ha sido aprobado.",
    rejectedMessage: "El hito \"{name}\" ha sido rechazado.",
    approvalFailed: "Aprobación Fallida",
    rejectionFailed: "Rechazo Fallido",
    failedToApprove: "Error al aprobar el hito",
    failedToReject: "Error al rechazar el hito",
    evidenceLabel: "Evidencia de Finalización",
    noMilestones: "No Hay Hitos",
    noMilestonesDescription: "No hay hitos definidos para este contrato.",
    loadingMilestones: "Cargando Hitos",
    pleaseWait: "Por favor espere mientras cargamos la información del hito...",
    walletConnectionRequired: "Se Requiere Conexión de Billetera",
    connectWalletToViewMilestones: "Por favor conecte su billetera para ver y gestionar hitos",
    projectProgress: "Progreso del Proyecto",
    overallCompletion: "{progress}% Completo",
    milestones: "Hitos",
    milestonesForContract: "Hitos para Contrato",
    amount: "Monto",
    completionProof: "Prueba de Finalización",
    viewProof: "Ver Prueba",
    approving: "Aprobando...",
    releasing: "Liberando...",
    releasePayment: "Liberar Pago",
    dispute: "Disputar",
    approveMilestone: "Aprobar Hito",
    approveMilestoneDescription: "Por favor confirme que desea aprobar este hito. Una vez aprobado, los fondos pueden ser liberados al proveedor.",
    confirmApproval: "Confirmar Aprobación",
    disputeMilestone: "Disputar Hito",
    disputeMilestoneDescription: "Si tiene preocupaciones sobre este hito, puede crear una disputa. Esto requerirá mediación para resolverse.",
    reasonForDispute: "Motivo de la Disputa",
    enterDisputeReason: "Por favor explique por qué está disputando este hito...",
    submitDispute: "Enviar Disputa",
    disputeSubmitted: "Disputa Enviada",
    disputeSubmittedDescription: "Su disputa ha sido enviada y será revisada por nuestro equipo.",
    failedToDisputeMilestone: "Error al enviar disputa para el hito",
    milestoneApprovedSuccessfully: "El hito ha sido aprobado exitosamente",
    paymentReleasedSuccessfully: "El pago ha sido liberado exitosamente",
    failedToReleasePayment: "Error al liberar el pago",
    rejection: {
      title: "Rechazar Hito",
      description: "Por favor proporcione un motivo para rechazar este hito. Esto creará una disputa en la blockchain.",
      reason: "Motivo del rechazo",
      placeholder: "Por favor explique por qué este hito no cumple con los requisitos...",
      reasonRequired: "Se Requiere Motivo de Rechazo",
      pleaseProvideReason: "Por favor proporcione un motivo para rechazar este hito"
    },
    evidence: {
      title: "Evidencia de Finalización del Hito",
      description: "Revise la evidencia proporcionada para la finalización del hito."
    },
    actions: {
      approve: "Aprobar y Liberar Fondos",
      reject: "Rechazar",
      viewEvidence: "Ver Evidencia"
    }
  },
  
  settings: {
    title: "Configuración",
    profile: "Configuración de Perfil",
    notifications: "Configuración de Notificaciones",
    security: "Configuración de Seguridad",
    payment: "Configuración de Pago",
    language: "Configuración de Idioma",
    theme: "Configuración de Tema",
    account: {
      name: "Nombre",
      email: "Correo Electrónico",
      phone: "Teléfono",
      company: "Empresa",
      role: "Rol",
      avatar: "Imagen de Perfil"
    },
    notifications: {
      rfq: "Actualizaciones de RFQ",
      messages: "Mensajes",
      payments: "Actualizaciones de Pago",
      system: "Notificaciones del Sistema"
    },
    security: {
      password: "Cambiar Contraseña",
      twoFactor: "Autenticación de Dos Factores",
      sessions: "Sesiones Activas",
      devices: "Dispositivos Conectados"
    }
  }
};