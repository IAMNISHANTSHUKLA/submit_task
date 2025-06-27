'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileParser } from '@/lib/fileParser';
import { FileUploadResult } from '@/types';

interface FileUploaderProps {
  onFileUpload: (result: FileUploadResult) => void;
  onError: (error: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

export default function FileUploader({
  onFileUpload,
  onError,
  acceptedFileTypes = ['.csv', '.xlsx', '.xls'],
  maxFileSize = 10 * 1024 * 1024 // 10MB
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file size
    if (file.size > maxFileSize) {
      onError(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await FileParser.parseFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadedFiles(prev => [...prev, file.name]);
        onFileUpload(result);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      onError(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [maxFileSize, onFileUpload, onError]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: maxFileSize
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-all duration-200 ${
              isDragActive ? 'scale-105' : ''
            }`}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-spin mx-auto w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">Uploading and processing...</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    {isDragActive ? 'Drop your file here' : 'Upload your data file'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Drag and drop a CSV or Excel file, or click to browse
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Supports: {acceptedFileTypes.join(', ')} • Max size: {maxFileSize / (1024 * 1024)}MB
                  </p>
                </div>
                <Button variant="outline" className="mt-4">
                  <FileText className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {fileRejections.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-400 font-medium">Upload Error</p>
              </div>
              {fileRejections.map(({ file, errors }) => (
                <div key={file.name} className="mt-2">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {file.name}: {errors.map(e => e.message).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-700 dark:text-green-400 font-medium">Successfully Uploaded</p>
              </div>
              {uploadedFiles.map((fileName, index) => (
                <p key={index} className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {fileName}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

