import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Image, FileText as FileTextIcon, BarChart3 } from 'lucide-react';
import { exportService } from '@/services/data/exportService';
import { DataRow, EDAResults } from '@/types/data';

interface ExportPanelProps {
  data: DataRow[];
  filename?: string;
  isVisible: boolean;
  onClose: () => void;
  edaResults?: EDAResults;
  chartElements?: HTMLElement[];
}

const ExportPanel: React.FC<ExportPanelProps> = ({ 
  data, 
  filename = 'dataset', 
  isVisible, 
  onClose,
  edaResults,
  chartElements
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleExport = async (format: 'csv' | 'excel' | 'png' | 'svg' | 'pdf') => {
    if (!data || data.length === 0) {
      setErrorMessage('No data available for export');
      setExportStatus('error');
      return;
    }

    setIsExporting(true);
    setExportStatus('idle');
    setErrorMessage('');

    try {
      let exportFilename: string;

      switch (format) {
        case 'csv':
          exportFilename = `${filename}.csv`;
          await exportService.exportToCSV(data, exportFilename);
          break;
        case 'excel':
          exportFilename = `${filename}.xlsx`;
          await exportService.exportToExcel(data, exportFilename);
          break;
        case 'png':
          if (chartElements && chartElements.length > 0) {
            exportFilename = `${filename}_charts.png`;
            await exportService.exportChartAsPNG(chartElements[0], exportFilename);
          } else {
            throw new Error('No charts available for export');
          }
          break;
        case 'svg':
          if (chartElements && chartElements.length > 0) {
            exportFilename = `${filename}_charts.svg`;
            await exportService.exportChartAsSVG(chartElements[0], exportFilename);
          } else {
            throw new Error('No charts available for export');
          }
          break;
        case 'pdf':
          exportFilename = `${filename}_report.pdf`;
          await exportService.generatePDFReport(edaResults!, exportFilename, chartElements);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      setExportStatus('success');
      setTimeout(() => {
        setExportStatus('idle');
        onClose();
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Export failed');
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Data</h2>
          
          {/* Warning about Excel limitations */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Excel has a 32,767 character limit per cell. Long text will be truncated.
            </p>
          </div>
          
          <div className="space-y-3">
            {/* Data Export Options */}
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Data Export</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={isExporting || !data || data.length === 0}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <FileText className="w-5 h-5" />
                  <span>Export as CSV</span>
                </button>

                <button
                  onClick={() => handleExport('excel')}
                  disabled={isExporting || !data || data.length === 0}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg border-2 border-green-500 text-green-600 hover:bg-green-50"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Export as Excel</span>
                </button>
              </div>
            </div>

            {/* Chart Export Options */}
            {chartElements && chartElements.length > 0 && (
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Chart Export</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleExport('png')}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    <Image className="w-5 h-5" />
                    <span>Export Charts as PNG</span>
                  </button>

                  <button
                    onClick={() => handleExport('svg')}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Export Charts as SVG</span>
                  </button>
                </div>
              </div>
            )}

            {/* PDF Report Option */}
            {edaResults && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Report Generation</h3>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg border-2 border-red-500 text-red-600 hover:bg-red-50"
                >
                  <FileTextIcon className="w-5 h-5" />
                  <span>Generate PDF Report</span>
                </button>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {isExporting && (
            <div className="mt-4 flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Exporting data...</span>
            </div>
          )}

          {exportStatus === 'success' && (
            <div className="mt-4 flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <span className="text-sm">Export completed successfully!</span>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
