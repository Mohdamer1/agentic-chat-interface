import * as XLSX from 'xlsx';
import { DataRow, EDAResults } from '@/types/data';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'png' | 'svg' | 'pdf';
  filename?: string;
  includeCharts?: boolean;
  includeStats?: boolean;
  includeRecommendations?: boolean;
}

export interface ExportProgress {
  current: number;
  total: number;
  stage: 'preparing' | 'processing' | 'generating' | 'downloading';
  message: string;
}

export class ExportService {
  private static instance: ExportService;

  private constructor() {}

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Export data to CSV format
   */
  public async exportToCSV(data: DataRow[], filename: string = 'export.csv'): Promise<void> {
    try {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      this.downloadFile(blob, filename);
    } catch (error) {
      throw new Error(`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export data to Excel format
   */
  public async exportToExcel(data: DataRow[], filename: string = 'export.xlsx'): Promise<void> {
    try {
      console.log('Starting Excel export with data length:', data.length);
      
      // Process data to handle Excel limitations
      const processedData = data.map((row, index) => {
        const processedRow: DataRow = {};
        Object.keys(row).forEach(key => {
          let value = row[key];
          
          // Convert to string and handle text length limitation (Excel max: 32767 characters)
          if (value !== null && value !== undefined) {
            const stringValue = String(value);
            if (stringValue.length > 32767) {
              console.log(`Truncating long value in row ${index}, column ${key}: ${stringValue.length} characters`);
              value = stringValue.substring(0, 32767) + ' [TRUNCATED]';
            } else {
              value = stringValue;
            }
          } else {
            value = '';
          }
          
          processedRow[key] = value;
        });
        return processedRow;
      });

      console.log('Data processing completed. Processed rows:', processedData.length);

      // Validate processed data
      if (processedData.length === 0) {
        throw new Error('No data to export after processing');
      }

      // Check for any remaining long values
      let maxLength = 0;
      let maxLengthLocation = '';
      processedData.forEach((row, rowIndex) => {
        Object.keys(row).forEach(key => {
          const length = String(row[key]).length;
          if (length > maxLength) {
            maxLength = length;
            maxLengthLocation = `Row ${rowIndex}, Column ${key}`;
          }
        });
      });
      
      console.log(`Maximum text length after processing: ${maxLength} at ${maxLengthLocation}`);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(processedData);

      // Auto-size columns with reasonable limits
      const columnWidths = Object.keys(processedData[0] || {}).map(key => ({
        wch: Math.min(Math.max(key.length, ...processedData.map(row => String(row[key] || '').length)), 50)
      }));
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      console.log('Workbook created, generating Excel buffer...');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      console.log('Excel buffer generated, creating blob...');
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      console.log('Blob created, downloading file...');
      this.downloadFile(blob, filename);
      console.log('Excel export completed successfully');
      
    } catch (error) {
      console.error('Excel export error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Excel export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export chart as PNG image
   */
  public async exportChartAsPNG(
    chartElement: HTMLElement,
    filename: string = 'chart.png'
  ): Promise<void> {
    try {
      // Use html2canvas to capture chart
      const html2canvas = await this.loadHtml2Canvas();
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          this.downloadFile(blob, filename);
        }
      }, 'image/png', 0.95);

    } catch (error) {
      throw new Error(`PNG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export chart as SVG
   */
  public async exportChartAsSVG(
    chartElement: HTMLElement,
    filename: string = 'chart.svg'
  ): Promise<void> {
    try {
      // Clone the element and get SVG content
      const clonedElement = chartElement.cloneNode(true) as HTMLElement;
      const svgElement = clonedElement.querySelector('svg');
      
      if (!svgElement) {
        throw new Error('No SVG element found in chart');
      }

      // Get SVG content as string
      const svgContent = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      
      this.downloadFile(blob, filename);

    } catch (error) {
      throw new Error(`SVG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate PDF report with charts and analysis
   */
  public async generatePDFReport(
    edaResults: EDAResults,
    filename: string = 'report.pdf',
    chartElements?: HTMLElement[]
  ): Promise<void> {
    try {
      // Load jsPDF dynamically
      const jsPDF = await this.loadJsPDF();
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Data Analysis Report', 20, 20);
      
      // Add dataset overview
      doc.setFontSize(14);
      doc.text('Dataset Overview', 20, 40);
      doc.setFontSize(12);
      doc.text(`File: ${edaResults.datasetInfo.fileName}`, 20, 55);
      doc.text(`Rows: ${edaResults.datasetInfo.totalRows}`, 20, 65);
      doc.text(`Columns: ${edaResults.datasetInfo.totalColumns}`, 20, 75);

      // Add key statistics
      if (edaResults.numericStats.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Key Statistics', 20, 20);
        
        let yPosition = 35;
        edaResults.numericStats.slice(0, 5).forEach(stat => {
          doc.setFontSize(10);
          doc.text(`${stat.column}:`, 20, yPosition);
          doc.text(`Mean: ${stat.mean.toFixed(2)}, Std: ${stat.std.toFixed(2)}`, 40, yPosition);
          yPosition += 10;
        });
      }

      // Add recommendations
      if (edaResults.recommendations.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('AI Recommendations', 20, 20);
        
        let yPosition = 35;
        edaResults.recommendations.slice(0, 10).forEach(rec => {
          doc.setFontSize(10);
          const lines = doc.splitTextToSize(rec, 170);
          lines.forEach(line => {
            doc.text(line, 20, yPosition);
            yPosition += 7;
          });
          yPosition += 5;
        });
      }

      // Add charts if provided
      if (chartElements && chartElements.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Data Visualizations', 20, 20);
        
        // Note: For now, we'll add chart placeholders
        // In a full implementation, we'd convert charts to images and embed them
        doc.setFontSize(10);
        doc.text('Charts and visualizations would be embedded here', 20, 40);
        doc.text('(Requires chart-to-image conversion)', 20, 50);
      }

      // Save PDF
      doc.save(filename);

    } catch (error) {
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download file to user's device
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Dynamically load html2canvas library
   */
  private async loadHtml2Canvas(): Promise<any> {
    try {
      const module = await import('html2canvas');
      return module.default;
    } catch (error) {
      throw new Error('html2canvas library not available. Please install it first.');
    }
  }

  /**
   * Dynamically load jsPDF library
   */
  private async loadJsPDF(): Promise<any> {
    try {
      const module = await import('jspdf');
      return module.default;
    } catch (error) {
      throw new Error('jsPDF library not available. Please install it first.');
    }
  }
}

export const exportService = ExportService.getInstance();
