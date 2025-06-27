import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

const ValidationPanel = ({ validationResults }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const getTotalErrors = () => {
    return Object.values(validationResults).reduce((sum, errors) => sum + errors.length, 0);
  };

  const totalErrors = getTotalErrors();

  if (!isVisible) return null;

  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg shadow-lg max-w-md">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {totalErrors === 0 ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-400" />
          )}
          <div>
            <h3 className="font-semibold text-white">
              {totalErrors === 0 ? 'All Validations Passed' : 'Validation Issues'}
            </h3>
            <p className="text-sm text-gray-400">
              {totalErrors === 0 ? 'Data is ready for processing' : `${totalErrors} errors found`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && totalErrors > 0 && (
        <div className="border-t border-gray-700 p-4 max-h-96 overflow-y-auto">
          {Object.entries(validationResults).map(([entityType, errors]) => (
            errors.length > 0 && (
              <div key={entityType} className="mb-4 last:mb-0">
                <h4 className="font-medium text-white mb-2 capitalize">
                  {entityType} ({errors.length} errors)
                </h4>
                <div className="space-y-2">
                  {errors.map((error, index) => (
                    <div key={index} className="bg-red-900/20 border border-red-500/30 rounded p-2">
                      <div className="text-sm text-red-300 font-medium">
                        Row {error.index + 1}
                      </div>
                      <div className="text-xs text-red-400 mt-1">
                        {error.errors.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Success State */}
      {isExpanded && totalErrors === 0 && (
        <div className="border-t border-gray-700 p-4">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-medium">All validations passed!</p>
            <p className="text-sm text-gray-400 mt-1">
              Your data is clean and ready for rule configuration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;

