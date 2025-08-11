import React, { useState, useEffect } from 'react';
import { BarChart3, Upload, AlertTriangle } from 'lucide-react';
import FileUpload from '@/components/features/file-upload/FileUpload';
import ChatInterface from '@/components/features/data-analysis/ChatInterface';
import { parseCSV, parseExcel, performEDA } from '@/services/data/dataProcessor';
import { DataRow, EDAResults } from '@/types/data';
import { validateEnvironment } from '@/utils/envValidation';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [edaResults, setEdaResults] = useState<EDAResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [envErrors, setEnvErrors] = useState<string[]>([]);

  // Validate environment on component mount
  useEffect(() => {
    // Debug: Log environment variables
    console.log('Environment Debug:', {
      VITE_GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY,
      VITE_GROQ_MODEL: import.meta.env.VITE_GROQ_MODEL,
      VITE_GROQ_BASE_URL: import.meta.env.VITE_GROQ_BASE_URL,
      MODE: import.meta.env.MODE
    });
    
    const validation = validateEnvironment();
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      setEnvErrors(validation.errors);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let data: DataRow[];
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        data = await parseCSV(file);
      } else {
        data = await parseExcel(file);
      }
      
      if (data.length === 0) {
        throw new Error('The uploaded file appears to be empty');
      }
      
      const results = await performEDA(data, file.name);
      
      setRawData(data);
      setEdaResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
      console.error('File processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUpload = () => {
    setEdaResults(null);
    setRawData([]);
    setError(null);
  };

  if (!edaResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-600 rounded-full">
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Data Analyst Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your CSV or Excel file and have a natural conversation with AI about your data. 
              Get insights, ask questions, and explore your dataset through intelligent dialogue.
            </p>
          </div>
          
          <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
          
          {/* Environment Configuration Errors */}
          {envErrors.length > 0 && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">Configuration Required</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      AI functionality requires proper configuration. Please check your environment variables.
                    </p>
                    <div className="mt-2 text-xs text-amber-600">
                      <p>Required: VITE_GROQ_API_KEY in .env file</p>
                      <p>Optional: VITE_GROQ_MODEL, VITE_GROQ_BASE_URL</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-red-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">What you'll experience:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Conversational Analysis</h3>
                  <p className="text-sm text-gray-600">AI presents your data analysis through natural conversation, making insights easy to understand</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Interactive EDA</h3>
                  <p className="text-sm text-gray-600">Explore statistics, patterns, and insights through dynamic conversation with visual charts</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Insights</h3>
                  <p className="text-sm text-gray-600">AI identifies patterns, anomalies, and provides actionable recommendations for your specific data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Data Analysis Chat</h1>
                <p className="text-gray-600">{edaResults.datasetInfo.fileName} • {edaResults.datasetInfo.totalRows.toLocaleString()} rows • {edaResults.datasetInfo.totalColumns} columns</p>
              </div>
            </div>
            <button
              onClick={handleNewUpload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>New Dataset</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-0 py-6">
        <ChatInterface edaResults={edaResults} rawData={rawData} />
      </div>
    </div>
  );
}

export default App;