import React, { useRef, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line, 
  AreaChart, Area
} from 'recharts';
import { EDAResults } from '@/types/data';
import { TrendingUp, Download, Image, BarChart3 } from 'lucide-react';
import { exportService } from '@/services/data/exportService';

interface VisualizationPanelProps {
  edaResults: EDAResults;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ edaResults }) => {
  console.log('Full VisualizationPanel loaded with:', edaResults);
  
  const { numericStats, categoricalStats, correlations } = edaResults;
  const [chartTheme, setChartTheme] = useState<'default' | 'dark' | 'minimal'>('default');

  // Enhanced chart type detection based on data characteristics
  const getRecommendedChartType = (data: any) => {
    if (data.length === 0) return 'bar';
    
    const isNumeric = typeof data[0] === 'number';
    const uniqueValues = new Set(data).size;
    
    if (isNumeric) {
      if (uniqueValues > 20) return 'histogram';
      if (uniqueValues > 10) return 'box';
      return 'bar';
    } else {
      if (uniqueValues > 15) return 'bar';
      if (uniqueValues <= 8) return 'pie';
      return 'bar';
    }
  };

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

  const renderChartTypeSelector = (chartName: string, currentType: string, onTypeChange: (type: string) => void) => {
    const chartTypes = [
      { value: 'auto', label: 'Auto', icon: '🤖' },
      { value: 'bar', label: 'Bar', icon: '📊' },
      { value: 'line', label: 'Line', icon: '📈' },
      { value: 'area', label: 'Area', icon: '🌊' },
      { value: 'pie', label: 'Pie', icon: '🥧' },
      { value: 'scatter', label: 'Scatter', icon: '🔍' },
      { value: 'histogram', label: 'Histogram', icon: '📊' },
      { value: 'box', label: 'Box Plot', icon: '📦' }
    ];

    return (
      <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded border">
        <span className="text-sm font-medium text-gray-700">Chart Type:</span>
        <select
          value={currentType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {chartTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500">(Current: {currentType})</span>
      </div>
    );
  };

  const renderAdvancedChart = (data: any[], chartType: string, chartName: string, index: number) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [localChartType, setLocalChartType] = useState(chartType);
    
    const effectiveChartType = localChartType === 'auto' ? getRecommendedChartType(data) : localChartType;

    const renderChart = () => {
      switch (effectiveChartType) {
        case 'line':
          return (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={COLORS[index % COLORS.length]} strokeWidth={2} />
            </LineChart>
          );
        
        case 'area':
          return (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
            </AreaChart>
          );
        
        case 'scatter':
          return (
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Scatter dataKey="value" fill={COLORS[index % COLORS.length]} />
            </ScatterChart>
          );
        
        case 'histogram':
          // Create histogram data from numeric values
          const numericData = data.map(d => d.value).filter(v => typeof v === 'number');
          if (numericData.length > 0) {
            const min = Math.min(...numericData);
            const max = Math.max(...numericData);
            const binCount = Math.min(10, Math.ceil(Math.sqrt(numericData.length)));
            const binSize = (max - min) / binCount;
            
            const histogramData = Array.from({ length: binCount }, (_, i) => {
              const binStart = min + i * binSize;
              const binEnd = binStart + binSize;
              const count = numericData.filter(v => v >= binStart && v < binEnd).length;
              return { range: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`, count };
            });
            
            return (
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS[index % COLORS.length]} />
              </BarChart>
            );
          }
          return <div className="text-center text-gray-500 py-8">Insufficient numeric data for histogram</div>;
        
        case 'box':
          // Create box plot data
          const boxData = data.map(d => d.value).filter(v => typeof v === 'number');
          if (boxData.length > 0) {
            const sorted = boxData.sort((a, b) => a - b);
            const q1 = sorted[Math.floor(sorted.length * 0.25)];
            const q2 = sorted[Math.floor(sorted.length * 0.5)];
            const q3 = sorted[Math.floor(sorted.length * 0.75)];
            const iqr = q3 - q1;
            const lowerBound = q1 - 1.5 * iqr;
            const upperBound = q3 + 1.5 * iqr;
            
            const boxPlotData = [{
              name: chartName,
              min: Math.max(lowerBound, sorted[0]),
              q1,
              median: q2,
              q3,
              max: Math.min(upperBound, sorted[sorted.length - 1])
            }];
            
            return (
              <BarChart data={boxPlotData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="q1" fill={COLORS[index % COLORS.length]} />
                <Bar dataKey="median" fill={COLORS[index % COLORS.length]} />
                <Bar dataKey="q3" fill={COLORS[index % COLORS.length]} />
              </BarChart>
            );
          }
          return <div className="text-center text-gray-500 py-8">Insufficient numeric data for box plot</div>;
        
        case 'pie':
          return (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_: any, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          );
        
        default: // bar chart
          return (
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
          );
      }
    };

    return (
      <div key={index} className="bg-white rounded-lg border p-4" ref={chartRef}>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900">{chartName}</h4>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Download className="w-3 h-3" />
            <span>Export:</span>
          </div>
        </div>
        
        {renderChartTypeSelector(chartName, localChartType, setLocalChartType)}
        
        <ResponsiveContainer width="100%" height={250}>
          {renderChart()}
        </ResponsiveContainer>
        
        {renderExportButtons(chartRef, `${chartName}_${effectiveChartType}`)}
      </div>
    );
  };

  const renderCategoricalChart = (stat: any, index: number) => {
    const data = Object.entries(stat.distribution)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    return renderAdvancedChart(data, 'auto', `${stat.column} Distribution`, index);
  };

  const renderNumericChart = (stat: any, index: number) => {
    const data = [
      { name: 'Min', value: stat.min },
      { name: 'Q1', value: stat.q25 },
      { name: 'Median', value: stat.median },
      { name: 'Q3', value: stat.q75 },
      { name: 'Max', value: stat.max }
    ];

    return renderAdvancedChart(data, 'auto', `${stat.column} Distribution`, index);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Advanced Data Visualizations</h3>
        </div>
        
        {/* Chart Theme Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Theme:</span>
          <select
            value={chartTheme}
            onChange={(e) => setChartTheme(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="dark">Dark</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>
      
      {/* Show ALL available charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoricalStats.map((stat, index) => {
          console.log('Rendering categorical chart:', stat);
          return renderCategoricalChart(stat, index);
        })}
        {numericStats.map((stat, index) => {
          console.log('Rendering numeric chart:', stat);
          return renderNumericChart(stat, index);
        })}
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