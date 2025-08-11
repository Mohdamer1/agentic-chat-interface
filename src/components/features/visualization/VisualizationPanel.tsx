import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterPlot, Scatter } from 'recharts';
import { EDAResults } from '@/types/data';
import { TrendingUp, Download, Image, BarChart3 } from 'lucide-react';
import { exportService } from '@/services/data/exportService';

interface VisualizationPanelProps {
  edaResults: EDAResults;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ edaResults }) => {
  const { numericStats, categoricalStats, correlations } = edaResults;

  const renderExportButtons = (chartRef: React.RefObject<HTMLDivElement>, chartName: string) => {
    const handleExport = async (format: 'png' | 'svg') => {
      if (!chartRef.current) return;
      
      try {
        const filename = `${chartName}_${format}`;
        if (format === 'png') {
          await exportService.exportChartAsPNG(chartRef.current, `${filename}.png`);
        } else {
          await exportService.exportChartAsSVG(chartRef.current, `${filename}.svg`);
        }
      } catch (error) {
        console.error(`Export failed: ${error}`);
      }
    };

    return (
      <div className="flex space-x-2 mt-3">
        <button
          onClick={() => handleExport('png')}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          title="Export as PNG"
        >
          <Image className="w-3 h-3" />
          <span>PNG</span>
        </button>
        <button
          onClick={() => handleExport('svg')}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
          title="Export as SVG"
        >
          <BarChart3 className="w-3 h-3" />
          <span>SVG</span>
        </button>
      </div>
    );
  };

  const renderCategoricalChart = (stat: any, index: number) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const data = Object.entries(stat.distribution)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    return (
      <div key={index} className="bg-white rounded-lg border p-4" ref={chartRef}>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900">{stat.column} Distribution</h4>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Download className="w-3 h-3" />
            <span>Export:</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
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
            <Bar dataKey="value" fill={COLORS[index % COLORS.length]} />
          </BarChart>
        </ResponsiveContainer>
        {renderExportButtons(chartRef, `${stat.column}_distribution`)}
      </div>
    );
  };

  const renderNumericHistogram = (stat: any, index: number) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const data = [
      { range: 'Min', value: stat.min },
      { range: 'Q1', value: stat.q25 },
      { range: 'Median', value: stat.median },
      { range: 'Q3', value: stat.q75 },
      { range: 'Max', value: stat.max }
    ];

    return (
      <div key={index} className="bg-white rounded-lg border p-4" ref={chartRef}>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900">{stat.column} Distribution</h4>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Download className="w-3 h-3" />
            <span>Export:</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill={COLORS[index % COLORS.length]} />
          </BarChart>
        </ResponsiveContainer>
        {renderExportButtons(chartRef, `${stat.column}_distribution`)}
      </div>
    );
  };

  const renderCorrelationHeatmap = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const numericColumns = Object.keys(correlations);
    if (numericColumns.length < 2) return null;

    const correlationData = numericColumns.slice(0, 5).map(col1 => 
      numericColumns.slice(0, 5).map(col2 => ({
        x: col1,
        y: col2,
        value: correlations[col1]?.[col2] || 0
      }))
    ).flat();

    return (
      <div className="bg-white rounded-lg border p-4" ref={chartRef}>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900">Correlation Matrix (Top 5 Numeric Columns)</h4>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Download className="w-3 h-3" />
            <span>Export:</span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1 text-xs">
          {correlationData.map((item, index) => (
            <div
              key={index}
              className="aspect-square flex items-center justify-center rounded text-white font-medium"
              style={{
                backgroundColor: `rgba(37, 99, 235, ${Math.abs(item.value)})`
              }}
              title={`${item.x} vs ${item.y}: ${item.value.toFixed(3)}`}
            >
              {item.value.toFixed(2)}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>-1.0 (Strong Negative)</span>
          <span>0.0 (No Correlation)</span>
          <span>1.0 (Strong Positive)</span>
        </div>
        {renderExportButtons(chartRef, 'correlation_matrix')}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Data Visualizations</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoricalStats.slice(0, 4).map(renderCategoricalChart)}
        {numericStats.slice(0, 4).map(renderNumericHistogram)}
      </div>
      
      {Object.keys(correlations).length > 1 && (
        <div className="grid grid-cols-1">
          {renderCorrelationHeatmap()}
        </div>
      )}
    </div>
  );
};

export default VisualizationPanel;