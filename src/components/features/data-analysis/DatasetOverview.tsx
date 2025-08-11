import React from 'react';
import { DatasetInfo } from '@/types/data';
import { Database, FileText, Hash, AlertTriangle, Download } from 'lucide-react';
import { exportService } from '@/services/data/exportService';

interface DatasetOverviewProps {
  datasetInfo: DatasetInfo;
}

const DatasetOverview: React.FC<DatasetOverviewProps> = ({ datasetInfo }) => {
  const handleExportDatasetInfo = async () => {
    try {
      const data = datasetInfo.columns.map(col => ({
        'Column Name': col.name,
        'Data Type': col.type,
        'Missing Count': col.nullCount,
        'Missing Percentage': `${col.nullPercentage.toFixed(1)}%`,
        'Unique Count': col.uniqueCount,
        'Sample Values': col.sampleValues.join(', ')
      }));
      await exportService.exportToCSV(data, 'dataset_overview.csv');
    } catch (error) {
      console.error(`Export failed: ${error}`);
    }
  };

  const handleExportSampleData = async () => {
    try {
      await exportService.exportToCSV(datasetInfo.sampleData, 'sample_data.csv');
    } catch (error) {
      console.error(`Export failed: ${error}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Dataset Overview</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportDatasetInfo}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            title="Export Dataset Info as CSV"
          >
            <FileText className="w-4 h-4" />
            <span>Export Info</span>
          </button>
          <button
            onClick={handleExportSampleData}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
            title="Export Sample Data as CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export Sample</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Rows</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{datasetInfo.totalRows.toLocaleString()}</p>
        </div>
        
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Hash className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">Columns</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{datasetInfo.totalColumns}</p>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">Missing Values</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">
            {datasetInfo.columns.filter(col => col.nullCount > 0).length}
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Column Information</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Column</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Missing</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Unique</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {datasetInfo.columns.map((col, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{col.name}</td>
                  <td className="py-3 px-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${col.type === 'numeric' ? 'bg-blue-100 text-blue-800' : 
                        col.type === 'categorical' ? 'bg-green-100 text-green-800' :
                        col.type === 'datetime' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {col.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {col.nullCount > 0 ? (
                      <span className="text-red-600 font-medium">
                        {col.nullCount} ({col.nullPercentage.toFixed(1)}%)
                      </span>
                    ) : (
                      <span className="text-green-600">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{col.uniqueCount}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                    {col.sampleValues.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sample Data</h3>
        <div className="overflow-x-auto bg-gray-50 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(datasetInfo.sampleData[0] || {}).map(key => (
                  <th key={key} className="text-left py-3 px-4 font-medium text-gray-900">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {datasetInfo.sampleData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  {Object.values(row).map((value, cellIndex) => (
                    <td key={cellIndex} className="py-3 px-4 text-gray-700 max-w-xs truncate">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatasetOverview;