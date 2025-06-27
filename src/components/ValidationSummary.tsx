'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Zap,
  RefreshCw
} from 'lucide-react';
import { ValidationError } from '@/types';

interface ValidationSummaryProps {
  validationResults: ValidationError[];
  onFixSuggestion: (error: ValidationError) => void;
  onRunValidation: () => void;
  isValidating: boolean;
}

export default function ValidationSummary({
  validationResults,
  onFixSuggestion,
  onRunValidation,
  isValidating
}: ValidationSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedErrorType, setSelectedErrorType] = useState<string | null>(null);

  const errors = validationResults.filter(r => r.severity === 'error');
  const warnings = validationResults.filter(r => r.severity === 'warning');

  // Group errors by type
  const errorsByType = validationResults.reduce((acc, error) => {
    if (!acc[error.type]) {
      acc[error.type] = [];
    }
    acc[error.type].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  const getErrorTypeIcon = (type: string) => {
    switch (type) {
      case 'MISSING_REQUIRED_FIELD':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'DUPLICATE_ID':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'MALFORMED_LIST':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'OUT_OF_RANGE':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'BROKEN_JSON':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'PLAIN_TEXT_INSTEAD_OF_JSON':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'UNKNOWN_REFERENCE':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'OVERLOADED_WORKER':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'MISSING_SKILL_COVERAGE':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getErrorTypeDescription = (type: string) => {
    switch (type) {
      case 'MISSING_REQUIRED_FIELD':
        return 'Required fields are missing values';
      case 'DUPLICATE_ID':
        return 'Duplicate IDs found across records';
      case 'MALFORMED_LIST':
        return 'Lists are not properly formatted';
      case 'OUT_OF_RANGE':
        return 'Values are outside acceptable ranges';
      case 'BROKEN_JSON':
        return 'JSON data is malformed or invalid';
      case 'PLAIN_TEXT_INSTEAD_OF_JSON':
        return 'Plain text found where JSON is expected';
      case 'UNKNOWN_REFERENCE':
        return 'References to non-existent records';
      case 'OVERLOADED_WORKER':
        return 'Workers have more slots than capacity';
      case 'MISSING_SKILL_COVERAGE':
        return 'Required skills not available in worker pool';
      default:
        return 'Validation issue detected';
    }
  };

  if (validationResults.length === 0) {
    return (
      <Card className="w-full border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                All Validations Passed
              </h3>
              <p className="text-green-600 dark:text-green-500">
                Your data is clean and ready for processing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Validation Results
            <Badge variant={errors.length > 0 ? "destructive" : "secondary"}>
              {errors.length} errors, {warnings.length} warnings
            </Badge>
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRunValidation}
              disabled={isValidating}
            >
              {isValidating ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {isValidating ? 'Validating...' : 'Re-validate'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {/* Error Type Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(errorsByType).map(([type, typeErrors]) => (
                <div
                  key={type}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedErrorType === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedErrorType(selectedErrorType === type ? null : type)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getErrorTypeIcon(type)}
                      <span className="font-medium text-sm">{type.replace(/_/g, ' ')}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {typeErrors.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {getErrorTypeDescription(type)}
                  </p>
                </div>
              ))}
            </div>

            {/* Detailed Error List */}
            {selectedErrorType && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {getErrorTypeIcon(selectedErrorType)}
                  {selectedErrorType.replace(/_/g, ' ')} Details
                </h4>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {errorsByType[selectedErrorType].map((error, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{error.message}</p>
                        {error.cellLocation && (
                          <p className="text-xs text-gray-500">
                            Row {error.cellLocation.row + 1}, Column: {error.cellLocation.column}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onFixSuggestion(error)}
                        className="ml-2"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Fix
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" size="sm">
                Export Error Report
              </Button>
              <Button variant="outline" size="sm">
                Auto-Fix Common Issues
              </Button>
              <Button variant="outline" size="sm">
                AI Suggestions
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

