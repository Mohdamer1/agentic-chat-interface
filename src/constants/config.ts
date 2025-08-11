// Application Configuration Constants
export const APP_CONFIG = {
  // App Information
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AI Data Analyst Assistant',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_DESCRIPTION: 'AI-powered conversational data analysis tool',
  
  // File Upload Settings
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB in bytes
  SUPPORTED_FORMATS: ['.csv', '.xls', '.xlsx'],
  SUPPORTED_MIME_TYPES: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  
  // AI Service Configuration
  AI_MODEL: 'meta-llama/llama-4-scout-17b-16e-instruct',
  AI_PROVIDER: 'Groq',
  
  // UI Configuration
  CHART_COLORS: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
  ANIMATION_DELAYS: {
    WELCOME: 1000,
    KPIS: 2000,
    OVERVIEW: 2000,
    DATA_QUALITY: 2500,
    STATISTICS: 2000,
    VISUALIZATIONS: 2500,
    RECOMMENDATIONS: 2000,
    READY: 1500
  },
  
  // Data Analysis Settings
  SAMPLE_DATA_SIZE: 10,
  MAX_CORRELATION_COLUMNS: 5,
  OUTLIER_THRESHOLD: 1.5, // IQR multiplier
  CORRELATION_THRESHOLD: 0.3, // Minimum correlation to display
} as const;

// Feature Flags
export const FEATURES = {
  AI_CHAT: true,
  AUTOMATIC_EDA: true,
  CHART_GENERATION: true,
  DATA_EXPORT: false, // Future feature
  USER_ACCOUNTS: false, // Future feature
  COLLABORATION: false, // Future feature
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size must be less than 50MB',
  UNSUPPORTED_FORMAT: 'Please upload a CSV or Excel file',
  EMPTY_FILE: 'The uploaded file appears to be empty',
  PROCESSING_ERROR: 'An error occurred while processing the file',
  AI_SERVICE_ERROR: 'AI service is temporarily unavailable',
  NETWORK_ERROR: 'Network connection error',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded successfully',
  ANALYSIS_COMPLETE: 'Data analysis completed',
  INSIGHTS_GENERATED: 'AI insights generated successfully',
} as const;
