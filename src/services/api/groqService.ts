import { EDAResults, DataRow } from '@/types/data';
import { buildDatasetInsightsPrompt, buildQAPrompt, buildWelcomePrompt } from '@/services/ai/promptBuilder';
import { API_CONFIG } from '@/constants/api';

const GROQ_API_KEY = API_CONFIG.GROQ.API_KEY;
const GROQ_API_URL = API_CONFIG.GROQ.BASE_URL;
const GROQ_MODEL = API_CONFIG.GROQ.MODEL;

async function groqChatCompletion(messages: { role: string, content: string }[]): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not configured. Please set VITE_GROQ_API_KEY in your environment variables.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
    }),
  });
  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

class GroqService {
  async generateDatasetInsights(edaResults: EDAResults, sampleData: DataRow[]): Promise<string[]> {
    const prompt = buildDatasetInsightsPrompt(edaResults, sampleData);
    try {
      const text = await groqChatCompletion([
        { role: 'user', content: prompt }
      ]);
      const insights = text
        .split('\n')
        .filter(line => line.trim().startsWith('•'))
        .map(line => line.replace('•', '').trim())
        .filter(insight => insight.length > 0);
      return insights.length > 0 ? insights : [
        'Dataset appears to be well-structured for analysis',
        'Consider exploring relationships between numeric variables',
        'Review data quality and handle missing values appropriately'
      ];
    } catch (error) {
      console.error('Error generating insights:', error);
      return [
        'Dataset loaded successfully and ready for analysis',
        'Explore the statistics and visualizations above for initial insights',
        'Use the chat interface below to ask specific questions about your data'
      ];
    }
  }

  async answerDataQuestion(question: string, edaResults: EDAResults, sampleData: DataRow[]): Promise<string> {
    const prompt = buildQAPrompt(question, edaResults, sampleData);
    try {
      const text = await groqChatCompletion([
        { role: 'user', content: prompt }
      ]);
      return text;
    } catch (error) {
      console.error('Error answering question:', error);
      return "I'm having trouble processing your question right now. Please try rephrasing it or ask about specific columns or statistics from your dataset.";
    }
  }

  async generateWelcomeMessage(edaResults: EDAResults): Promise<string> {
    const prompt = buildWelcomePrompt(edaResults);
    try {
      const text = await groqChatCompletion([
        { role: 'user', content: prompt }
      ]);
      return text;
    } catch (error) {
      console.error('Error generating welcome message:', error);
      return `Hi! I've analyzed your dataset "${edaResults.datasetInfo.fileName}" with ${edaResults.datasetInfo.totalRows.toLocaleString()} rows and ${edaResults.datasetInfo.totalColumns} columns. Feel free to ask me anything about your data!`;
    }
  }
}

const groqService = new GroqService();
export { groqService };