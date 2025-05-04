export const zhTranslations = {
  common: {
    // Navigation
    dashboard: "仪表板",
    rfqs: "询价单",
    suppliers: "供应商",
    wallet: "钱包",
    settings: "设置",
    voiceRfq: "语音询价",
    videoRfq: "视频询价",
    riskScoring: "风险评分",
    pricing: "定价",
    blockchainPayment: "区块链支付",
    blockchainSimulator: "区块链模拟器",
    milestoneApproval: "里程碑审批",
    
    // Actions
    submit: "提交",
    cancel: "取消",
    save: "保存",
    edit: "编辑",
    delete: "删除",
    approve: "批准",
    reject: "拒绝",
    search: "搜索",
    filter: "筛选",
    refresh: "刷新",
    loading: "加载中...",
    processing: "处理中...",
    
    // Status
    awaiting: "等待中",
    notYet: "尚未",
    of: "的",
    complete: "完成",
    close: "关闭",
    noEvidenceProvided: "未提供证据。",
    
    // Common UI elements
    welcome: "欢迎来到Bell24h",
    profile: "个人资料",
    logout: "退出登录",
    notifications: "通知",
    messages: "消息",
    language: "语言",
    theme: "主题",
    dark: "深色",
    light: "浅色",
    system: "系统",
    error: "错误",
    success: "成功",
    warning: "警告",
    info: "信息",
    
    // Time
    today: "今天",
    yesterday: "昨天",
    thisWeek: "本周",
    thisMonth: "本月",
    lastMonth: "上月",
    custom: "自定义",
  },
  
  dashboard: {
    title: "仪表板",
    overview: "概览",
    recentActivity: "最近活动",
    marketInsights: "市场洞察",
    pendingApprovals: "待审批",
    quickActions: "快速操作",
    stats: {
      totalRfqs: "询价单总数",
      pendingRfqs: "待处理询价单",
      completedRfqs: "已完成询价单",
      activeSuppliers: "活跃供应商",
      walletBalance: "钱包余额",
      escrowBalance: "托管余额"
    },
    createRfq: "创建新询价单",
    viewAll: "查看全部",
  },
  
  rfq: {
    title: "询价单",
    new: "新询价单",
    edit: "编辑询价单",
    details: "询价单详情",
    voice: "语音询价单",
    video: "视频询价单",
    status: {
      draft: "草稿",
      submitted: "已提交",
      inProgress: "处理中",
      completed: "已完成",
      canceled: "已取消"
    },
    form: {
      title: "标题",
      description: "描述",
      category: "类别",
      quantity: "数量",
      budget: "预算",
      deadline: "截止日期",
      attachments: "附件",
      requirements: "要求",
      additionalInfo: "附加信息"
    },
    action: {
      record: "录制",
      stopRecording: "停止录制",
      preview: "预览",
      upload: "上传",
      process: "处理",
      submit: "提交询价单",
      save: "保存为草稿"
    },
    voiceHelp: "点击录制并口述您的询价单详情。我们的AI将处理您的语音输入。",
    videoHelp: "录制或上传描述您询价单需求的视频。"
  },
  
  suppliers: {
    title: "供应商",
    matched: "匹配的供应商",
    all: "所有供应商",
    verified: "已验证的供应商",
    new: "新供应商",
    details: "供应商详情",
    actions: {
      contact: "联系",
      invite: "邀请参与询价",
      view: "查看资料",
      rate: "评分供应商"
    },
    stats: {
      rating: "评分",
      responseTime: "平均响应时间",
      completionRate: "完成率",
      disputeRate: "争议率"
    },
    filters: {
      location: "位置",
      category: "类别",
      rating: "评分",
      verified: "仅已验证"
    }
  },
  
  wallet: {
    title: "钱包",
    balance: "余额",
    transactions: "交易",
    deposit: "存款",
    withdraw: "提款",
    transfer: "转账",
    escrow: "托管",
    history: "交易历史",
    pending: "待处理交易",
    blockchain: "区块链钱包",
    connect: "连接钱包",
    disconnect: "断开钱包",
    address: "钱包地址",
    actions: {
      view: "查看详情",
      export: "导出历史",
      verify: "验证交易"
    }
  },
  
  blockchain: {
    title: "区块链支付",
    simulator: "区块链模拟器",
    walletTitle: "区块链钱包",
    payment: "创建支付",
    milestone: "里程碑支付",
    transaction: {
      create: "创建交易",
      fund: "资金交易",
      release: "释放资金",
      dispute: "争议交易",
      resolve: "解决争议"
    },
    status: {
      pending: "待处理",
      completed: "已完成",
      funded: "已注资",
      released: "已释放",
      disputed: "有争议",
      resolved: "已解决"
    },
    wallet: {
      notConnected: "钱包未连接",
      connectToApprove: "请连接您的钱包以批准里程碑",
      connectWallet: "连接钱包",
      connecting: "连接中...",
      connected: "已连接",
      disconnect: "断开连接",
      address: "钱包地址",
      balance: "余额",
      noProvider: "未检测到钱包提供商",
      installMetamask: "请安装MetaMask或其他兼容钱包",
      connectionError: "钱包连接错误",
      connectionFailed: "连接钱包失败"
    },
    info: {
      securePayment: "区块链支付是安全、透明和不可变的。所有交易都记录在区块链上，无法更改。",
      simulator: "模拟器允许您测试区块链交易，而无需使用真正的加密货币。"
    }
  },
  
  milestone: {
    title: "里程碑批准",
    progress: "里程碑进度",
    completed: "已完成",
    pending: "待处理",
    in_progress: "进行中",
    approved: "已批准",
    rejected: "已拒绝",
    released: "已释放",
    disputed: "有争议",
    paymentReleased: "里程碑"{name}"的付款已释放给供应商。",
    approvedMessage: "里程碑"{name}"已获批准。",
    rejectedMessage: "里程碑"{name}"已被拒绝。",
    approvalFailed: "批准失败",
    rejectionFailed: "拒绝失败",
    failedToApprove: "批准里程碑失败",
    failedToReject: "拒绝里程碑失败",
    evidenceLabel: "完成证明",
    noMilestones: "无里程碑",
    noMilestonesDescription: "此合同没有定义里程碑。",
    loadingMilestones: "加载里程碑",
    pleaseWait: "请稍候，我们正在加载里程碑信息...",
    walletConnectionRequired: "需要钱包连接",
    connectWalletToViewMilestones: "请连接您的钱包以查看和管理里程碑",
    projectProgress: "项目进度",
    overallCompletion: "完成{progress}%",
    milestones: "里程碑",
    milestonesForContract: "合同里程碑",
    amount: "金额",
    completionProof: "完成证明",
    viewProof: "查看证明",
    approving: "批准中...",
    releasing: "释放中...",
    releasePayment: "释放付款",
    dispute: "争议",
    approveMilestone: "批准里程碑",
    approveMilestoneDescription: "请确认您要批准此里程碑。一旦获得批准，资金可以释放给供应商。",
    confirmApproval: "确认批准",
    disputeMilestone: "争议里程碑",
    disputeMilestoneDescription: "如果您对此里程碑有疑虑，您可以创建争议。这将需要调解来解决。",
    reasonForDispute: "争议原因",
    enterDisputeReason: "请解释您为什么对此里程碑提出争议...",
    submitDispute: "提交争议",
    disputeSubmitted: "争议已提交",
    disputeSubmittedDescription: "您的争议已提交，将由我们的团队审核。",
    failedToDisputeMilestone: "提交里程碑争议失败",
    milestoneApprovedSuccessfully: "里程碑已成功批准",
    paymentReleasedSuccessfully: "付款已成功释放",
    failedToReleasePayment: "释放付款失败",
    rejection: {
      title: "拒绝里程碑",
      description: "请提供拒绝此里程碑的原因。这将在区块链上创建争议。",
      reason: "拒绝原因",
      placeholder: "请解释为什么此里程碑不符合要求...",
      reasonRequired: "需要拒绝理由",
      pleaseProvideReason: "请提供拒绝此里程碑的原因"
    },
    evidence: {
      title: "里程碑完成证明",
      description: "审核里程碑完成的证明。"
    },
    actions: {
      approve: "批准并释放资金",
      reject: "拒绝",
      viewEvidence: "查看证明"
    }
  },
  
  settings: {
    title: "设置",
    profile: "个人资料设置",
    notifications: "通知设置",
    security: "安全设置",
    payment: "支付设置",
    language: "语言设置",
    theme: "主题设置",
    account: {
      name: "姓名",
      email: "电子邮件",
      phone: "电话",
      company: "公司",
      role: "角色",
      avatar: "头像"
    },
    notifications: {
      rfq: "询价单更新",
      messages: "消息",
      payments: "支付更新",
      system: "系统通知"
    },
    security: {
      password: "更改密码",
      twoFactor: "双因素认证",
      sessions: "活动会话",
      devices: "已连接设备"
    }
  }
};