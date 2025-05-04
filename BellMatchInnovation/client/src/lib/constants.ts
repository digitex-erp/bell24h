// App Information
export const APP_NAME = "Bell24h";
export const APP_DESCRIPTION = "AI-Powered RFQ Marketplace";

// API Endpoints
export const API_PREFIX = "/api";
export const RFQ_ENDPOINT = `${API_PREFIX}/rfqs`;
export const SUPPLIERS_ENDPOINT = `${API_PREFIX}/suppliers`;
export const PAYMENTS_ENDPOINT = `${API_PREFIX}/payments`;
export const USERS_ENDPOINT = `${API_PREFIX}/users`;
export const OPENAI_ENDPOINT = `${API_PREFIX}/openai`;

// WebSocket Events
export const WS_EVENTS = {
  NEW_MESSAGE: "new_message",
  NEW_RFQ: "new_rfq",
  RFQ_UPDATE: "rfq_update",
  NEW_QUOTE: "new_quote",
  QUOTE_UPDATE: "quote_update",
  PAYMENT_UPDATE: "payment_update",
  NOTIFICATION: "notification",
};

// RFQ Types
export const RFQ_TYPES = {
  TEXT: "text",
  VOICE: "voice",
  VIDEO: "video",
};

// RFQ Status
export const RFQ_STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Quote Status
export const QUOTE_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
};

// Transaction Types
export const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  ESCROW: "escrow",
  RELEASE: "release",
  FEE: "fee",
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
};

// Invoice Status
export const INVOICE_STATUS = {
  PENDING: "pending",
  DISCOUNTED: "discounted",
  PAID: "paid",
  EXPIRED: "expired",
};

// User Roles
export const USER_ROLES = {
  BUYER: "buyer",
  SUPPLIER: "supplier",
  ADMIN: "admin",
};

// Risk Grades
export const RISK_GRADES = {
  A_PLUS: "A+",
  A: "A",
  B_PLUS: "B+",
  B: "B",
  C: "C",
  D: "D",
};

// Categories
export const PRODUCT_CATEGORIES = [
  "Electronics & Components",
  "Industrial Machinery",
  "Textiles & Apparel",
  "Chemicals & Materials",
  "Packaging & Printing",
  "Consumer Electronics",
  "Automotive Parts",
  "Construction Materials",
  "Medical Supplies",
  "Food & Beverages",
];

// Locations
export const POPULAR_LOCATIONS = [
  "Delhi, India",
  "Mumbai, India",
  "Bengaluru, India",
  "Chennai, India",
  "Hyderabad, India",
  "Ahmedabad, India",
  "Pune, India",
  "Surat, India",
  "Kolkata, India",
  "Jaipur, India",
  "Dubai, UAE",
  "Singapore",
  "Shenzhen, China",
];

// Implementation Status
export const IMPLEMENTATION_STATUS = {
  VOICE_RFQ_HINDI: 70,
  VIDEO_RFQ_PROCESSING: 40,
  PAYMENT_INTEGRATION: 35,
  KREDX_INTEGRATION: 45,
  MARKET_INSIGHTS: 60,
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: "#2563eb",
  SUCCESS: "#10b981",
  WARNING: "#f59e0b",
  DANGER: "#ef4444",
  GRAY: "#94a3b8",
};

// Voice Recording Settings
export const VOICE_RECORDING = {
  MAX_DURATION_SECONDS: 300, // 5 minutes
  AUTO_STOP_SILENCE_MS: 3000, // 3 seconds of silence
  MIME_TYPE: "audio/webm",
  SUPPORTED_MIME_TYPES: ["audio/webm", "audio/mp4", "audio/mpeg", "audio/mp3", "audio/ogg"],
  SUPPORTED_FILE_EXTENSIONS: [".webm", ".mp4", ".mp3", ".mpeg", ".ogg", ".wav"],
  MAX_FILE_SIZE_MB: 25,
};

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", implementation: 100 },
  { code: "hi", name: "Hindi", implementation: 90 },
  { code: "es", name: "Spanish", implementation: 80 },
  { code: "zh", name: "Chinese", implementation: 75 },
  { code: "ar", name: "Arabic", implementation: 70 },
  { code: "fr", name: "French", implementation: 75 },
  { code: "de", name: "German", implementation: 75 },
  { code: "ja", name: "Japanese", implementation: 70 },
  { code: "ko", name: "Korean", implementation: 70 },
  { code: "pt", name: "Portuguese", implementation: 75 },
  { code: "ru", name: "Russian", implementation: 70 },
];

// Video Recording Settings
export const VIDEO_RECORDING = {
  MAX_DURATION_SECONDS: 300, // 5 minutes
  MIME_TYPE: "video/webm",
  MAX_FILE_SIZE_MB: 100,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
};

// Toast Duration
export const TOAST_DURATION = 5000; // 5 seconds
