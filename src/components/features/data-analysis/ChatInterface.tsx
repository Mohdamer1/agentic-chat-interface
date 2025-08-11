import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { EDAResults, DataRow, CategoricalStats } from '@/types/data';
import { groqService } from '@/services/api/groqService';
import { exportService } from '@/services/data/exportService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chartData?: any;
  chartType?: 'bar' | 'pie' | 'correlation' | 'kpis';
  kpis?: Array<{
    label: string;
    value: string;
    icon: string;
    color: string;
    description?: string;
  }>;
}

interface ChatInterfaceProps {
  edaResults: EDAResults;
  rawData: DataRow[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CHART_KEYWORDS = [
  'chart', 'plot', 'graph', 'visualize', 'draw', 'distribution', 'histogram', 'bar chart', 'pie chart',
  'correlation', 'relationship', 'association', 'scatter', 'outlier', 'anomaly', 'summary', 'describe', 'overview', 'info', 'stat', 'mean', 'median', 'average', 'min', 'max', 'std', 'variance', 'insight', 'recommend', 'suggest', 'pattern', 'trend'
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ edaResults, rawData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastDatasetRef = useRef<{fileName: string, totalRows: number} | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!edaResults) return;
    const currentDataset = { fileName: edaResults.datasetInfo.fileName, totalRows: edaResults.datasetInfo.totalRows };
    if (
      lastDatasetRef.current &&
      lastDatasetRef.current.fileName === currentDataset.fileName &&
      lastDatasetRef.current.totalRows === currentDataset.totalRows
    ) {
      // Same dataset, do not rerun EDA
      return;
    }
    lastDatasetRef.current = currentDataset;
    setMessages([]); // Clear previous messages before starting new EDA
    startConversationalEDA();
  }, [edaResults]);

  const handleExportChat = async () => {
    try {
      const data = messages.map((msg, index) => ({
        'Message #': index + 1,
        'Type': msg.type === 'user' ? 'User Question' : 'AI Response',
        'Content': msg.content,
        'Timestamp': msg.timestamp.toLocaleString(),
        'Chart Type': msg.chartType || 'None',
        'Has KPIs': msg.kpis ? 'Yes' : 'No'
      }));
      await exportService.exportToCSV(data, 'chat_conversation.csv');
    } catch (error) {
      console.error(`Export failed: ${error}`);
    }
  };

  const handleExportInsights = async () => {
    try {
      const insights = messages
        .filter(msg => msg.type === 'assistant' && msg.content.length > 50)
        .map((msg, index) => ({
          'Insight #': index + 1,
          'Content': msg.content,
          'Chart Type': msg.chartType || 'None',
          'Timestamp': msg.timestamp.toLocaleString()
        }));
      await exportService.exportToCSV(insights, 'ai_insights.csv');
    } catch (error) {
      console.error(`Export failed: ${error}`);
    }
  };

  const startConversationalEDA = async () => {
    const edaSteps = [
      {
        type: 'welcome',
        delay: 1000
      },
      {
        type: 'kpis',
        delay: 2000
      },
      {
        type: 'overview',
        delay: 2000
      },
      {
        type: 'data_quality',
        delay: 2500
      },
      {
        type: 'statistics',
        delay: 2000
      },
      {
        type: 'visualizations',
        delay: 2500
      },
      {
        type: 'recommendations',
        delay: 2000
      },
      {
        type: 'ready',
        delay: 1500
      }
    ];

    for (let i = 0; i < edaSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, edaSteps[i].delay));
      await addEDAMessage(edaSteps[i].type, i);
    }
  };

  const addEDAMessage = async (stepType: string, stepIndex: number) => {
    setIsTyping(true);
    
    let content = '';
    let chartData = null;
    let chartType = null;

    switch (stepType) {
      case 'welcome':
        try {
          content = await groqService.generateWelcomeMessage(edaResults);
        } catch (error) {
          content = `👋 Hello! I've analyzed your dataset "${edaResults.datasetInfo.fileName}" with ${edaResults.datasetInfo.totalRows.toLocaleString()} rows and ${edaResults.datasetInfo.totalColumns} columns. Let me walk you through the key findings.`;
        }
        break;

      case 'kpis':
        const totalCells = edaResults.datasetInfo.totalRows * edaResults.datasetInfo.totalColumns;
        const missingCells = edaResults.missingValues.reduce((sum, mv) => sum + mv.count, 0);
        const completenessRate = ((totalCells - missingCells) / totalCells * 100).toFixed(1);
        const numericColumns = edaResults.numericStats.length;
        const categoricalColumns = edaResults.categoricalStats.length;
        const outlierColumns = edaResults.outliers.length;
        // New KPIs
        const mostCommonCat = edaResults.categoricalStats.length > 0
          ? edaResults.categoricalStats.reduce((prev, curr) => (prev === undefined || curr.freq > prev.freq ? curr : prev), undefined as CategoricalStats | undefined)
          : undefined;
        const mostMissing = edaResults.missingValues.length > 0
          ? edaResults.missingValues.reduce((prev, curr) => (prev === undefined || curr.percentage > prev.percentage ? curr : prev), undefined as { column: string; count: number; percentage: number } | undefined)
          : undefined;
        // Find strongest correlation
        let strongestCorr = { col1: '', col2: '', value: 0 };
        Object.entries(edaResults.correlations).forEach(([col1, corrs]) => {
          Object.entries(corrs).forEach(([col2, val]) => {
            if (col1 !== col2 && Math.abs(val) > Math.abs(strongestCorr.value)) {
              strongestCorr = { col1, col2, value: val };
            }
          });
        });
        content = `📊 Dataset Key Performance Indicators\n\nHere are the essential metrics for your dataset:`;
        chartData = [
          {
            label: 'Total Records',
            value: edaResults.datasetInfo.totalRows.toLocaleString(),
            icon: '📋',
            color: 'blue',
            description: 'Total number of data rows'
          },
          {
            label: 'Data Completeness',
            value: `${completenessRate}%`,
            icon: '✅',
            color: parseFloat(completenessRate) > 90 ? 'green' : parseFloat(completenessRate) > 70 ? 'yellow' : 'red',
            description: 'Percentage of non-missing values'
          },
          {
            label: 'Numeric Features',
            value: numericColumns.toString(),
            icon: '🔢',
            color: 'purple',
            description: 'Columns suitable for statistical analysis'
          },
          {
            label: 'Categorical Features',
            value: categoricalColumns.toString(),
            icon: '🏷️',
            color: 'emerald',
            description: 'Columns with discrete categories'
          },
          {
            label: 'Data Quality Score',
            value: `${Math.max(0, 100 - (edaResults.missingValues.length * 10) - (outlierColumns * 5))}%`,
            icon: '⭐',
            color: 'amber',
            description: 'Overall data quality assessment'
          },
          {
            label: 'Unique Columns',
            value: edaResults.datasetInfo.totalColumns.toString(),
            icon: '📊',
            color: 'indigo',
            description: 'Total number of features/variables'
          },
          // New KPIs
          mostCommonCat ? {
            label: `Most Common (${mostCommonCat.column})`,
            value: `${mostCommonCat.top} (${mostCommonCat.freq})`,
            icon: '🏆',
            color: 'yellow',
            description: `Most frequent value in ${mostCommonCat.column}`
          } : null,
          mostMissing ? {
            label: `Most Missing (${mostMissing.column})`,
            value: `${mostMissing.percentage}%`,
            icon: '⚠️',
            color: 'red',
            description: `Highest missing value percentage in ${mostMissing.column}`
          } : null,
          strongestCorr.value !== 0 ? {
            label: 'Strongest Correlation',
            value: `${strongestCorr.col1} ↔ ${strongestCorr.col2} (${strongestCorr.value.toFixed(2)})`,
            icon: '🔗',
            color: 'blue',
            description: 'Strongest correlation between numeric columns'
          } : null
        ].filter(Boolean);
        chartType = 'kpis';
        break;

      case 'overview':

        content = `📊 Dataset Overview

Your dataset contains ${edaResults.datasetInfo.totalRows.toLocaleString()} rows and ${edaResults.datasetInfo.totalColumns} columns.

Column Types:
${edaResults.datasetInfo.columns.map(col => 
  `• ${col.name} (${col.type}) - ${col.uniqueCount} unique values`
).slice(0, 8).join('\n')}
${edaResults.datasetInfo.columns.length > 8 ? `\n... and ${edaResults.datasetInfo.columns.length - 8} more columns` : ''}

Here's a sample of your data:
${Object.keys(rawData[0] || {}).slice(0, 4).map(key => `${key}: ${rawData[0]?.[key]}`).join(' | ')}`;
        break;

      case 'data_quality':
        const missingCount = edaResults.missingValues.length;
        const outlierCount = edaResults.outliers.length;
        
        content = `🔍 Data Quality Assessment

${missingCount === 0 ? 
  '✅ Great news! No missing values detected.' :
  `⚠️ Missing Values: ${missingCount} columns have missing data:\n${edaResults.missingValues.map(mv => `• ${mv.column}: ${mv.count} missing (${mv.percentage}%)`).join('\n')}`
}

${outlierCount === 0 ?
  '✅ No significant outliers detected.' :
  `📈 Outliers: ${outlierCount} columns have potential outliers:\n${edaResults.outliers.map(ol => `• ${ol.column}: ${ol.outlierCount} potential outliers`).join('\n')}`
}`;
        break;

      case 'statistics':
        const numericStats = edaResults.numericStats.slice(0, 3);
        const categoricalStats = edaResults.categoricalStats.slice(0, 3);
        
        content = `📈 Statistical Summary

${numericStats.length > 0 ? `Numeric Columns:\n${numericStats.map(stat => 
  `• ${stat.column}: Mean = ${stat.mean}, Range = [${stat.min} - ${stat.max}]`
).join('\n')}\n` : ''}

${categoricalStats.length > 0 ? `Categorical Columns:\n${categoricalStats.map(stat => 
  `• ${stat.column}: ${stat.unique} unique values, Most frequent = "${stat.top}" (${stat.freq} times)`
).join('\n')}` : ''}`;

        // Add chart data for the first categorical column
        if (categoricalStats.length > 0) {
          const firstCat = categoricalStats[0];
          chartData = Object.entries(firstCat.distribution)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 6)
            .map(([name, value]) => ({ name, value }));
          chartType = 'bar';
        }
        break;

      case 'visualizations':
        content = `📊 Key Visualizations

Let me show you some important patterns in your data:`;

        // Create visualization for the most interesting categorical column
        const interestingCat = edaResults.categoricalStats.find(stat => 
          stat.unique > 2 && stat.unique < 20
        ) || edaResults.categoricalStats[0];

        if (interestingCat) {
          chartData = Object.entries(interestingCat.distribution)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 8)
            .map(([name, value]) => ({ name, value }));
          chartType = 'pie';
          content += `\n\nHere's the distribution of ${interestingCat.column}:`;
        }
        break;

      case 'recommendations':
        try {
          const aiRecommendations = await groqService.generateDatasetInsights(edaResults, rawData);
          content = `💡 AI-Powered Insights & Recommendations

Based on my analysis of your dataset, here are my key recommendations:

${aiRecommendations.map(rec => `• ${rec}`).join('\n')}`;
        } catch (error) {
          content = `💡 Key Recommendations

${edaResults.recommendations.map(rec => `• ${rec}`).join('\n')}`;
        }
        break;

      case 'ready':
        content = `🎉 Analysis Complete!

I've finished analyzing your dataset and I'm ready to answer any questions you have! 

You can ask me things like:
• "Show me correlations between variables"
• "What's unusual about the ${edaResults.datasetInfo.columns[0]?.name} column?"
• "Create a chart for ${edaResults.categoricalStats[0]?.column || 'categorical data'}"
• "What should I clean in my data?"
• "Explain the ${edaResults.numericStats[0]?.column || 'numeric'} statistics"

What would you like to explore first?`;
        break;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    const message: Message = {
      id: `eda-${stepIndex}`,
      type: 'assistant',
      content,
      timestamp: new Date(),
      chartData,
      chartType: chartType as any
    };

    setMessages(prev => [...prev, message]);
    setIsTyping(false);
  };

  const processQuery = async (query: string): Promise<{ content: string; chartData?: any; chartType?: string }> => {
    try {
      const lowerQuery = query.toLowerCase();
      // Chart-related keywords
      const chartKeywords = ['chart', 'plot', 'graph', 'pie', 'bar', 'distribution', 'histogram', 'visualize'];
      // If the query contains any chart keyword, try to extract the column and chart type
      if (chartKeywords.some(k => lowerQuery.includes(k))) {
        // Try to extract the column name (first column name that appears in the query)
        const columnNames = edaResults.datasetInfo.columns.map(col => col.name);
        const mentionedColumn = columnNames.find(col => lowerQuery.includes(col.toLowerCase()));
        // If a column is mentioned, pass the query to generateChart
        if (mentionedColumn) {
          const result = await generateChart(query);
          if (result) return result;
        } else {
          // If no column is mentioned, fallback to text answer
          return { content: "Please specify which column you want to visualize." };
        }
      }
      // Otherwise, use Groq AI to answer the question
      const response = await groqService.answerDataQuestion(query, edaResults, rawData);
      return { content: response };
    } catch (error) {
      console.error('Error processing query with AI:', error);
      return { content: processQueryFallback(query) };
    }
  };

  const generateChart = async (query: string): Promise<{ content: string; chartData: any; chartType: string } | null> => {
    const lowerQuery = query.toLowerCase();
    const columnNames = edaResults.datasetInfo.columns.map(col => col.name);
    const matchedColumnName = columnNames.find(col => lowerQuery.includes(col.toLowerCase()));
    const mentionedColumn = edaResults.datasetInfo.columns.find(col => col.name === matchedColumnName);

    if (mentionedColumn) {
      // Try categorical first
      let catStat = edaResults.categoricalStats.find(stat => stat.column === mentionedColumn.name);
      // If not found, but unique values are small, treat as categorical
      if (!catStat) {
        const values = rawData.map(row => row[mentionedColumn.name]);
        const unique = Array.from(new Set(values.filter(v => v !== undefined && v !== null && v !== '')));
        if (unique.length > 1 && unique.length <= 10) {
          const distribution: { [key: string]: number } = {};
          values.forEach(val => {
            if (val !== undefined && val !== null && val !== '') {
              distribution[val] = (distribution[val] || 0) + 1;
            }
          });
          catStat = {
            column: mentionedColumn.name,
            count: values.length,
            unique: unique.length,
            top: unique[0],
            freq: distribution[unique[0]],
            distribution
          };
        }
      }
      if (catStat) {
        const chartData = Object.entries(catStat.distribution)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }));
        return {
          content: `📊 Here's a chart showing the distribution of ${mentionedColumn.name}:

The most common value is "${catStat.top}" appearing ${catStat.freq} times out of ${catStat.count} total records.`,
          chartData,
          chartType: lowerQuery.includes('pie') ? 'pie' : 'bar'
        };
      }
      // Try numeric
      const numStat = edaResults.numericStats.find(stat => stat.column === mentionedColumn.name);
      if (numStat) {
        const chartData = [
          { name: 'Min', value: numStat.min },
          { name: 'Q1', value: numStat.q25 },
          { name: 'Median', value: numStat.median },
          { name: 'Q3', value: numStat.q75 },
          { name: 'Max', value: numStat.max }
        ];
        return {
          content: `📊 Here's a statistical breakdown of ${mentionedColumn.name}:

Mean: ${numStat.mean}, Standard Deviation: ${numStat.std}`,
          chartData,
          chartType: 'bar'
        };
      }
    }
    return null;
  };

  const processQueryFallback = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('correlation')) {
      const numericCols = Object.keys(edaResults.correlations);
      if (numericCols.length < 2) {
        return "I need at least 2 numeric columns to analyze correlations. Your dataset doesn't have enough numeric columns.";
      }
      
      const strongCorrelations = [];
      for (const col1 of numericCols) {
        for (const col2 of numericCols) {
          if (col1 !== col2 && Math.abs(edaResults.correlations[col1][col2]) > 0.5) {
            strongCorrelations.push({
              col1,
              col2,
              correlation: edaResults.correlations[col1][col2]
            });
          }
        }
      }
      
      if (strongCorrelations.length === 0) {
        return "I found no strong correlations (>0.5) between your numeric variables. This suggests the variables are relatively independent.";
      }
      
      const corrSummary = strongCorrelations
        .slice(0, 5)
        .map(corr => `• ${corr.col1} ↔ ${corr.col2}: ${corr.correlation.toFixed(3)}`)
        .join('\n');
      
      return `Here are the strongest correlations I found:\n${corrSummary}`;
    }
    
    return `I'd be happy to help you explore that aspect of your data! Could you be more specific about what you'd like to know about your dataset?`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await processQuery(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.content,
        timestamp: new Date(),
        chartData: result.chartData,
        chartType: result.chartType as any
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble processing your question right now. Please try asking about specific columns or statistics from your dataset.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // No autocomplete, feedback, or example questions

  const renderChart = (message: Message) => {
    if (!message.chartData || !message.chartType) return null;

    const { chartData, chartType } = message;

    if (chartType === 'kpis') {
      return (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {chartData.map((kpi: any, index: number) => (
            <div
              key={index}
              className={`bg-white rounded-lg border-2 p-4 text-center transition-all hover:shadow-md ${
                kpi.color === 'blue' ? 'border-blue-200 bg-blue-50' :
                kpi.color === 'green' ? 'border-green-200 bg-green-50' :
                kpi.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                kpi.color === 'red' ? 'border-red-200 bg-red-50' :
                kpi.color === 'purple' ? 'border-purple-200 bg-purple-50' :
                kpi.color === 'emerald' ? 'border-emerald-200 bg-emerald-50' :
                kpi.color === 'amber' ? 'border-amber-200 bg-amber-50' :
                'border-indigo-200 bg-indigo-50'
              }`}
            >
              <div className="text-2xl mb-2">{kpi.icon}</div>
              <div className={`text-2xl font-bold mb-1 ${
                kpi.color === 'blue' ? 'text-blue-700' :
                kpi.color === 'green' ? 'text-green-700' :
                kpi.color === 'yellow' ? 'text-yellow-700' :
                kpi.color === 'red' ? 'text-red-700' :
                kpi.color === 'purple' ? 'text-purple-700' :
                kpi.color === 'emerald' ? 'text-emerald-700' :
                kpi.color === 'amber' ? 'text-amber-700' :
                'text-indigo-700'
              }`}>
                {kpi.value}
              </div>
              <div className="text-sm font-medium text-gray-700 mb-1">{kpi.label}</div>
              {kpi.description && (
                <div className="text-xs text-gray-500">{kpi.description}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartType === 'pie') {
      return (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Header with Export Buttons */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Data Analysis Chat</h3>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className={`rounded-xl p-4 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-50 text-gray-900 border border-gray-200'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    {message.content.startsWith('💡 AI-Powered Insights & Recommendations') ? (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl shadow-sm mb-2">
                        <div className="flex items-center mb-2"><Lightbulb className="h-5 w-5 text-yellow-500 mr-2" /><span className="font-bold text-yellow-800">AI-Powered Insights & Recommendations</span></div>
                        <ul className="list-disc pl-6 text-yellow-900">
                          {message.content.split('\n').slice(3).map((rec: string, idx: number) => rec.trim().startsWith('•') ? <li key={idx}>{rec.replace(/^•\s*/, '')}</li> : null)}
                        </ul>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap mb-0">{message.content}</p>
                    )}
                  </div>
                  {renderChart(message)}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your data..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;