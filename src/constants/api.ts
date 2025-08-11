// API Configuration Constants
export const API_CONFIG = {
  // Groq AI Service
  GROQ: {
    BASE_URL: import.meta.env.VITE_GROQ_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: import.meta.env.VITE_GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
    API_KEY: import.meta.env.VITE_GROQ_API_KEY,
    TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
  },
  
  // HTTP Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
  
  // Request Headers
  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    ACCEPT: 'Accept',
  },
  
  // Content Types
  CONTENT_TYPES: {
    JSON: 'application/json',
    FORM_DATA: 'multipart/form-data',
    TEXT: 'text/plain',
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Future backend endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  
  DATA: {
    UPLOAD: '/api/data/upload',
    ANALYZE: '/api/data/analyze',
    EXPORT: '/api/data/export',
    DELETE: '/api/data/delete',
  },
  
  ANALYSIS: {
    SAVE: '/api/analysis/save',
    LOAD: '/api/analysis/load',
    SHARE: '/api/analysis/share',
  },
  
  USER: {
    PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
    HISTORY: '/api/user/history',
  },
} as const;

// Error Response Types
export const API_ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
} as const;
