import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    // Explicitly define environment variables
    define: {
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY),
      'import.meta.env.VITE_GROQ_MODEL': JSON.stringify(env.VITE_GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'),
      'import.meta.env.VITE_GROQ_BASE_URL': JSON.stringify(env.VITE_GROQ_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions'),
    },
  };
});
