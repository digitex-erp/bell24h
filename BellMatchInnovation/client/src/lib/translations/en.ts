export const enTranslations = {
  procurementChallenges: {
    // General challenge system
    title: "Procurement Challenges",
    description: "Improve your procurement skills with interactive challenges",
    startChallenge: "Start Challenge",
    continueChallenge: "Continue",
    exitChallenge: "Exit",
    completeChallenge: "Complete Challenge",
    nextStep: "Next Step",
    prevStep: "Previous Step",
    getHint: "Get Hint",
    submitAnswer: "Submit Answer",
    congratulations: "Congratulations!",
    challengeCompleted: "Challenge Completed",
    totalPoints: "Points",
    earnedBadge: "You earned a badge",
    tryAgain: "Try Again",
    difficulty: "Difficulty",
    allLevels: "All Levels",
    allCategories: "All Categories",
    allStatuses: "All Statuses",
    prerequisites: "Prerequisites",
    allPrerequisitesMet: "All prerequisites met",
    completePreviousChallenges: "Complete previous challenges first",
    skills: "Skills",
    
    // Challenge difficulty levels
    difficultyBeginner: "Beginner",
    difficultyIntermediate: "Intermediate",
    difficultyAdvanced: "Advanced",
    difficultyExpert: "Expert",
    
    // Challenge categories
    categorySupplierSelection: "Supplier Selection",
    categoryPriceNegotiation: "Price Negotiation",
    categoryRiskAssessment: "Risk Assessment",
    categoryContractManagement: "Contract Management",
    categorySustainability: "Sustainability",
    categoryDeliveryOptimization: "Delivery Optimization",
    
    // Challenge statuses
    statusLocked: "Locked",
    statusAvailable: "Available",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusFailed: "Failed",
    
    // Interaction types
    multipleChoice: "Multiple Choice",
    ranking: "Ranking",
    matching: "Matching",
    decision: "Decision",
    simulation: "Simulation",
    
    // Leaderboard
    leaderboard: "Leaderboard",
    leaderboardTitle: "Procurement Challenge Leaderboard",
    yourRank: "Your Rank",
    topPerformers: "Top Performers",
    player: "Player",
    rank: "Rank",
    completedChallenges: "Completed",
    
    // Achievements
    achievements: "Achievements",
    achievementsTitle: "Your Procurement Achievements",
    badges: "Badges",
    unlockedOn: "Unlocked on",
    yourProfile: "Your Profile",
    completeChallengesForBadges: "Complete challenges to earn badges",
    
    // Profile and leaderboard
    totalScore: "Total Score",
    totalScoreDescription: "Your total points across all challenges",
    challengesCompleted: "Challenges Completed",
    challengesCompletedDescription: "Number of procurement challenges you've mastered",
    globalRanking: "Global Ranking",
    globalRankingDescription: "Your position on the global leaderboard",
    badgesEarned: "Badges Earned",
    badgesEarnedDescription: "Collection of badges showcasing your skills",
    yourBadges: "Your Badges",
    leaderboardTitle: "Leaderboard",
    yourRanking: "Your Ranking",
    topPerformers: "Top Performers",
    points: "Points",
    challenges: "Challenges",
    challengesCompletedText: "challenges completed",
    
    // Specific challenges (examples)
    supplierSelection101: {
      title: "Supplier Selection 101",
      description: "Learn the basics of selecting the right suppliers",
      step1: {
        title: "Understanding RFQ Requirements",
        description: "Analyze the RFQ to identify key supplier requirements",
        question: "Which of the following is NOT typically included in an RFQ?",
        optionA: "Delivery timeline",
        optionB: "Quality requirements",
        optionC: "Employee salaries",
        optionD: "Payment terms",
        hint: "Think about what information would be private to the supplier's internal operations"
      }
    },
    
    // Error messages
    errorLoadingChallenges: "Error loading challenges",
    errorStartingChallenge: "Error starting challenge",
    errorSubmittingAnswer: "Error submitting answer",
    errorCompletingChallenge: "Error completing challenge",
    errorLoadingAchievements: "Error loading achievements",
    errorLoadingLeaderboard: "Error loading leaderboard"
  },
  common: {
    // Navigation
    dashboard: "Dashboard",
    rfqs: "RFQs",
    suppliers: "Suppliers",
    wallet: "Wallet",
    settings: "Settings",
    voiceRfq: "Voice RFQ",
    videoRfq: "Video RFQ",
    riskScoring: "Risk Scoring",
    pricing: "Pricing",
    blockchainPayment: "Blockchain Payment",
    blockchainSimulator: "Blockchain Simulator",
    milestoneApproval: "Milestone Approval",
    
    // Actions
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    approve: "Approve",
    reject: "Reject",
    search: "Search",
    filter: "Filter",
    refresh: "Refresh",
    loading: "Loading...",
    processing: "Processing...",
    
    // Status
    awaiting: "Awaiting",
    notYet: "Not Yet",
    of: "of",
    complete: "Complete",
    close: "Close",
    noEvidenceProvided: "No evidence provided.",
    
    // Common UI elements
    welcome: "Welcome to Bell24h",
    profile: "Profile",
    logout: "Logout",
    notifications: "Notifications",
    messages: "Messages",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    system: "System",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    
    // Time
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    custom: "Custom",
  },
  
  dashboard: {
    title: "Dashboard",
    overview: "Overview",
    recentActivity: "Recent Activity",
    marketInsights: "Market Insights",
    pendingApprovals: "Pending Approvals",
    quickActions: "Quick Actions",
    stats: {
      totalRfqs: "Total RFQs",
      pendingRfqs: "Pending RFQs",
      completedRfqs: "Completed RFQs",
      activeSuppliers: "Active Suppliers",
      walletBalance: "Wallet Balance",
      escrowBalance: "Escrow Balance"
    },
    createRfq: "Create New RFQ",
    viewAll: "View All",
  },
  
  rfq: {
    title: "Request for Quote",
    new: "New RFQ",
    edit: "Edit RFQ",
    details: "RFQ Details",
    voice: "Voice RFQ",
    video: "Video RFQ",
    status: {
      draft: "Draft",
      submitted: "Submitted",
      inProgress: "In Progress",
      completed: "Completed",
      canceled: "Canceled"
    },
    form: {
      title: "Title",
      description: "Description",
      category: "Category",
      quantity: "Quantity",
      budget: "Budget",
      deadline: "Deadline",
      attachments: "Attachments",
      requirements: "Requirements",
      additionalInfo: "Additional Information"
    },
    action: {
      record: "Record",
      stopRecording: "Stop Recording",
      preview: "Preview",
      upload: "Upload",
      process: "Process",
      submit: "Submit RFQ",
      save: "Save as Draft"
    },
    voiceHelp: "Click record and speak your RFQ details. Our AI will process your voice input.",
    videoHelp: "Record or upload a video describing your RFQ requirements."
  },
  
  suppliers: {
    title: "Suppliers",
    matched: "Matched Suppliers",
    all: "All Suppliers",
    verified: "Verified Suppliers",
    new: "New Suppliers",
    details: "Supplier Details",
    actions: {
      contact: "Contact",
      invite: "Invite to RFQ",
      view: "View Profile",
      rate: "Rate Supplier"
    },
    stats: {
      rating: "Rating",
      responseTime: "Avg. Response Time",
      completionRate: "Completion Rate",
      disputeRate: "Dispute Rate"
    },
    filters: {
      location: "Location",
      category: "Category",
      rating: "Rating",
      verified: "Verified Only"
    }
  },
  
  wallet: {
    title: "Wallet",
    balance: "Balance",
    transactions: "Transactions",
    deposit: "Deposit",
    withdraw: "Withdraw",
    transfer: "Transfer",
    escrow: "Escrow",
    history: "Transaction History",
    pending: "Pending Transactions",
    blockchain: "Blockchain Wallet",
    connect: "Connect Wallet",
    disconnect: "Disconnect Wallet",
    address: "Wallet Address",
    actions: {
      view: "View Details",
      export: "Export History",
      verify: "Verify Transaction"
    }
  },
  
  blockchain: {
    title: "Blockchain Payments",
    simulator: "Blockchain Simulator",
    walletTitle: "Blockchain Wallet",
    payment: "Create Payment",
    milestone: "Milestone Payment",
    transaction: {
      create: "Create Transaction",
      fund: "Fund Transaction",
      release: "Release Funds",
      dispute: "Dispute Transaction",
      resolve: "Resolve Dispute"
    },
    status: {
      pending: "Pending",
      completed: "Completed",
      funded: "Funded",
      released: "Released",
      disputed: "Disputed",
      resolved: "Resolved"
    },
    wallet: {
      notConnected: "Wallet not connected",
      connectToApprove: "Please connect your wallet to approve milestones",
      connectWallet: "Connect Wallet",
      connecting: "Connecting...",
      connected: "Connected",
      disconnect: "Disconnect",
      address: "Wallet Address",
      balance: "Balance",
      noProvider: "No wallet provider detected",
      installMetamask: "Please install MetaMask or another compatible wallet",
      connectionError: "Wallet connection error",
      connectionFailed: "Failed to connect to wallet"
    },
    info: {
      securePayment: "Blockchain payments are secure, transparent, and immutable. All transactions are recorded on the blockchain and cannot be altered.",
      simulator: "The simulator allows you to test blockchain transactions without using real cryptocurrency."
    }
  },
  
  milestone: {
    title: "Milestone Approval",
    progress: "Milestone Progress",
    completed: "Completed",
    pending: "Pending",
    in_progress: "In Progress",
    approved: "Approved",
    rejected: "Rejected",
    released: "Released",
    disputed: "Disputed",
    paymentReleased: "Payment for milestone \"{name}\" has been released to the supplier.",
    approvedMessage: "Milestone \"{name}\" has been approved.",
    rejectedMessage: "Milestone \"{name}\" has been rejected.",
    approvalFailed: "Approval Failed",
    rejectionFailed: "Rejection Failed",
    failedToApprove: "Failed to approve milestone",
    failedToReject: "Failed to reject milestone",
    evidenceLabel: "Completion Evidence",
    noMilestones: "No Milestones",
    noMilestonesDescription: "There are no milestones defined for this contract.",
    loadingMilestones: "Loading Milestones",
    pleaseWait: "Please wait while we load the milestone information...",
    walletConnectionRequired: "Wallet Connection Required",
    connectWalletToViewMilestones: "Please connect your wallet to view and manage milestones",
    projectProgress: "Project Progress",
    overallCompletion: "{progress}% Complete",
    milestones: "Milestones",
    milestonesForContract: "Milestones for Contract",
    amount: "Amount",
    completionProof: "Completion Proof",
    viewProof: "View Proof",
    approving: "Approving...",
    releasing: "Releasing...",
    releasePayment: "Release Payment",
    dispute: "Dispute",
    approveMilestone: "Approve Milestone",
    approveMilestoneDescription: "Please confirm that you want to approve this milestone. Once approved, funds can be released to the supplier.",
    confirmApproval: "Confirm Approval",
    disputeMilestone: "Dispute Milestone",
    disputeMilestoneDescription: "If you have concerns about this milestone, you can create a dispute. This will require mediation to resolve.",
    reasonForDispute: "Reason for Dispute",
    enterDisputeReason: "Please explain why you are disputing this milestone...",
    submitDispute: "Submit Dispute",
    disputeSubmitted: "Dispute Submitted",
    disputeSubmittedDescription: "Your dispute has been submitted and will be reviewed by our team.",
    failedToDisputeMilestone: "Failed to submit dispute for milestone",
    milestoneApprovedSuccessfully: "Milestone has been approved successfully",
    paymentReleasedSuccessfully: "Payment has been released successfully",
    failedToReleasePayment: "Failed to release payment",
    rejection: {
      title: "Reject Milestone",
      description: "Please provide a reason for rejecting this milestone. This will create a dispute on the blockchain.",
      reason: "Reason for rejection",
      placeholder: "Please explain why this milestone does not meet the requirements...",
      reasonRequired: "Rejection Reason Required",
      pleaseProvideReason: "Please provide a reason for rejecting this milestone"
    },
    evidence: {
      title: "Milestone Completion Evidence",
      description: "Review the evidence provided for milestone completion."
    },
    actions: {
      approve: "Approve & Release Funds",
      reject: "Reject",
      viewEvidence: "View Evidence"
    }
  },
  
  settings: {
    title: "Settings",
    profile: "Profile Settings",
    notifications: "Notification Settings",
    security: "Security Settings",
    payment: "Payment Settings",
    language: "Language Settings",
    theme: "Theme Settings",
    account: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      company: "Company",
      role: "Role",
      avatar: "Profile Picture"
    },
    notifications: {
      rfq: "RFQ Updates",
      messages: "Messages",
      payments: "Payment Updates",
      system: "System Notifications"
    },
    security: {
      password: "Change Password",
      twoFactor: "Two-Factor Authentication",
      sessions: "Active Sessions",
      devices: "Connected Devices"
    }
  }
};