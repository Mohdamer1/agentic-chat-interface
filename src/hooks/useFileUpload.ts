import { useState, useCallback } from 'react';
import { APP_CONFIG, ERROR_MESSAGES } from '@/constants/config';

interface UseFileUploadReturn {
  isUploading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<File | null>;
  clearError: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
      setError(ERROR_MESSAGES.FILE_TOO_LARGE);
      return false;
    }

    // Check file format
    const hasValidExtension = APP_CONFIG.SUPPORTED_FORMATS.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    const hasValidMimeType = APP_CONFIG.SUPPORTED_MIME_TYPES.includes(file.type);
    
    if (!hasValidExtension && !hasValidMimeType) {
      setError(ERROR_MESSAGES.UNSUPPORTED_FORMAT);
      return false;
    }

    // Check if file is empty
    if (file.size === 0) {
      setError(ERROR_MESSAGES.EMPTY_FILE);
      return false;
    }

    setError(null);
    return true;
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<File | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // Validate file
      if (!validateFile(file)) {
        return null;
      }

      // Simulate upload delay (remove in production)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // File is valid and ready for processing
      return file;
    } catch (err) {
      setError(ERROR_MESSAGES.PROCESSING_ERROR);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateFile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isUploading,
    error,
    uploadFile,
    clearError,
  };
};
