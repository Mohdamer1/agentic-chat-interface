import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface RecommendationsPanelProps {
  recommendations: string[];
  missingValues: { column: string; count: number; percentage: number }[];
  outliers: { column: string; outlierCount: number; outlierIndices: number[] }[];
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ 
  recommendations, 
  missingValues, 
  outliers 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="h-6 w-6 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
        </div>
        
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
              <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-900">{rec}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Missing Values */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <XCircle className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Missing Values</h3>
        </div>
        
        {missingValues.length > 0 ? (
          <div className="space-y-3">
            {missingValues.map((mv, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-900">{mv.column}</p>
                  <p className="text-sm text-red-600">{mv.count} missing values</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-900">{mv.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-900">No missing values detected!</p>
          </div>
        )}
      </div>
      
      {/* Outliers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Outliers</h3>
        </div>
        
        {outliers.length > 0 ? (
          <div className="space-y-3">
            {outliers.map((outlier, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-orange-900">{outlier.column}</p>
                  <p className="text-sm text-orange-600">Potential outliers detected</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-900">{outlier.outlierCount}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-900">No significant outliers detected!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPanel;