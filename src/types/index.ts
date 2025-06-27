// Core data entity types based on the specification
export interface Client {
  ClientID: string; // e.g., "C1", "C2"
  ClientName: string; // e.g., "Acme Corp", "Globex Inc"
  PriorityLevel: number; // 1-5 (1=highest, 5=lowest)
  RequestedTaskIDs: string; // comma-separated string: "T17,T27,T33"
  GroupTag: string; // "GroupA", "GroupB", "GroupC"
  AttributesJSON: string; // JSON string or plain text message
}

export interface Worker {
  WorkerID: string; // e.g., "W1", "W2"
  WorkerName: string;
  Skills: string; // comma-separated: "Python,JavaScript,React"
  AvailableSlots: string; // JSON array string: "[1,2,3]"
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: string; // "Junior", "Senior", "Expert"
}

export interface Task {
  TaskID: string; // e.g., "T1", "T17", "T27"
  TaskName: string;
  Category: string; // "Development", "Testing", "Marketing"
  Duration: number; // ≥1 phases
  RequiredSkills: string; // comma-separated: "Python,Database"
  PreferredPhases: string; // "1-3" or "[2,4,5]" or "1,3,5"
  MaxConcurrent: number;
}

// Validation types
export interface ValidationError {
  type: string;
  message: string;
  cellLocation?: { row: number; column: string };
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Rule types
export interface Rule {
  id: string;
  type: 'coRun' | 'slotRestriction' | 'loadLimit' | 'phaseWindow' | 'patternMatch' | 'precedence';
  parameters: Record<string, any>;
  description: string;
  priority: number;
}

// File upload types
export interface FileUploadResult {
  data: any[];
  headers: string[];
  fileName: string;
  fileType: 'csv' | 'xlsx';
}

// Data grid types
export interface GridColumn {
  key: string;
  name: string;
  editable?: boolean;
  width?: number;
  formatter?: (props: any) => React.ReactElement;
}

// AI types
export interface AIQueryResult {
  matches: any[];
  query: string;
  confidence: number;
}

export interface AIRuleGeneration {
  rule: Rule;
  confidence: number;
  explanation: string;
}

// Export configuration
export interface ExportConfig {
  includeClients: boolean;
  includeWorkers: boolean;
  includeTasks: boolean;
  includeRules: boolean;
  format: 'csv' | 'xlsx' | 'json';
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}

// App state types
export interface AppState {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: Rule[];
  validationResults: ValidationResult[];
  theme: ThemeConfig;
  isLoading: boolean;
  error: string | null;
}

