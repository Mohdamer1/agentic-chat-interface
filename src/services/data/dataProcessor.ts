import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataRow, DatasetInfo, ColumnInfo, EDAResults, NumericStats, CategoricalStats } from '@/types/data';
import { groqService } from '@/services/api/groqService';

export const parseCSV = (file: File): Promise<DataRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(results.errors);
        } else {
          resolve(results.data as DataRow[]);
        }
      },
      error: (error) => reject(error),
    });
  });
};

export const parseExcel = (file: File): Promise<DataRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData as DataRow[]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

const detectColumnType = (values: any[]): 'numeric' | 'categorical' | 'datetime' | 'boolean' => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'categorical';
  
  // Check for boolean
  const uniqueValues = [...new Set(nonNullValues.map(v => String(v).toLowerCase()))];
  if (uniqueValues.length <= 2 && uniqueValues.every(v => ['true', 'false', '1', '0', 'yes', 'no'].includes(v))) {
    return 'boolean';
  }
  
  // Check for numeric
  const numericValues = nonNullValues.filter(v => !isNaN(Number(v)) && v !== '');
  if (numericValues.length / nonNullValues.length > 0.8) {
    return 'numeric';
  }
  
  // Check for datetime
  const dateValues = nonNullValues.filter(v => !isNaN(Date.parse(v)));
  if (dateValues.length / nonNullValues.length > 0.8) {
    return 'datetime';
  }
  
  return 'categorical';
};

export const analyzeDataset = (data: DataRow[], fileName: string): DatasetInfo => {
  if (data.length === 0) {
    throw new Error('Dataset is empty');
  }
  
  const columns = Object.keys(data[0]);
  const columnInfos: ColumnInfo[] = columns.map(colName => {
    const values = data.map(row => row[colName]);
    const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
    const uniqueValues = [...new Set(values.filter(v => v !== null && v !== undefined && v !== ''))];
    
    return {
      name: colName,
      type: detectColumnType(values),
      nullCount,
      nullPercentage: (nullCount / data.length) * 100,
      uniqueCount: uniqueValues.length,
      sampleValues: uniqueValues.slice(0, 5)
    };
  });
  
  return {
    totalRows: data.length,
    totalColumns: columns.length,
    columns: columnInfos,
    sampleData: data.slice(0, 10),
    fileName
  };
};

const calculateNumericStats = (data: DataRow[], column: string): NumericStats => {
  const values = data
    .map(row => Number(row[column]))
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b);
  
  const count = values.length;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const std = Math.sqrt(variance);
  
  const q25Index = Math.floor(count * 0.25);
  const medianIndex = Math.floor(count * 0.5);
  const q75Index = Math.floor(count * 0.75);
  
  return {
    column,
    count,
    mean: Number(mean.toFixed(2)),
    std: Number(std.toFixed(2)),
    min: values[0],
    q25: values[q25Index],
    median: values[medianIndex],
    q75: values[q75Index],
    max: values[count - 1]
  };
};

const calculateCategoricalStats = (data: DataRow[], column: string): CategoricalStats => {
  const values = data
    .map(row => String(row[column]))
    .filter(v => v !== 'null' && v !== 'undefined' && v !== '');
  
  const distribution: { [key: string]: number } = {};
  values.forEach(val => {
    distribution[val] = (distribution[val] || 0) + 1;
  });
  
  const sortedEntries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const topEntry = sortedEntries[0];
  
  return {
    column,
    count: values.length,
    unique: Object.keys(distribution).length,
    top: topEntry ? topEntry[0] : '',
    freq: topEntry ? topEntry[1] : 0,
    distribution
  };
};

const calculateCorrelations = (data: DataRow[], numericColumns: string[]): { [key: string]: { [key: string]: number } } => {
  const correlations: { [key: string]: { [key: string]: number } } = {};
  
  numericColumns.forEach(col1 => {
    correlations[col1] = {};
    numericColumns.forEach(col2 => {
      const values1 = data.map(row => Number(row[col1])).filter(v => !isNaN(v));
      const values2 = data.map(row => Number(row[col2])).filter(v => !isNaN(v));
      
      if (values1.length !== values2.length) {
        correlations[col1][col2] = 0;
        return;
      }
      
      const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
      const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
      
      const numerator = values1.reduce((acc, val, i) => acc + (val - mean1) * (values2[i] - mean2), 0);
      const denominator = Math.sqrt(
        values1.reduce((acc, val) => acc + Math.pow(val - mean1, 2), 0) *
        values2.reduce((acc, val) => acc + Math.pow(val - mean2, 2), 0)
      );
      
      correlations[col1][col2] = denominator === 0 ? 0 : Number((numerator / denominator).toFixed(3));
    });
  });
  
  return correlations;
};

