import React, { useState, useEffect, useMemo } from 'react';
import { Search, Edit3, Save, X, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const DataGrid = ({ data, onDataChange, onValidationResults, onNext }) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  useEffect(() => {
    validateData();
  }, [localData]);

  // Natural Language Search
  const parseNaturalLanguageQuery = (query) => {
    if (!query.trim()) return null;

    const lowerQuery = query.toLowerCase();
    
    // Parse conditions like "duration > 2", "priority = 3", etc.
    const conditions = [];
    
    // Number comparisons
    const numberPatterns = [
      /(\w+)\s*(>|>=|<|<=|=|==)\s*(\d+)/g,
      /(\w+)\s+(?:greater than|more than)\s+(\d+)/g,
      /(\w+)\s+(?:less than|fewer than)\s+(\d+)/g,
      /(\w+)\s+(?:equal to|equals)\s+(\d+)/g
    ];

    numberPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(lowerQuery)) !== null) {
        const [, field, operator, value] = match;
        conditions.push({ field, operator: operator || '>', value: parseInt(value) });
      }
    });

    // Text contains
    const textPatterns = [
      /(\w+)\s+(?:contains|includes|has)\s+"([^"]+)"/g,
      /(\w+)\s+(?:contains|includes|has)\s+(\w+)/g
    ];

    textPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(lowerQuery)) !== null) {
        const [, field, value] = match;
        conditions.push({ field, operator: 'contains', value: value.replace(/"/g, '') });
      }
    });

    return conditions.length > 0 ? conditions : null;
  };

  const filterData = (dataArray, entityType) => {
    if (!searchQuery.trim()) return dataArray;

    const conditions = parseNaturalLanguageQuery(searchQuery);
    
    if (!conditions) {
      // Fallback to simple text search
      return dataArray.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return dataArray.filter(row => {
      return conditions.every(condition => {
        const { field, operator, value } = condition;
        
        // Find matching field (case insensitive)
        const actualField = Object.keys(row).find(key => 
          key.toLowerCase().includes(field.toLowerCase()) ||
          field.toLowerCase().includes(key.toLowerCase())
        );
        
        if (!actualField) return false;
        
        const cellValue = row[actualField];
        
        switch (operator) {
          case '>':
            return Number(cellValue) > value;
          case '>=':
            return Number(cellValue) >= value;
          case '<':
            return Number(cellValue) < value;
          case '<=':
            return Number(cellValue) <= value;
          case '=':
          case '==':
            return Number(cellValue) === value;
          case 'contains':
            return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
          default:
            return false;
        }
      });
    });
  };

  // Validation Engine
  const validateData = () => {
    const errors = {
      clients: [],
      workers: [],
      tasks: []
    };

    // Validate Clients
    localData.clients.forEach((client, index) => {
      const rowErrors = [];
      
      // Missing required fields
      if (!client.ClientID) rowErrors.push('Missing ClientID');
      if (!client.ClientName) rowErrors.push('Missing ClientName');
      if (!client.PriorityLevel) rowErrors.push('Missing PriorityLevel');
      
      // Priority level validation
      const priority = Number(client.PriorityLevel);
      if (isNaN(priority) || priority < 1 || priority > 5) {
        rowErrors.push('PriorityLevel must be 1-5');
      }
      
      // Duplicate ID check
      const duplicates = localData.clients.filter(c => c.ClientID === client.ClientID);
      if (duplicates.length > 1) {
        rowErrors.push('Duplicate ClientID');
      }
      
      // JSON validation
      if (client.AttributesJSON) {
        try {
          JSON.parse(client.AttributesJSON);
        } catch (e) {
          rowErrors.push('Invalid JSON in AttributesJSON');
        }
      }
      
      if (rowErrors.length > 0) {
        errors.clients.push({ index, errors: rowErrors });
      }
    });

    // Validate Workers
    localData.workers.forEach((worker, index) => {
      const rowErrors = [];
      
      // Missing required fields
      if (!worker.WorkerID) rowErrors.push('Missing WorkerID');
      if (!worker.WorkerName) rowErrors.push('Missing WorkerName');
      if (!worker.Skills) rowErrors.push('Missing Skills');
      
      // Duplicate ID check
      const duplicates = localData.workers.filter(w => w.WorkerID === worker.WorkerID);
      if (duplicates.length > 1) {
        rowErrors.push('Duplicate WorkerID');
      }
      
      // Available slots validation
      if (worker.AvailableSlots) {
        try {
          const slots = JSON.parse(worker.AvailableSlots.replace(/'/g, '"'));
          if (!Array.isArray(slots)) {
            rowErrors.push('AvailableSlots must be an array');
          }
        } catch (e) {
          rowErrors.push('Invalid format in AvailableSlots');
        }
      }
      
      // Max load validation
      const maxLoad = Number(worker.MaxLoadPerPhase);
      if (isNaN(maxLoad) || maxLoad < 1) {
        rowErrors.push('MaxLoadPerPhase must be >= 1');
      }
      
      // Qualification level validation
      const qualLevel = Number(worker.QualificationLevel);
      if (isNaN(qualLevel) || qualLevel < 1 || qualLevel > 5) {
        rowErrors.push('QualificationLevel must be 1-5');
      }
      
      if (rowErrors.length > 0) {
        errors.workers.push({ index, errors: rowErrors });
      }
    });

    // Validate Tasks
    localData.tasks.forEach((task, index) => {
      const rowErrors = [];
      
      // Missing required fields
      if (!task.TaskID) rowErrors.push('Missing TaskID');
      if (!task.TaskName) rowErrors.push('Missing TaskName');
      if (!task.Duration) rowErrors.push('Missing Duration');
      
      // Duplicate ID check
      const duplicates = localData.tasks.filter(t => t.TaskID === task.TaskID);
      if (duplicates.length > 1) {
        rowErrors.push('Duplicate TaskID');
      }
      
      // Duration validation
      const duration = Number(task.Duration);
      if (isNaN(duration) || duration < 1) {
        rowErrors.push('Duration must be >= 1');
      }
      
      // Max concurrent validation
      const maxConcurrent = Number(task.MaxConcurrent);
      if (isNaN(maxConcurrent) || maxConcurrent < 1) {
        rowErrors.push('MaxConcurrent must be >= 1');
      }
      
      if (rowErrors.length > 0) {
        errors.tasks.push({ index, errors: rowErrors });
      }
    });

    setValidationErrors(errors);
    onValidationResults(errors);
  };

  const handleCellEdit = (rowIndex, field, value) => {
    const newData = { ...localData };
    newData[activeTab][rowIndex][field] = value;
    setLocalData(newData);
    onDataChange(newData);
  };

  const startEdit = (rowIndex, field, currentValue) => {
    setEditingCell({ rowIndex, field });
    setEditValue(currentValue || '');
  };

  const saveEdit = () => {
    if (editingCell) {
      handleCellEdit(editingCell.rowIndex, editingCell.field, editValue);
      setEditingCell(null);
      setEditValue('');
      toast.success('Cell updated successfully');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const renderCell = (row, field, rowIndex) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
    const value = row[field];
    const hasError = validationErrors[activeTab]?.some(error => error.index === rowIndex);

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="bg-gray-800 text-white px-2 py-1 rounded text-sm flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
          />
          <button onClick={saveEdit} className="text-green-400 hover:text-green-300">
            <Save className="h-4 w-4" />
          </button>
          <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }

    return (
      <div
        className={`group cursor-pointer p-2 rounded ${hasError ? 'bg-red-900/20 border border-red-500/30' : 'hover:bg-gray-800/50'}`}
        onClick={() => startEdit(rowIndex, field, value)}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300 truncate">{value || '-'}</span>
          <Edit3 className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  };

  const filteredData = useMemo(() => {
    return filterData(localData[activeTab] || [], activeTab);
  }, [localData, activeTab, searchQuery]);

  const getValidationSummary = () => {
    const totalErrors = Object.values(validationErrors).reduce((sum, errors) => sum + errors.length, 0);
    return totalErrors;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Data Review & Validation</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getValidationSummary() === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400" />
            )}
            <span className="text-sm text-gray-400">
              {getValidationSummary()} validation errors
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search with natural language (e.g., 'duration > 2', 'priority = 3', 'skills contains coding')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        {['clients', 'workers', 'tasks'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({localData[tab]?.length || 0})
            {validationErrors[tab]?.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {validationErrors[tab].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Data Grid */}
      <div className="bg-gray-900/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                {Object.keys(localData[activeTab]?.[0] || {}).map((field) => (
                  <th key={field} className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredData.map((row, rowIndex) => {
                const originalIndex = localData[activeTab].findIndex(item => 
                  JSON.stringify(item) === JSON.stringify(row)
                );
                const hasRowError = validationErrors[activeTab]?.some(error => error.index === originalIndex);
                
                return (
                  <tr key={originalIndex} className={hasRowError ? 'bg-red-900/10' : 'hover:bg-gray-800/30'}>
                    {Object.keys(row).map((field) => (
                      <td key={field} className="px-4 py-2">
                        {renderCell(row, field, originalIndex)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Errors Summary */}
      {validationErrors[activeTab]?.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Validation Errors</h3>
          <div className="space-y-2">
            {validationErrors[activeTab].map((error, index) => (
              <div key={index} className="text-sm text-red-300">
                Row {error.index + 1}: {error.errors.join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Proceed to Rule Builder
        </button>
      </div>
    </div>
  );
};

export default DataGrid;

