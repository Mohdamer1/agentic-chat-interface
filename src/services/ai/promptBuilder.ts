import { EDAResults, DataRow } from '@/types/data';
import Fuse from 'fuse.js';

export function buildDatasetInsightsPrompt(edaResults: EDAResults, sampleData: DataRow[]): string {
  return `
As a professional data analyst, analyze this dataset and provide 5-7 specific, actionable insights and recommendations. Use the actual column names and data patterns from the analysis below.

Dataset: ${edaResults.datasetInfo.fileName}
Rows: ${edaResults.datasetInfo.totalRows}
Columns: ${edaResults.datasetInfo.totalColumns}

Column Information:
${edaResults.datasetInfo.columns.map(col => 
  `- ${col.name} (${col.type}): ${col.nullCount} missing values (${col.nullPercentage.toFixed(1)}%), ${col.uniqueCount} unique values`
).join('\n')}

Numeric Statistics:
${edaResults.numericStats.map(stat => 
  `- ${stat.column}: mean=${stat.mean}, std=${stat.std}, range=[${stat.min}, ${stat.max}]`
).join('\n')}

Categorical Statistics:
${edaResults.categoricalStats.map(stat => 
  `- ${stat.column}: ${stat.unique} unique values, most frequent="${stat.top}" (${stat.freq} times)`
).join('\n')}

Missing Values:
${edaResults.missingValues.map(mv => `- ${mv.column}: ${mv.count} missing (${mv.percentage}%)`).join('\n')}

Outliers Detected:
${edaResults.outliers.map(ol => `- ${ol.column}: ${ol.outlierCount} potential outliers`).join('\n')}

Sample Data (first few rows):
${JSON.stringify(sampleData.slice(0, 3), null, 2)}

Please provide specific, actionable insights that:
1. Reference actual column names from the dataset
2. Highlight interesting patterns or anomalies
3. Suggest data cleaning steps if needed
4. Recommend further analysis directions
5. Point out potential data quality issues
6. Suggest business insights if patterns are evident

Format as a simple list of 4-6 concise insights, each on a new line starting with "•".
Keep each insight to 1-2 sentences maximum. Do not use markdown formatting like ** or *.
`;
}

export function buildQAPrompt(question: string, edaResults: EDAResults, sampleData: DataRow[]): string {
  return `
You are a professional data analyst assistant. Answer the user's question about their dataset using only the information provided below. Be conversational, helpful, and specific.

User Question: "${question}"

Dataset: ${edaResults.datasetInfo.fileName}
Rows: ${edaResults.datasetInfo.totalRows}
Columns: ${edaResults.datasetInfo.totalColumns}

Column Information:
${edaResults.datasetInfo.columns.map(col => 
  `- ${col.name} (${col.type}): ${col.nullCount} missing values (${col.nullPercentage.toFixed(1)}%), ${col.uniqueCount} unique values, sample values: [${col.sampleValues.join(', ')}]`
).join('\n')}

Numeric Statistics:
${edaResults.numericStats.map(stat => 
  `- ${stat.column}: count=${stat.count}, mean=${stat.mean}, std=${stat.std}, min=${stat.min}, Q1=${stat.q25}, median=${stat.median}, Q3=${stat.q75}, max=${stat.max}`
).join('\n')}

Categorical Statistics:
${edaResults.categoricalStats.map(stat => 
  `- ${stat.column}: ${stat.unique} unique values, most frequent="${stat.top}" appears ${stat.freq} times, distribution: ${JSON.stringify(Object.entries(stat.distribution).slice(0, 5))}`
).join('\n')}

Missing Values:
${edaResults.missingValues.map(mv => `- ${mv.column}: ${mv.count} missing (${mv.percentage}%)`).join('\n')}

Correlations (top correlations):
${Object.entries(edaResults.correlations).slice(0, 3).map(([col1, correlations]) => 
  Object.entries(correlations).filter(([col2, corr]) => col1 !== col2 && Math.abs(corr) > 0.3)
    .slice(0, 2).map(([col2, corr]) => `- ${col1} ↔ ${col2}: ${corr.toFixed(3)}`).join('\n')
).join('\n')}

Outliers:
${edaResults.outliers.map(ol => `- ${ol.column}: ${ol.outlierCount} potential outliers detected`).join('\n')}

Sample Data:
${JSON.stringify(sampleData.slice(0, 5), null, 2)}

Instructions:
- Answer based ONLY on the data provided above
- Use specific column names and values from the dataset
- Be conversational, helpful, and concise (2-4 sentences maximum)
- If the question cannot be answered with the available data, politely explain what's missing
- Provide actionable insights when possible
- Do not use markdown formatting like ** or *. Use plain text only
- End with a follow-up suggestion or question when appropriate

Answer:
`;
}

export function buildWelcomePrompt(edaResults: EDAResults): string {
  return `
Create a friendly, professional welcome message for a user who just uploaded a dataset. Summarize the key findings and suggest 3-4 specific questions they could ask.

Dataset: ${edaResults.datasetInfo.fileName}
Rows: ${edaResults.datasetInfo.totalRows}
Columns: ${edaResults.datasetInfo.totalColumns}

Key columns: ${edaResults.datasetInfo.columns.slice(0, 5).map(col => `${col.name} (${col.type})`).join(', ')}

Notable findings:
- ${edaResults.missingValues.length} columns have missing values
- ${edaResults.numericStats.length} numeric columns for statistical analysis
- ${edaResults.categoricalStats.length} categorical columns for distribution analysis
- ${edaResults.outliers.length} columns have potential outliers

Keep it conversational and concise (2-3 sentences max), highlight the most interesting aspects, and suggest 2-3 specific questions using actual column names.
Do not use markdown formatting like ** or *. Use plain text only.
`;
} 

export function fuzzyColumnMatch(userInput: string, columnNames: string[], threshold: number = 0.4): string | null {
  const fuse = new Fuse(columnNames, { includeScore: true, threshold });
  const result = fuse.search(userInput);
  if (result.length > 0) {
    return result[0].item;
  }
  return null;
} 

// Intent detection utility
export function detectIntent(query: string, columnNames: string[]): { intent: string, columns: string[] } {
  const lower = query.toLowerCase();
  let intent = 'unknown';
  if (/(chart|plot|graph|visualize|draw)/.test(lower)) intent = 'chart';
  else if (/(distribution|histogram|bar chart|pie chart)/.test(lower)) intent = 'distribution';
  else if (/(correlation|relationship|association|scatter)/.test(lower)) intent = 'correlation';
  else if (/(outlier|anomal(y|ies))/i.test(lower)) intent = 'outliers';
  else if (/(summary|describe|overview|info|information)/.test(lower)) intent = 'summary';
  else if (/(stat|mean|median|average|min|max|std|standard deviation|variance)/.test(lower)) intent = 'stat';
  else if (/(insight|recommend|suggest|pattern|trend)/.test(lower)) intent = 'insight';

  // Try to extract column mentions using fuzzy matching
  const mentioned: string[] = [];
  for (const col of columnNames) {
    if (lower.includes(col.toLowerCase())) mentioned.push(col);
    else if (fuzzyColumnMatch(lower, [col], 0.3) === col) mentioned.push(col);
  }
  return { intent, columns: Array.from(new Set(mentioned)) };
} 