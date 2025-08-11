export interface DataRow {
  [key: string]: any;
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'boolean';
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  sampleValues: any[];
}

export interface DatasetInfo {
  totalRows: number;
  totalColumns: number;
  columns: ColumnInfo[];
  sampleData: DataRow[];
  fileName: string;
}

export interface NumericStats {
  column: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
}

export interface CategoricalStats {
  column: string;
  count: number;
  unique: number;
  top: string;
  freq: number;
  distribution: { [key: string]: number };
}

export interface EDAResults {
  datasetInfo: DatasetInfo;
  numericStats: NumericStats[];
  categoricalStats: CategoricalStats[];
  missingValues: { column: string; count: number; percentage: number }[];
  correlations: { [key: string]: { [key: string]: number } };
  outliers: { column: string; outlierCount: number; outlierIndices: number[] }[];
  recommendations: string[];
}