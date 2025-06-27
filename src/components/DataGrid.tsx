'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';
import { ValidationError } from '@/types';

interface DataGridProps {
  data: any[];
  headers: string[];
  validationErrors: ValidationError[];
  onCellEdit: (rowIndex: number, column: string, value: string) => void;
  onSearch: (query: string) => void;
  title: string;
}

export default function DataGrid({
  data,
  headers,
  validationErrors,
  onCellEdit,
  onSearch,
  title
}: DataGridProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Create error map for quick lookup
  const errorMap = useMemo(() => {
    const map = new Map<string, ValidationError[]>();
    validationErrors.forEach(error => {
      if (error.cellLocation) {
        const key = `${error.cellLocation.row}-${error.cellLocation.column}`;
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(error);
      }
    });
    return map;
  }, [validationErrors]);

  const handleCellClick = (rowIndex: number, column: string, currentValue: string) => {
    setEditingCell({ row: rowIndex, column });
    setEditValue(currentValue || '');
  };

  const handleCellSave = () => {
    if (editingCell) {
      onCellEdit(editingCell.row, editingCell.column, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getCellErrors = (rowIndex: number, column: string): ValidationError[] => {
    return errorMap.get(`${rowIndex}-${column}`) || [];
  };

  const getCellClassName = (rowIndex: number, column: string): string => {
    const errors = getCellErrors(rowIndex, column);
    const hasErrors = errors.some(e => e.severity === 'error');
    const hasWarnings = errors.some(e => e.severity === 'warning');
    
    let className = 'p-2 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors';
    
    if (hasErrors) {
      className += ' bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
    } else if (hasWarnings) {
      className += ' bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700';
    }
    
    if (selectedRows.has(rowIndex)) {
      className += ' bg-blue-50 dark:bg-blue-900/20';
    }
    
    return className;
  };

  const handleRowSelect = (rowIndex: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex);
    } else {
      newSelected.add(rowIndex);
    }
    setSelectedRows(newSelected);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="secondary">{data.length} rows</Badge>
          </CardTitle>
          
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search or ask in natural language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </form>
        </div>
        
        {validationErrors.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-700 dark:text-yellow-400">
              {validationErrors.filter(e => e.severity === 'error').length} errors, 
              {validationErrors.filter(e => e.severity === 'warning').length} warnings found
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="p-2 border border-gray-200 dark:border-gray-700 text-left font-medium">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(data.map((_, i) => i)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    checked={selectedRows.size === data.length && data.length > 0}
                  />
                </th>
                {headers.map((header) => (
                  <th key={header} className="p-2 border border-gray-200 dark:border-gray-700 text-left font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-2 border border-gray-200 dark:border-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => handleRowSelect(rowIndex)}
                    />
                  </td>
                  {headers.map((header) => {
                    const cellValue = row[header];
                    const isEditing = editingCell?.row === rowIndex && editingCell?.column === header;
                    const cellErrors = getCellErrors(rowIndex, header);
                    
                    return (
                      <td
                        key={`${rowIndex}-${header}`}
                        className={getCellClassName(rowIndex, header)}
                        onClick={() => !isEditing && handleCellClick(rowIndex, header, cellValue)}
                        title={cellErrors.map(e => e.message).join('; ')}
                      >
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              className="h-8 text-sm"
                              autoFocus
                            />
                            <Button size="sm" onClick={handleCellSave} className="h-8 px-2">
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="truncate">{cellValue || ''}</span>
                            {cellErrors.length > 0 && (
                              <AlertTriangle className={`w-4 h-4 ml-2 flex-shrink-0 ${
                                cellErrors.some(e => e.severity === 'error') 
                                  ? 'text-red-500' 
                                  : 'text-yellow-500'
                              }`} />
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {selectedRows.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-blue-700 dark:text-blue-400">
              {selectedRows.size} row(s) selected
            </p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline">
                Bulk Edit
              </Button>
              <Button size="sm" variant="outline">
                Delete Selected
              </Button>
              <Button size="sm" variant="outline">
                Export Selected
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

