import { Client, Worker, Task } from '@/types';
import { parseNaturalLanguageQuery } from './gemini';

export class QueryParser {
  static async parseQuery(query: string, dataType: 'clients' | 'workers' | 'tasks'): Promise<any> {
    const availableFields = this.getAvailableFields(dataType);
    
    // Try AI-powered parsing first
    try {
      const aiResult = await parseNaturalLanguageQuery(query, availableFields);
      if (aiResult && Object.keys(aiResult).length > 0) {
        return aiResult;
      }
    } catch (error) {
      console.warn('AI parsing failed, falling back to rule-based parsing');
    }

    // Fallback to rule-based parsing
    return this.ruleBasedParsing(query, dataType);
  }

  private static getAvailableFields(dataType: 'clients' | 'workers' | 'tasks'): string[] {
    switch (dataType) {
      case 'clients':
        return ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'];
      case 'workers':
        return ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'];
      case 'tasks':
        return ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'];
      default:
        return [];
    }
  }

  private static ruleBasedParsing(query: string, dataType: string): any {
    const filters: any = {};
    const lowerQuery = query.toLowerCase();

    // Priority level patterns
    if (lowerQuery.includes('high priority')) {
      filters.PriorityLevel = { operator: 'lessThan', value: 3 };
    } else if (lowerQuery.includes('low priority')) {
      filters.PriorityLevel = { operator: 'greaterThan', value: 3 };
    }

    // Group patterns
    const groupMatch = lowerQuery.match(/group\s*([abc])/i);
    if (groupMatch) {
      filters.GroupTag = { operator: 'equals', value: `Group${groupMatch[1].toUpperCase()}` };
    }

    // Task ID patterns
    const taskMatch = lowerQuery.match(/task\s*(t\d+)/i);
    if (taskMatch) {
      filters.RequestedTaskIDs = { operator: 'contains', value: taskMatch[1].toUpperCase() };
    }

    // Budget patterns
    const budgetMatch = lowerQuery.match(/budget.*?(\d+)/);
    if (budgetMatch) {
      filters.AttributesJSON = { operator: 'jsonContains', field: 'budget', value: parseInt(budgetMatch[1]) };
    }

    // Location patterns
    const locationMatch = lowerQuery.match(/in\s+(\w+)/);
    if (locationMatch) {
      filters.AttributesJSON = { operator: 'jsonContains', field: 'location', value: locationMatch[1] };
    }

    // VIP patterns
    if (lowerQuery.includes('vip')) {
      filters.AttributesJSON = { operator: 'jsonContains', field: 'vip', value: true };
    }

    // Invalid references
    if (lowerQuery.includes('invalid') || lowerQuery.includes('tx') || lowerQuery.includes('t99')) {
      filters.RequestedTaskIDs = { operator: 'contains', value: 'TX' };
    }

    return filters;
  }

  static applyFilters(data: any[], filters: any): any[] {
    return data.filter(item => {
      return Object.entries(filters).every(([field, condition]: [string, any]) => {
        const value = item[field];
        
        switch (condition.operator) {
          case 'equals':
            return value === condition.value;
          case 'contains':
            return value && value.toString().toLowerCase().includes(condition.value.toLowerCase());
          case 'greaterThan':
            return Number(value) > condition.value;
          case 'lessThan':
            return Number(value) < condition.value;
          case 'jsonContains':
            try {
              const jsonData = JSON.parse(value);
              if (condition.field) {
                return jsonData[condition.field] === condition.value;
              }
              return JSON.stringify(jsonData).toLowerCase().includes(condition.value.toLowerCase());
            } catch {
              return value && value.toString().toLowerCase().includes(condition.value.toLowerCase());
            }
          default:
            return true;
        }
      });
    });
  }

  // Fuzzy search for typos and partial matches
  static fuzzySearch(data: any[], searchTerm: string, fields: string[]): any[] {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return data.filter(item => {
      return fields.some(field => {
        const value = item[field];
        if (!value) return false;
        
        const lowerValue = value.toString().toLowerCase();
        
        // Exact match
        if (lowerValue.includes(lowerSearchTerm)) return true;
        
        // Fuzzy match (simple implementation)
        const similarity = this.calculateSimilarity(lowerValue, lowerSearchTerm);
        return similarity > 0.6;
      });
    });
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