const detectOutliers = (data: DataRow[], column: string): { column: string; outlierCount: number; outlierIndices: number[] } => {
  const values = data.map((row, index) => ({ value: Number(row[column]), index }))
    .filter(item => !isNaN(item.value));
  
  if (values.length === 0) {
    return { column, outlierCount: 0, outlierIndices: [] };
  }
  
  const sortedValues = [...values].sort((a, b) => a.value - b.value);
  const q1Index = Math.floor(sortedValues.length * 0.25);
  const q3Index = Math.floor(sortedValues.length * 0.75);
  const q1 = sortedValues[q1Index].value;
  const q3 = sortedValues[q3Index].value;
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outliers = values.filter(item => item.value < lowerBound || item.value > upperBound);
  
  return {
    column,
    outlierCount: outliers.length,
    outlierIndices: outliers.map(item => item.index)
  };
};

export const performEDA = async (data: DataRow[], fileName: string): Promise<EDAResults> => {
  const datasetInfo = analyzeDataset(data, fileName);
  
  const numericColumns = datasetInfo.columns.filter(col => col.type === 'numeric').map(col => col.name);
  const categoricalColumns = datasetInfo.columns.filter(col => col.type === 'categorical').map(col => col.name);
  
  const numericStats = numericColumns.map(col => calculateNumericStats(data, col));
  const categoricalStats = categoricalColumns.map(col => calculateCategoricalStats(data, col));
  
  const missingValues = datasetInfo.columns
    .filter(col => col.nullCount > 0)
    .map(col => ({
      column: col.name,
      count: col.nullCount,
      percentage: Number(col.nullPercentage.toFixed(1))
    }));
  
  const correlations = calculateCorrelations(data, numericColumns);
  const outliers = numericColumns.map(col => detectOutliers(data, col)).filter(result => result.outlierCount > 0);
  
  // Generate AI-powered recommendations
  const edaResults: EDAResults = {
    datasetInfo,
    numericStats,
    categoricalStats,
    missingValues,
    correlations,
    outliers,
    recommendations: []
  };
  
  try {
    const aiRecommendations = await groqService.generateDatasetInsights(edaResults, data);
    edaResults.recommendations = aiRecommendations;
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    edaResults.recommendations = generateRecommendations(datasetInfo, missingValues, outliers);
  }
  
  return edaResults;
};

const generateRecommendations = (
  datasetInfo: DatasetInfo,
  missingValues: { column: string; count: number; percentage: number }[],
  outliers: { column: string; outlierCount: number; outlierIndices: number[] }[]
): string[] => {
  const recommendations: string[] = [];
  
  // Missing values recommendations
  missingValues.forEach(mv => {
    if (mv.percentage > 50) {
      recommendations.push(`Consider dropping column '${mv.column}' - it has ${mv.percentage}% missing values`);
    } else if (mv.percentage > 10) {
      recommendations.push(`Address missing values in '${mv.column}' (${mv.percentage}%) - consider imputation or removal`);
    }
  });
  
  // Outliers recommendations
  outliers.forEach(ol => {
    if (ol.outlierCount > datasetInfo.totalRows * 0.05) {
      recommendations.push(`Review outliers in '${ol.column}' - ${ol.outlierCount} potential outliers detected`);
    }
  });
  
  // General recommendations
  if (datasetInfo.totalRows < 100) {
    recommendations.push('Small dataset - consider gathering more data for robust analysis');
  }
  
  const highCardinalityColumns = datasetInfo.columns.filter(col => 
    col.type === 'categorical' && col.uniqueCount > datasetInfo.totalRows * 0.5
  );
  
  highCardinalityColumns.forEach(col => {
    recommendations.push(`Column '${col.name}' has high cardinality - consider grouping or encoding strategies`);
  });
  
  if (recommendations.length === 0) {
    recommendations.push('Dataset looks clean! Ready for analysis and modeling.');
  }
  
  return recommendations;
};