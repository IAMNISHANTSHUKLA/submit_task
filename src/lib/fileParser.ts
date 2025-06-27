import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FileUploadResult } from '@/types';

export class FileParser {
  static async parseFile(file: File): Promise<FileUploadResult> {
    const fileType = this.getFileType(file.name);
    
    if (fileType === 'csv') {
      return this.parseCSV(file);
    } else if (fileType === 'xlsx') {
      return this.parseXLSX(file);
    } else {
      throw new Error('Unsupported file type. Please upload CSV or XLSX files.');
    }
  }

  private static getFileType(fileName: string): 'csv' | 'xlsx' {
    const extension = fileName.toLowerCase().split('.').pop();
    if (extension === 'csv') return 'csv';
    if (extension === 'xlsx' || extension === 'xls') return 'xlsx';
    throw new Error('Unsupported file type');
  }

  private static async parseCSV(file: File): Promise<FileUploadResult> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
            return;
          }

          resolve({
            data: results.data as any[],
            headers: results.meta.fields || [],
            fileName: file.name,
            fileType: 'csv'
          });
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  private static async parseXLSX(file: File): Promise<FileUploadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Use the first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            reject(new Error('Empty spreadsheet'));
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = (row as any[])[index] || '';
            });
            return obj;
          });

          resolve({
            data: rows,
            headers,
            fileName: file.name,
            fileType: 'xlsx'
          });
        } catch (error) {
          reject(new Error(`XLSX parsing error: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('File reading error'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // AI-powered header mapping
  static async mapHeaders(headers: string[], expectedHeaders: string[]): Promise<Record<string, string>> {
    const mapping: Record<string, string> = {};
    
    // Simple fuzzy matching for now (can be enhanced with AI)
    expectedHeaders.forEach(expected => {
      const match = headers.find(header => 
        header.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(header.toLowerCase()) ||
        this.calculateSimilarity(header.toLowerCase(), expected.toLowerCase()) > 0.7
      );
      
      if (match) {
        mapping[expected] = match;
      }
    });

    return mapping;
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

