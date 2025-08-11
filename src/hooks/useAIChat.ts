import { useState, useCallback } from 'react';
import { EDAResults, DataRow } from '@/types/data';
import { groqService } from '@/services/api/groqService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chartData?: any;
  chartType?: 'bar' | 'pie' | 'correlation' | 'kpis';
}

interface UseAIChatReturn {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  generateWelcomeMessage: () => Promise<void>;
}

export const useAIChat = (
  edaResults: EDAResults | null,
  rawData: DataRow[]
): UseAIChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!edaResults || !content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Get AI response
      const response = await groqService.answerDataQuestion(content, edaResults, rawData);
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble processing your question right now. Please try rephrasing it or ask about specific columns or statistics from your dataset.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [edaResults, rawData]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const generateWelcomeMessage = useCallback(async () => {
    if (!edaResults) return;

    setIsTyping(true);
    
    try {
      const welcomeMessage = await groqService.generateWelcomeMessage(edaResults);
      
      const message: Message = {
        id: 'welcome',
        type: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      };

      setMessages([message]);
    } catch (error) {
      console.error('Error generating welcome message:', error);
      
      // Fallback welcome message
      const fallbackMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `Hi! I've analyzed your dataset "${edaResults.datasetInfo.fileName}" with ${edaResults.datasetInfo.totalRows.toLocaleString()} rows and ${edaResults.datasetInfo.totalColumns} columns. Feel free to ask me anything about your data!`,
        timestamp: new Date(),
      };

      setMessages([fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [edaResults]);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    generateWelcomeMessage,
  };
};
