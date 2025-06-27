import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const FileUpload = ({ onDataUploaded, onNext }) => {
  const [uploadedFiles, setUploadedFiles] = useState({
    clients: null,
    workers: null,
    tasks: null
  });
  const [parsedData, setParsedData] = useState({
    clients: [],
    workers: [],
    tasks: []
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // AI-powered header mapping - handles exact sample data structure
  const mapHeaders = (headers, entityType) => {
    // Standard field mappings based on sample data
    const standardFields = {
      clients: ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'],
      workers: ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'],
      tasks: ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent']
    };

    const mappings = {
      clients: {
        'ClientID': ['clientid', 'client_id', 'client id', 'id', 'client_identifier'],
        'ClientName': ['clientname', 'client_name', 'client name', 'name', 'client'],
        'PriorityLevel': ['prioritylevel', 'priority_level', 'priority level', 'priority', 'level'],
        'RequestedTaskIDs': ['requestedtaskids', 'requested_task_ids', 'requested task ids', 'tasks', 'task_ids'],
        'GroupTag': ['grouptag', 'group_tag', 'group tag', 'group', 'tag'],
        'AttributesJSON': ['attributesjson', 'attributes_json', 'attributes json', 'attributes', 'metadata']
      },
      workers: {
        'WorkerID': ['workerid', 'worker_id', 'worker id', 'id', 'worker_identifier'],
        'WorkerName': ['workername', 'worker_name', 'worker name', 'name', 'worker'],
        'Skills': ['skills', 'skill', 'capabilities', 'abilities'],
        'AvailableSlots': ['availableslots', 'available_slots', 'available slots', 'slots', 'availability'],
        'MaxLoadPerPhase': ['maxloadperphase', 'max_load_per_phase', 'max load per phase', 'max_load', 'load_limit'],
        'WorkerGroup': ['workergroup', 'worker_group', 'worker group', 'group', 'team'],
        'QualificationLevel': ['qualificationlevel', 'qualification_level', 'qualification level', 'qualification', 'level']
      },
      tasks: {
        'TaskID': ['taskid', 'task_id', 'task id', 'id', 'task_identifier'],
        'TaskName': ['taskname', 'task_name', 'task name', 'name', 'task'],
        'Category': ['category', 'type', 'classification'],
        'Duration': ['duration', 'time', 'length', 'phases'],
        'RequiredSkills': ['requiredskills', 'required_skills', 'required skills', 'skills', 'requirements'],
        'PreferredPhases': ['preferredphases', 'preferred_phases', 'preferred phases', 'phases', 'timing'],
        'MaxConcurrent': ['maxconcurrent', 'max_concurrent', 'max concurrent', 'concurrency', 'parallel']
      }
    };

    const entityMappings = mappings[entityType] || {};
    const mappedHeaders = {};

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      let mapped = false;
      
      // First try exact match
      if (standardFields[entityType]?.includes(header)) {
        mappedHeaders[header] = header;
        mapped = true;
      } else {
        // Then try fuzzy matching
        for (const [standardField, variations] of Object.entries(entityMappings)) {
          if (variations.some(variation => 
            normalizedHeader.includes(variation.replace(/[^a-z0-9]/g, '')) ||
            variation.replace(/[^a-z0-9]/g, '').includes(normalizedHeader)
          )) {
            mappedHeaders[header] = standardField;
            mapped = true;
            break;
          }
        }
      }
      
      if (!mapped) {
        mappedHeaders[header] = header; // Keep original if no mapping found
      }
    });

    return mappedHeaders;
  };

  const parseFile = async (file, entityType) => {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }
            
            const headers = Object.keys(results.data[0] || {});
            const headerMapping = mapHeaders(headers, entityType);
            
            const mappedData = results.data.map(row => {
              const mappedRow = {};
              Object.entries(row).forEach(([key, value]) => {
                const mappedKey = headerMapping[key] || key;
                mappedRow[mappedKey] = value;
              });
              return mappedRow;
            });
            
            resolve(mappedData);
          },
          error: reject
        });
      } else if (['xlsx', 'xls'].includes(fileExtension)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const headers = Object.keys(jsonData[0] || {});
            const headerMapping = mapHeaders(headers, entityType);
            
            const mappedData = jsonData.map(row => {
              const mappedRow = {};
              Object.entries(row).forEach(([key, value]) => {
                const mappedKey = headerMapping[key] || key;
                mappedRow[mappedKey] = value;
              });
              return mappedRow;
            });
            
            resolve(mappedData);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file format'));
      }
    });
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles, entityType) => {
    if (rejectedFiles.length > 0) {
      toast.error('Please upload only CSV or XLSX files');
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);

    try {
      const data = await parseFile(file, entityType);
      
      setUploadedFiles(prev => ({
        ...prev,
        [entityType]: file
      }));
      
      setParsedData(prev => ({
        ...prev,
        [entityType]: data
      }));
      
      toast.success(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} file uploaded successfully!`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error(`Error parsing ${entityType} file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const createDropzone = (entityType, label, description) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (acceptedFiles, rejectedFiles) => onDrop(acceptedFiles, rejectedFiles, entityType),
      accept: {
        'text/csv': ['.csv'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls']
      },
      multiple: false
    });

    const isUploaded = uploadedFiles[entityType];

    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-400 bg-blue-50/10'
            : isUploaded
            ? 'border-green-400 bg-green-50/10'
            : 'border-gray-600 bg-gray-50/5 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          {isProcessing ? (
            <Loader className="h-8 w-8 text-blue-400 animate-spin" />
          ) : isUploaded ? (
            <CheckCircle className="h-8 w-8 text-green-400" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          
          <h3 className="text-lg font-medium text-white">{label}</h3>
          <p className="text-sm text-gray-400">{description}</p>
          
          {isUploaded && (
            <div className="flex items-center space-x-2 text-green-400">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{uploadedFiles[entityType].name}</span>
            </div>
          )}
          
          {!isUploaded && (
            <p className="text-xs text-gray-500">
              Drag & drop or click to upload CSV/XLSX files
            </p>
          )}
        </div>
      </div>
    );
  };

  const handleNext = () => {
    const allFilesUploaded = Object.values(uploadedFiles).every(file => file !== null);
    
    if (!allFilesUploaded) {
      toast.error('Please upload all three files before proceeding');
      return;
    }
    
    onDataUploaded(parsedData);
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Upload Your Data Files</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Upload your CSV or XLSX files for clients, workers, and tasks. Our AI-powered parser will automatically map headers and handle various column arrangements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {createDropzone('clients', 'Clients Data', 'Upload client information with priorities and requested tasks')}
        {createDropzone('workers', 'Workers Data', 'Upload worker details with skills and availability')}
        {createDropzone('tasks', 'Tasks Data', 'Upload task definitions with requirements and constraints')}
      </div>

      {/* Data Preview */}
      {Object.values(uploadedFiles).some(file => file !== null) && (
        <div className="bg-gray-900/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Data Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(parsedData).map(([entityType, data]) => (
              data.length > 0 && (
                <div key={entityType} className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2 capitalize">{entityType}</h4>
                  <p className="text-sm text-gray-400 mb-2">{data.length} records</p>
                  <div className="text-xs text-gray-500">
                    Fields: {Object.keys(data[0] || {}).join(', ')}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-center">
        <button
          onClick={handleNext}
          disabled={!Object.values(uploadedFiles).every(file => file !== null)}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Proceed to Data Review
        </button>
      </div>
    </div>
  );
};

export default FileUpload;

