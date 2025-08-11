# AI Data Analyst Assistant

A powerful, AI-powered conversational data analysis tool that allows users to upload CSV/Excel files and have natural conversations with AI about their data. Get instant insights, visualizations, and recommendations through an intuitive chat interface.

## 🚀 Features

- **📊 Automated EDA**: Automatic Exploratory Data Analysis with statistical insights
- **🤖 AI-Powered Chat**: Natural language conversations about your data
- **📈 Smart Visualizations**: Automatic chart generation based on data types
- **🔍 Data Quality Analysis**: Missing values, outliers, and correlation detection
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **⚡ Real-time Processing**: Instant analysis and insights
- **🎯 Professional Insights**: AI-generated recommendations and patterns

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI Integration**: Groq API (Llama 4 Scout 17B)
- **Data Processing**: PapaParse (CSV), XLSX (Excel)
- **State Management**: React Hooks
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd eda-chat-interface
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Edit the `.env` file and add your Groq API key:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 Environment Variables

Edit the `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

**Note:** The application uses a minimal `.env` file with just the essential API key. Other settings have sensible defaults built into the application.

### Getting a Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── common/          # Reusable UI components
│   ├── features/        # Feature-specific components
│   │   ├── data-analysis/   # Data analysis components
│   │   ├── file-upload/     # File handling components
│   │   └── visualization/   # Chart components
│   └── layouts/         # Layout components
├── services/            # Business logic
│   ├── api/            # External API services
│   ├── data/           # Data processing logic
│   └── ai/             # AI prompt engineering
├── hooks/               # Custom React hooks
├── constants/           # App configuration
├── types/               # TypeScript type definitions
└── styles/              # CSS and styling
```

## 🚀 Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build
- **`npm run lint`** - Run ESLint

## 📊 How to Use

1. **Upload Your Data**
   - Drag and drop CSV or Excel files
   - Supported formats: `.csv`, `.xls`, `.xlsx`
   - Maximum file size: 50MB

2. **Automatic Analysis**
   - The system automatically analyzes your data
   - Generates statistical summaries
   - Identifies data quality issues
   - Creates initial visualizations

3. **Chat with AI**
   - Ask questions about your data in natural language
   - Request specific charts or analysis
   - Get AI-powered insights and recommendations

4. **Explore Insights**
   - View generated charts and visualizations
   - Review data quality metrics
   - Follow AI recommendations for data cleaning

## 💡 Example Questions

- "What's the correlation between sales and marketing spend?"
- "Show me a chart of customer age distribution"
- "Are there any outliers in the revenue data?"
- "What patterns do you see in the data?"
- "How should I clean this dataset?"

## 🔒 Security & Privacy

- **Local Processing**: All data analysis happens in your browser
- **No Data Storage**: Files are not uploaded to any server
- **API Key Security**: Keep your `.env` file secure and never commit it
- **Data Privacy**: Your data never leaves your computer

## 🚧 Limitations

- **File Size**: Maximum 50MB per file
- **Data Persistence**: Analysis results are lost on page refresh
- **Browser Memory**: Large datasets may impact browser performance
- **API Rate Limits**: Subject to Groq API usage limits

## 🛠️ Development

### Adding New Features

1. **Components**: Add to appropriate feature directory
2. **Services**: Extend the services layer
3. **Hooks**: Create custom hooks for reusable logic
4. **Types**: Extend TypeScript interfaces as needed

### Code Style

- Use TypeScript for all new code
- Follow React best practices
- Use absolute imports (`@/components/...`)
- Implement proper error handling
- Add JSDoc comments for complex functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Build Errors**
- Ensure all dependencies are installed: `npm install`
- Check TypeScript configuration: `npx tsc --noEmit`
- Verify environment variables are set correctly

**API Errors**
- Verify your Groq API key is correct
- Check API rate limits and quotas
- Ensure internet connectivity

**Performance Issues**
- Reduce file size if possible
- Close other browser tabs
- Check browser memory usage

## 📞 Support

- **Issues**: Create a GitHub issue
- **Documentation**: Check this README and code comments
- **Community**: Join our discussions

## 🔮 Roadmap

- [ ] Data persistence and export
- [ ] User authentication and accounts
- [ ] Collaborative analysis features
- [ ] Advanced statistical tests
- [ ] Custom chart configurations
- [ ] API rate limiting and caching
- [ ] Offline mode support

---

**Made with ❤️ for data analysts and researchers**
