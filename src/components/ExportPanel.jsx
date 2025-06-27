import React, { useState } from 'react';
import { Download, FileText, Settings, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const ExportPanel = ({ data, rules, priorities, validationResults }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeValidationReport, setIncludeValidationReport] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const getTotalErrors = () => {
    return Object.values(validationResults).reduce((sum, errors) => sum + errors.length, 0);
  };

  const generateRulesConfig = () => {
    return {
      version: "1.0",
      timestamp: new Date().toISOString(),
      rules: rules.map(rule => ({
        id: rule.id,
        type: rule.type,
        ...rule
      })),
      prioritization: {
        method: priorities.method || 'sliders',
        weights: priorities.weights || {},
        preset: priorities.preset || null
      },
      metadata: {
        totalRules: rules.length,
        dataEntities: {
          clients: data.clients?.length || 0,
          workers: data.workers?.length || 0,
          tasks: data.tasks?.length || 0
        },
        validationStatus: {
          totalErrors: getTotalErrors(),
          isValid: getTotalErrors() === 0
        }
      }
    };
  };

  const generateValidationReport = () => {
    const report = {
      summary: {
        totalErrors: getTotalErrors(),
        isValid: getTotalErrors() === 0,
        timestamp: new Date().toISOString()
      },
      details: {}
    };

    Object.entries(validationResults).forEach(([entityType, errors]) => {
      report.details[entityType] = {
        totalRecords: data[entityType]?.length || 0,
        errorCount: errors.length,
        errors: errors.map(error => ({
          rowIndex: error.index,
          issues: error.errors
        }))
      };
    });

    return report;
  };

  const downloadFile = (content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (entityData, entityName) => {
    const csv = Papa.unparse(entityData);
    downloadFile(csv, `${entityName}.csv`, 'text/csv');
  };

  const exportToXLSX = () => {
    const workbook = XLSX.utils.book_new();
    
    // Add data sheets
    Object.entries(data).forEach(([entityType, entityData]) => {
      if (entityData && entityData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(entityData);
        XLSX.utils.book_append_sheet(workbook, worksheet, entityType);
      }
    });

    // Add rules sheet
    if (rules.length > 0) {
      const rulesData = rules.map(rule => ({
        ID: rule.id,
        Type: rule.type,
        Configuration: JSON.stringify(rule)
      }));
      const rulesWorksheet = XLSX.utils.json_to_sheet(rulesData);
      XLSX.utils.book_append_sheet(workbook, rulesWorksheet, 'Rules');
    }

    // Add validation report if requested
    if (includeValidationReport && getTotalErrors() > 0) {
      const validationData = [];
      Object.entries(validationResults).forEach(([entityType, errors]) => {
        errors.forEach(error => {
          validationData.push({
            Entity: entityType,
            Row: error.index + 1,
            Issues: error.errors.join('; ')
          });
        });
      });
      
      if (validationData.length > 0) {
        const validationWorksheet = XLSX.utils.json_to_sheet(validationData);
        XLSX.utils.book_append_sheet(workbook, validationWorksheet, 'Validation_Issues');
      }
    }

    // Generate and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data_alchemist_export.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (exportFormat === 'csv') {
        // Export individual CSV files
        Object.entries(data).forEach(([entityType, entityData]) => {
          if (entityData && entityData.length > 0) {
            exportToCSV(entityData, entityType);
          }
        });
        
        // Export rules config
        const rulesConfig = generateRulesConfig();
        downloadFile(JSON.stringify(rulesConfig, null, 2), 'rules.json', 'application/json');
        
        // Export validation report if requested
        if (includeValidationReport) {
          const validationReport = generateValidationReport();
          downloadFile(JSON.stringify(validationReport, null, 2), 'validation_report.json', 'application/json');
        }
        
        toast.success('CSV files exported successfully!');
      } else {
        // Export single XLSX file
        exportToXLSX();
        
        // Export rules config separately
        const rulesConfig = generateRulesConfig();
        downloadFile(JSON.stringify(rulesConfig, null, 2), 'rules.json', 'application/json');
        
        toast.success('XLSX file exported successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error during export: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const getDataSummary = () => {
    return {
      clients: data.clients?.length || 0,
      workers: data.workers?.length || 0,
      tasks: data.tasks?.length || 0,
      rules: rules.length,
      errors: getTotalErrors()
    };
  };

  const summary = getDataSummary();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Export Configuration</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Export your cleaned data and rules configuration ready for downstream allocation systems.
        </p>
      </div>

      {/* Data Summary */}
      <div className="bg-gray-900/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Export Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="bg-blue-600 rounded-lg p-4">
              <FileText className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{summary.clients}</div>
              <div className="text-sm text-blue-200">Clients</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-green-600 rounded-lg p-4">
              <FileText className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{summary.workers}</div>
              <div className="text-sm text-green-200">Workers</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-purple-600 rounded-lg p-4">
              <FileText className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{summary.tasks}</div>
              <div className="text-sm text-purple-200">Tasks</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-orange-600 rounded-lg p-4">
              <Settings className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{summary.rules}</div>
              <div className="text-sm text-orange-200">Rules</div>
            </div>
          </div>
          <div className="text-center">
            <div className={`rounded-lg p-4 ${summary.errors === 0 ? 'bg-green-600' : 'bg-red-600'}`}>
              {summary.errors === 0 ? (
                <CheckCircle className="h-6 w-6 text-white mx-auto mb-2" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-white mx-auto mb-2" />
              )}
              <div className="text-2xl font-bold text-white">{summary.errors}</div>
              <div className={`text-sm ${summary.errors === 0 ? 'text-green-200' : 'text-red-200'}`}>
                Errors
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Export Options</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Export Format</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-white">CSV Files (separate files for each entity)</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value="xlsx"
                    checked={exportFormat === 'xlsx'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-white">XLSX File (single file with multiple sheets)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeValidationReport}
                  onChange={(e) => setIncludeValidationReport(e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-white">Include validation report</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">What Will Be Exported</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Package className="h-4 w-4 text-blue-400" />
              <span className="text-white">Cleaned data files (clients, workers, tasks)</span>
            </div>
            <div className="flex items-center space-x-3">
              <Settings className="h-4 w-4 text-green-400" />
              <span className="text-white">Rules configuration (rules.json)</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-4 w-4 text-purple-400" />
              <span className="text-white">Prioritization weights and settings</span>
            </div>
            {includeValidationReport && (
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-white">Validation report (if errors exist)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {getTotalErrors() > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Validation Issues Detected</h3>
          </div>
          <p className="text-red-300 mb-4">
            Your data contains {getTotalErrors()} validation errors. While you can still export, 
            it's recommended to fix these issues first for optimal allocation results.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(validationResults).map(([entityType, errors]) => (
              errors.length > 0 && (
                <div key={entityType} className="bg-red-800/20 rounded p-3">
                  <div className="font-medium text-red-300 capitalize">{entityType}</div>
                  <div className="text-sm text-red-400">{errors.length} errors</div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-center">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Download className="h-5 w-5" />
          <span>{isExporting ? 'Exporting...' : 'Export Data & Rules'}</span>
        </button>
      </div>

      {/* Success Message */}
      {getTotalErrors() === 0 && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-400 mb-2">Ready for Export!</h3>
          <p className="text-green-300">
            Your data has passed all validations and is ready for downstream allocation systems.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;

