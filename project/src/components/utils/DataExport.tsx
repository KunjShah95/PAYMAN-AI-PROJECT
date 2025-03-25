import React from 'react';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';

interface DataExportProps {
  data: any[];
  filename: string;
}

const DataExport: React.FC<DataExportProps> = ({ data, filename }) => {
  // Function to export as CSV
  const exportAsCSV = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from the first item
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add rows
    data.forEach(item => {
      const row = headers.map(header => {
        // Handle values with commas by wrapping in quotes
        const value = item[header]?.toString() || '';
        return value.includes(',') ? `"${value}"` : value;
      }).join(',');
      
      csvContent += row + '\n';
    });
    
    // Create and download blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to export as Excel (actually CSV with .xlsx extension)
  const exportAsExcel = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from the first item
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add rows
    data.forEach(item => {
      const row = headers.map(header => {
        // Handle values with commas by wrapping in quotes
        const value = item[header]?.toString() || '';
        return value.includes(',') ? `"${value}"` : value;
      }).join(',');
      
      csvContent += row + '\n';
    });
    
    // Create and download blob
    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to export as PDF
  const exportAsPDF = () => {
    // For a real implementation, you would use a library like jsPDF
    // This is just a placeholder for now
    alert('PDF export would require a library like jsPDF. To implement fully, we would need to add the library to the project.');
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm font-medium mr-2">Export:</div>
      <button
        onClick={exportAsCSV}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
        title="Export as CSV"
      >
        <FileText className="h-4 w-4 mr-1" />
        CSV
      </button>
      <button
        onClick={exportAsExcel}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
        title="Export as Excel"
      >
        <FileSpreadsheet className="h-4 w-4 mr-1" />
        Excel
      </button>
      <button
        onClick={exportAsPDF}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
        title="Export as PDF"
      >
        <Download className="h-4 w-4 mr-1" />
        PDF
      </button>
    </div>
  );
};

export default DataExport; 