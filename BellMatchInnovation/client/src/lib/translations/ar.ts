export const arTranslations = {
  common: {
    // Navigation
    dashboard: "لوحة القيادة",
    rfqs: "طلبات عروض الأسعار",
    suppliers: "الموردين",
    wallet: "المحفظة",
    settings: "الإعدادات",
    voiceRfq: "طلب صوتي",
    videoRfq: "طلب فيديو",
    riskScoring: "تقييم المخاطر",
    pricing: "التسعير",
    blockchainPayment: "دفع البلوكتشين",
    blockchainSimulator: "محاكي البلوكتشين",
    milestoneApproval: "الموافقة على المراحل",
    
    // Actions
    submit: "إرسال",
    cancel: "إلغاء",
    save: "حفظ",
    edit: "تعديل",
    delete: "حذف",
    approve: "موافقة",
    reject: "رفض",
    search: "بحث",
    filter: "تصفية",
    refresh: "تحديث",
    loading: "جاري التحميل...",
    processing: "جاري المعالجة...",
    
    // Status
    awaiting: "في الانتظار",
    notYet: "ليس بعد",
    of: "من",
    complete: "مكتمل",
    close: "إغلاق",
    noEvidenceProvided: "لم يتم تقديم أدلة.",
    
    // Common UI elements
    welcome: "مرحبًا بك في Bell24h",
    profile: "الملف الشخصي",
    logout: "تسجيل الخروج",
    notifications: "الإشعارات",
    messages: "الرسائل",
    language: "اللغة",
    theme: "السمة",
    dark: "داكن",
    light: "فاتح",
    system: "نظام",
    error: "خطأ",
    success: "نجاح",
    warning: "تحذير",
    info: "معلومات",
    
    // Time
    today: "اليوم",
    yesterday: "أمس",
    thisWeek: "هذا الأسبوع",
    thisMonth: "هذا الشهر",
    lastMonth: "الشهر الماضي",
    custom: "مخصص",
  },
  
  dashboard: {
    title: "لوحة القيادة",
    overview: "نظرة عامة",
    recentActivity: "النشاط الأخير",
    marketInsights: "نظرة على السوق",
    pendingApprovals: "الموافقات المعلقة",
    quickActions: "إجراءات سريعة",
    stats: {
      totalRfqs: "إجمالي طلبات عروض الأسعار",
      pendingRfqs: "طلبات عروض الأسعار المعلقة",
      completedRfqs: "طلبات عروض الأسعار المكتملة",
      activeSuppliers: "الموردين النشطين",
      walletBalance: "رصيد المحفظة",
      escrowBalance: "رصيد الضمان"
    },
    createRfq: "إنشاء طلب عرض سعر جديد",
    viewAll: "عرض الكل",
  },
  
  rfq: {
    title: "طلب عرض سعر",
    new: "طلب عرض سعر جديد",
    edit: "تعديل طلب عرض السعر",
    details: "تفاصيل طلب عرض السعر",
    voice: "طلب عرض سعر صوتي",
    video: "طلب عرض سعر بالفيديو",
    status: {
      draft: "مسودة",
      submitted: "مقدم",
      inProgress: "قيد التنفيذ",
      completed: "مكتمل",
      canceled: "ملغى"
    },
    form: {
      title: "العنوان",
      description: "الوصف",
      category: "الفئة",
      quantity: "الكمية",
      budget: "الميزانية",
      deadline: "الموعد النهائي",
      attachments: "المرفقات",
      requirements: "المتطلبات",
      additionalInfo: "معلومات إضافية"
    },
    action: {
      record: "تسجيل",
      stopRecording: "إيقاف التسجيل",
      preview: "معاينة",
      upload: "رفع",
      process: "معالجة",
      submit: "تقديم طلب عرض السعر",
      save: "حفظ كمسودة"
    },
    voiceHelp: "انقر على تسجيل وتحدث عن تفاصيل طلب عرض السعر. ستقوم الذكاء الاصطناعي لدينا بمعالجة مدخلات صوتك.",
    videoHelp: "قم بتسجيل أو تحميل فيديو يصف متطلبات طلب عرض السعر الخاص بك."
  },
  
  suppliers: {
    title: "الموردين",
    matched: "الموردين المتطابقين",
    all: "جميع الموردين",
    verified: "الموردين المتحقق منهم",
    new: "موردين جدد",
    details: "تفاصيل المورد",
    actions: {
      contact: "التواصل",
      invite: "دعوة إلى طلب عرض سعر",
      view: "عرض الملف الشخصي",
      rate: "تقييم المورد"
    },
    stats: {
      rating: "التقييم",
      responseTime: "متوسط وقت الاستجابة",
      completionRate: "معدل الإكمال",
      disputeRate: "معدل النزاعات"
    },
    filters: {
      location: "الموقع",
      category: "الفئة",
      rating: "التقييم",
      verified: "المتحقق منهم فقط"
    }
  },
  
  wallet: {
    title: "المحفظة",
    balance: "الرصيد",
    transactions: "المعاملات",
    deposit: "إيداع",
    withdraw: "سحب",
    transfer: "تحويل",
    escrow: "الضمان",
    history: "سجل المعاملات",
    pending: "المعاملات المعلقة",
    blockchain: "محفظة البلوكتشين",
    connect: "ربط المحفظة",
    disconnect: "فصل المحفظة",
    address: "عنوان المحفظة",
    actions: {
      view: "عرض التفاصيل",
      export: "تصدير السجل",
      verify: "التحقق من المعاملة"
    }
  },
  
  blockchain: {
    title: "مدفوعات البلوكتشين",
    simulator: "محاكي البلوكتشين",
    walletTitle: "محفظة البلوكتشين",
    payment: "إنشاء دفعة",
    milestone: "دفعة المرحلة",
    transaction: {
      create: "إنشاء معاملة",
      fund: "تمويل المعاملة",
      release: "إطلاق الأموال",
      dispute: "نزاع المعاملة",
      resolve: "حل النزاع"
    },
    status: {
      pending: "معلق",
      completed: "مكتمل",
      funded: "ممول",
      released: "مُطلق",
      disputed: "متنازع عليه",
      resolved: "محلول"
    },
    wallet: {
      notConnected: "المحفظة غير متصلة",
      connectToApprove: "يرجى توصيل محفظتك للموافقة على المراحل",
      connectWallet: "توصيل المحفظة",
      connecting: "جاري الاتصال...",
      connected: "متصل",
      disconnect: "فصل",
      address: "عنوان المحفظة",
      balance: "الرصيد",
      noProvider: "لم يتم اكتشاف مزود المحفظة",
      installMetamask: "يرجى تثبيت MetaMask أو محفظة متوافقة أخرى",
      connectionError: "خطأ في اتصال المحفظة",
      connectionFailed: "فشل الاتصال بالمحفظة"
    },
    info: {
      securePayment: "مدفوعات البلوكتشين آمنة وشفافة وغير قابلة للتغيير. يتم تسجيل جميع المعاملات على البلوكتشين ولا يمكن تعديلها.",
      simulator: "يتيح لك المحاكي اختبار معاملات البلوكتشين دون استخدام العملات المشفرة الحقيقية."
    }
  },
  
  milestone: {
    title: "الموافقة على المراحل",
    progress: "تقدم المرحلة",
    completed: "مكتمل",
    pending: "معلق",
    in_progress: "قيد التنفيذ",
    approved: "موافق عليه",
    rejected: "مرفوض",
    released: "مُطلق",
    disputed: "متنازع عليه",
    paymentReleased: "تم إطلاق الدفعة للمرحلة \"{name}\" إلى المورد.",
    approvedMessage: "تمت الموافقة على المرحلة \"{name}\".",
    rejectedMessage: "تم رفض المرحلة \"{name}\".",
    approvalFailed: "فشلت الموافقة",
    rejectionFailed: "فشل الرفض",
    failedToApprove: "فشل الموافقة على المرحلة",
    failedToReject: "فشل رفض المرحلة",
    evidenceLabel: "دليل الإكمال",
    noMilestones: "لا توجد مراحل",
    noMilestonesDescription: "لا توجد مراحل محددة لهذا العقد.",
    loadingMilestones: "تحميل المراحل",
    pleaseWait: "يرجى الانتظار بينما نقوم بتحميل معلومات المرحلة...",
    walletConnectionRequired: "مطلوب اتصال المحفظة",
    connectWalletToViewMilestones: "يرجى توصيل محفظتك لعرض وإدارة المراحل",
    projectProgress: "تقدم المشروع",
    overallCompletion: "{progress}% مكتمل",
    milestones: "المراحل",
    milestonesForContract: "مراحل العقد",
    amount: "المبلغ",
    completionProof: "دليل الإكمال",
    viewProof: "عرض الدليل",
    approving: "جاري الموافقة...",
    releasing: "جاري الإطلاق...",
    releasePayment: "إطلاق الدفعة",
    dispute: "نزاع",
    approveMilestone: "الموافقة على المرحلة",
    approveMilestoneDescription: "يرجى تأكيد رغبتك في الموافقة على هذه المرحلة. بعد الموافقة، يمكن إطلاق الأموال للمورد.",
    confirmApproval: "تأكيد الموافقة",
    disputeMilestone: "نزاع المرحلة",
    disputeMilestoneDescription: "إذا كانت لديك مخاوف بشأن هذه المرحلة، يمكنك إنشاء نزاع. هذا سيتطلب وساطة للحل.",
    reasonForDispute: "سبب النزاع",
    enterDisputeReason: "يرجى شرح سبب نزاعك على هذه المرحلة...",
    submitDispute: "تقديم النزاع",
    disputeSubmitted: "تم تقديم النزاع",
    disputeSubmittedDescription: "تم تقديم نزاعك وستتم مراجعته من قبل فريقنا.",
    failedToDisputeMilestone: "فشل تقديم نزاع للمرحلة",
    milestoneApprovedSuccessfully: "تمت الموافقة على المرحلة بنجاح",
    paymentReleasedSuccessfully: "تم إطلاق الدفعة بنجاح",
    failedToReleasePayment: "فشل إطلاق الدفعة",
    rejection: {
      title: "رفض المرحلة",
      description: "يرجى تقديم سبب لرفض هذه المرحلة. هذا سينشئ نزاعًا على البلوكتشين.",
      reason: "سبب الرفض",
      placeholder: "يرجى شرح سبب عدم تلبية هذه المرحلة للمتطلبات...",
      reasonRequired: "مطلوب سبب الرفض",
      pleaseProvideReason: "يرجى تقديم سبب لرفض هذه المرحلة"
    },
    evidence: {
      title: "دليل إكمال المرحلة",
      description: "مراجعة الدليل المقدم لإكمال المرحلة."
    },
    actions: {
      approve: "الموافقة وإطلاق الأموال",
      reject: "رفض",
      viewEvidence: "عرض الدليل"
    }
  },
  
  settings: {
    title: "الإعدادات",
    profile: "إعدادات الملف الشخصي",
    notifications: "إعدادات الإشعارات",
    security: "إعدادات الأمان",
    payment: "إعدادات الدفع",
    language: "إعدادات اللغة",
    theme: "إعدادات السمة",
    account: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      company: "الشركة",
      role: "الدور",
      avatar: "صورة الملف الشخصي"
    },
    notifications: {
      rfq: "تحديثات طلبات عروض الأسعار",
      messages: "الرسائل",
      payments: "تحديثات الدفع",
      system: "إشعارات النظام"
    },
    security: {
      password: "تغيير كلمة المرور",
      twoFactor: "المصادقة ثنائية العامل",
      sessions: "الجلسات النشطة",
      devices: "الأجهزة المتصلة"
    }
  }
};