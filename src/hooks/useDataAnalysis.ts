import { useState, useCallback } from 'react';
import { DataRow, EDAResults } from '@/types/data';
import { parseCSV, parseExcel, performEDA } from '@/services/data/dataProcessor';
import { ERROR_MESSAGES } from '@/constants/config';

interface UseDataAnalysisReturn {
  isLoading: boolean;
  error: string | null;
  rawData: DataRow[];
  edaResults: EDAResults | null;
  analyzeFile: (file: File) => Promise<boolean>;
  clearAnalysis: () => void;
  clearError: () => void;
}

export const useDataAnalysis = (): UseDataAnalysisReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [edaResults, setEdaResults] = useState<EDAResults | null>(null);

  const analyzeFile = useCallback(async (file: File): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let data: DataRow[];
      
      // Parse file based on type
      if (file.name.toLowerCase().endsWith('.csv')) {
        data = await parseCSV(file);
      } else {
        data = await parseExcel(file);
      }
      
      // Check if data is empty
      if (data.length === 0) {
        throw new Error(ERROR_MESSAGES.EMPTY_FILE);
      }
      
      // Perform EDA analysis
      const results = await performEDA(data, file.name);
      
      // Store results
      setRawData(data);
      setEdaResults(results);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.PROCESSING_ERROR;
      setError(errorMessage);
      console.error('Data analysis error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setRawData([]);
    setEdaResults(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    rawData,
    edaResults,
    analyzeFile,
    clearAnalysis,
    clearError,
  };
};
