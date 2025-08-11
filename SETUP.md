# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Groq API account

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Your Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_`)

### 3. Configure Environment
Edit the `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=gsk_your_actual_api_key_here
```

**Note:** The application uses a minimal `.env` file with just the essential API key. Other settings have sensible defaults.

**⚠️ Important**: Never commit your `.env` file to version control!

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Your Browser
Navigate to `http://localhost:5173`

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_GROQ_API_KEY` | ✅ Yes | - | Your Groq API key |

**Optional Variables (with built-in defaults):**
- `VITE_GROQ_MODEL` - AI model (default: `meta-llama/llama-4-scout-17b-16e-instruct`)
- `VITE_GROQ_BASE_URL` - API endpoint (default: `https://api.groq.com/openai/v1/chat/completions`)
- `VITE_APP_NAME` - Application name (default: `AI Data Analyst Assistant`)
- `VITE_APP_VERSION` - Application version (default: `1.0.0`)

## 🚨 Troubleshooting

### "Configuration Required" Error
- Check if `.env` file exists
- Verify `VITE_GROQ_API_KEY` is set correctly
- Ensure API key starts with `gsk_`

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript: `npx tsc --noEmit`
- Verify environment variables are set

### API Errors
- Confirm your Groq API key is valid
- Check API rate limits and quotas
- Ensure internet connectivity

## 📁 File Structure
```
├── .env                 # Minimal environment configuration (API key only)
├── .gitignore           # Git ignore rules
├── README.md            # Full documentation
├── SETUP.md             # This setup guide
└── src/                 # Source code
```

## 🔒 Security Notes
- Keep your `.env` file secure
- Never share your API key
- The `.env` file is already in `.gitignore`
- All data processing happens locally in your browser

## 🆘 Need Help?
- Check the [README.md](README.md) for detailed documentation
- Review the console for error messages
- Ensure all prerequisites are met
- Verify your Groq API key is active

---

**Happy Data Analyzing! 🎉**
