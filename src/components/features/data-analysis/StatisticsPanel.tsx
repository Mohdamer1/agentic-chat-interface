import React from 'react';
import { NumericStats, CategoricalStats } from '@/types/data';
import { BarChart3, PieChart, Download, FileText } from 'lucide-react';
import { exportService } from '@/services/data/exportService';

interface StatisticsPanelProps {
  numericStats: NumericStats[];
  categoricalStats: CategoricalStats[];
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ numericStats, categoricalStats }) => {
  const handleExportStats = async (type: 'numeric' | 'categorical') => {
    try {
      let data: any[] = [];
      let filename = '';
      
      if (type === 'numeric') {
        data = numericStats.map(stat => ({
          Column: stat.column,
          Count: stat.count,
          Mean: stat.mean,
          Std: stat.std,
          Min: stat.min,
          '25%': stat.q25,
          '50% (Median)': stat.median,
          '75%': stat.q75,
          Max: stat.max
        }));
        filename = 'numeric_statistics.csv';
      } else {
        data = categoricalStats.map(stat => ({
          Column: stat.column,
          Count: stat.count,
          Unique: stat.unique,
          'Most Frequent': stat.top,
          Frequency: stat.freq,
          'Top Values': Object.entries(stat.distribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([value, count]) => `${value}:${count}`)
            .join(', ')
        }));
        filename = 'categorical_statistics.csv';
      }
      
      await exportService.exportToCSV(data, filename);
    } catch (error) {
      console.error(`Export failed: ${error}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Numeric Statistics */}
      {numericStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Numeric Statistics</h3>
            </div>
            <button
              onClick={() => handleExportStats('numeric')}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              title="Export as CSV"
            >
              <FileText className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {numericStats.map((stat, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{stat.column}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Count:</span>
                    <span className="ml-2 font-medium">{stat.count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mean:</span>
                    <span className="ml-2 font-medium">{stat.mean}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Std:</span>
                    <span className="ml-2 font-medium">{stat.std}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Min:</span>
                    <span className="ml-2 font-medium">{stat.min}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">25%:</span>
                    <span className="ml-2 font-medium">{stat.q25}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">50% (Median):</span>
                    <span className="ml-2 font-medium">{stat.median}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">75%:</span>
                    <span className="ml-2 font-medium">{stat.q75}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Max:</span>
                    <span className="ml-2 font-medium">{stat.max}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Categorical Statistics */}
      {categoricalStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <PieChart className="h-6 w-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">Categorical Statistics</h3>
            </div>
            <button
              onClick={() => handleExportStats('categorical')}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
              title="Export as CSV"
            >
              <FileText className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {categoricalStats.map((stat, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{stat.column}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Count:</span>
                    <span className="ml-2 font-medium">{stat.count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Unique:</span>
                    <span className="ml-2 font-medium">{stat.unique}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Most Frequent:</span>
                    <span className="ml-2 font-medium">{stat.top}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <span className="ml-2 font-medium">{stat.freq}</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm mb-2 block">Top Values:</span>
                  <div className="space-y-1">
                    {Object.entries(stat.distribution)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([value, count]) => (
                        <div key={value} className="flex justify-between items-center text-xs">
                          <span className="truncate max-w-32">{value}</span>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="bg-emerald-200 h-2 rounded"
                              style={{ width: `${(count / stat.count) * 60}px` }}
                            ></div>
                            <span className="text-gray-600 w-8">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPanel;