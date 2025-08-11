// Environment validation utility
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Debug: Log what we're checking
  console.log('Environment Validation Debug:', {
    VITE_GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY,
    VITE_GROQ_API_KEY_length: import.meta.env.VITE_GROQ_API_KEY?.length,
    VITE_GROQ_API_KEY_startsWith_gsk: import.meta.env.VITE_GROQ_API_KEY?.startsWith('gsk_'),
    allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });
  
  // Check required environment variables
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    errors.push('VITE_GROQ_API_KEY is required for AI functionality');
  }
  
  // Check optional environment variables with defaults
  const requiredVars = {
    'VITE_GROQ_MODEL': import.meta.env.VITE_GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
    'VITE_GROQ_BASE_URL': import.meta.env.VITE_GROQ_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions',
  };
  
  // Validate API key format (basic check)
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (apiKey && !apiKey.startsWith('gsk_')) {
    errors.push('VITE_GROQ_API_KEY appears to be invalid (should start with "gsk_")');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Get environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    nodeEnv: import.meta.env.MODE,
    hasApiKey: !!import.meta.env.VITE_GROQ_API_KEY,
    apiKeyLength: import.meta.env.VITE_GROQ_API_KEY?.length || 0,
    model: import.meta.env.VITE_GROQ_MODEL || 'default',
    baseUrl: import.meta.env.VITE_GROQ_BASE_URL || 'default',
    appName: import.meta.env.VITE_APP_NAME || 'AI Data Analyst Assistant',
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  };
};
