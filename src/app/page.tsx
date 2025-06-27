'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Database, 
  Settings, 
  Download, 
  Zap,
  Brain,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

import FileUploader from '@/components/FileUploader';
import DataGrid from '@/components/DataGrid';
import ValidationSummary from '@/components/ValidationSummary';
import RuleBuilder from '@/components/RuleBuilder';
import ThemeToggle from '@/components/ThemeToggle';

import { ValidationEngine } from '@/lib/validation';
import { QueryParser } from '@/lib/queryParser';
import { generateRuleFromNaturalLanguage, suggestDataCorrections } from '@/lib/gemini';
import { Client, Worker, Task, Rule, ValidationError, FileUploadResult } from '@/types';

import { SpotlightBackground, GridPattern } from '@/components/AceternityBackground';
import ClientOnly from '@/components/ClientOnly';

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const validationEngine = new ValidationEngine();

  const handleFileUpload = useCallback((result: FileUploadResult) => {
    const { data, fileName } = result;
    
    // Determine data type based on filename or headers
    if (fileName.toLowerCase().includes('client') || 
        data[0]?.ClientID || data[0]?.ClientName) {
      setClients(data as Client[]);
      toast.success(`Loaded ${data.length} clients from ${fileName}`);
    } else if (fileName.toLowerCase().includes('worker') || 
               data[0]?.WorkerID || data[0]?.WorkerName) {
      setWorkers(data as Worker[]);
      toast.success(`Loaded ${data.length} workers from ${fileName}`);
    } else if (fileName.toLowerCase().includes('task') || 
               data[0]?.TaskID || data[0]?.TaskName) {
      setTasks(data as Task[]);
      toast.success(`Loaded ${data.length} tasks from ${fileName}`);
    } else {
      // Default to clients if unclear
      setClients(data as Client[]);
      toast.success(`Loaded ${data.length} records as clients from ${fileName}`);
    }

    // Auto-advance to data tab
    setActiveTab('data');
  }, []);

  const handleUploadError = useCallback((error: string) => {
    toast.error(`Upload failed: ${error}`);
  }, []);

  const runValidation = useCallback(async () => {
    setIsValidating(true);
    
    try {
      validationEngine.setData(clients, workers, tasks);
      const result = validationEngine.validateAll();
      setValidationErrors([...result.errors, ...result.warnings]);
      
      if (result.isValid) {
        toast.success('All validations passed!');
      } else {
        toast.warning(`Found ${result.errors.length} errors and ${result.warnings.length} warnings`);
      }
    } catch (error) {
      toast.error('Validation failed');
    } finally {
      setIsValidating(false);
    }
  }, [clients, workers, tasks]);

  const handleCellEdit = useCallback((dataType: 'clients' | 'workers' | 'tasks') => 
    (rowIndex: number, column: string, value: string) => {
      if (dataType === 'clients') {
        const newClients = [...clients];
        newClients[rowIndex] = { ...newClients[rowIndex], [column]: value };
        setClients(newClients);
      } else if (dataType === 'workers') {
        const newWorkers = [...workers];
        newWorkers[rowIndex] = { ...newWorkers[rowIndex], [column]: value };
        setWorkers(newWorkers);
      } else if (dataType === 'tasks') {
        const newTasks = [...tasks];
        newTasks[rowIndex] = { ...newTasks[rowIndex], [column]: value };
        setTasks(newTasks);
      }
      
      // Re-run validation after edit
      setTimeout(runValidation, 500);
    }, [clients, workers, tasks, runValidation]);

  const handleSearch = useCallback(async (query: string, dataType: 'clients' | 'workers' | 'tasks') => {
    try {
      const filters = await QueryParser.parseQuery(query, dataType);
      let filteredData: any[] = [];
      
      if (dataType === 'clients') {
        filteredData = QueryParser.applyFilters(clients, filters);
      } else if (dataType === 'workers') {
        filteredData = QueryParser.applyFilters(workers, filters);
      } else if (dataType === 'tasks') {
        filteredData = QueryParser.applyFilters(tasks, filters);
      }
      
      toast.success(`Found ${filteredData.length} matching records`);
      // TODO: Update grid to show filtered results
    } catch (error) {
      toast.error('Search failed');
    }
  }, [clients, workers, tasks]);

  const handleAddRule = useCallback((rule: Rule) => {
    setRules(prev => [...prev, rule]);
    toast.success('Rule added successfully');
  }, []);

  const handleUpdateRule = useCallback((id: string, rule: Rule) => {
    setRules(prev => prev.map(r => r.id === id ? rule : r));
  }, []);

  const handleDeleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success('Rule deleted');
  }, []);

  const handleGenerateRuleFromNL = useCallback(async (description: string) => {
    try {
      const ruleData = await generateRuleFromNaturalLanguage(description, {
        clients: clients.slice(0, 5),
        workers: workers.slice(0, 5),
        tasks: tasks.slice(0, 5)
      });
      
      if (ruleData) {
        const rule: Rule = {
          id: `rule_${Date.now()}`,
          ...ruleData
        };
        handleAddRule(rule);
        toast.success('Rule generated from natural language');
      } else {
        toast.error('Could not generate rule from description');
      }
    } catch (error) {
      toast.error('AI rule generation failed');
    }
  }, [clients, workers, tasks, handleAddRule]);

  const handleFixSuggestion = useCallback(async (error: ValidationError) => {
    try {
      const suggestions = await suggestDataCorrections([error], clients);
      if (suggestions.length > 0) {
        toast.success('AI suggestions generated');
        // TODO: Apply suggestions
      } else {
        toast.warning('No suggestions available for this error');
      }
    } catch (error) {
      toast.error('Failed to generate suggestions');
    }
  }, [clients]);

  const exportData = useCallback(() => {
    const exportData = {
      clients: clients,
      workers: workers,
      tasks: tasks,
      rules: rules,
      validationResults: validationErrors
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-resource-allocation-config.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Configuration exported successfully');
  }, [clients, workers, tasks, rules, validationErrors]);

  const totalRecords = clients.length + workers.length + tasks.length;
  const hasErrors = validationErrors.some(e => e.severity === 'error');
  const hasWarnings = validationErrors.some(e => e.severity === 'warning');

  return (
    <ClientOnly fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <div className="min-h-screen relative">
      <SpotlightBackground />
      <GridPattern />
      
      {/* Header */}
      <header className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <Brain className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Resource Allocator
                </h1>
              </motion.div>
              
              {totalRecords > 0 && (
                <Badge variant="secondary" className="ml-4">
                  {totalRecords} records loaded
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {hasErrors && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Errors
                </Badge>
              )}
              {hasWarnings && (
                <Badge variant="secondary">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Warnings
                </Badge>
              )}
              {!hasErrors && !hasWarnings && totalRecords > 0 && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Clean
                </Badge>
              )}
              
              <Button variant="outline" onClick={exportData} disabled={totalRecords === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h2 className="text-3xl font-bold">Upload Your Data</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Upload CSV or Excel files containing client, worker, and task data. 
                Our AI will automatically detect and validate your data structure.
              </p>
            </motion.div>
            
            <FileUploader
              onFileUpload={handleFileUpload}
              onError={handleUploadError}
            />
            
            {totalRecords > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button onClick={() => setActiveTab('data')} size="lg">
                  <Database className="w-4 h-4 mr-2" />
                  View Data ({totalRecords} records)
                </Button>
              </motion.div>
            )}
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Data Management</h2>
              <Button onClick={runValidation} disabled={isValidating || totalRecords === 0}>
                <Zap className="w-4 h-4 mr-2" />
                {isValidating ? 'Validating...' : 'Run Validation'}
              </Button>
            </div>

            <ValidationSummary
              validationResults={validationErrors}
              onFixSuggestion={handleFixSuggestion}
              onRunValidation={runValidation}
              isValidating={isValidating}
            />

            <Tabs defaultValue="clients" className="space-y-4">
              <TabsList>
                <TabsTrigger value="clients">
                  Clients ({clients.length})
                </TabsTrigger>
                <TabsTrigger value="workers">
                  Workers ({workers.length})
                </TabsTrigger>
                <TabsTrigger value="tasks">
                  Tasks ({tasks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clients">
                {clients.length > 0 ? (
                  <DataGrid
                    data={clients}
                    headers={Object.keys(clients[0])}
                    validationErrors={validationErrors.filter(e => 
                      e.cellLocation && clients[e.cellLocation.row]
                    )}
                    onCellEdit={handleCellEdit('clients')}
                    onSearch={(query) => handleSearch(query, 'clients')}
                    title="Clients"
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No client data uploaded yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="workers">
                {workers.length > 0 ? (
                  <DataGrid
                    data={workers}
                    headers={Object.keys(workers[0])}
                    validationErrors={validationErrors.filter(e => 
                      e.cellLocation && workers[e.cellLocation.row]
                    )}
                    onCellEdit={handleCellEdit('workers')}
                    onSearch={(query) => handleSearch(query, 'workers')}
                    title="Workers"
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No worker data uploaded yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tasks">
                {tasks.length > 0 ? (
                  <DataGrid
                    data={tasks}
                    headers={Object.keys(tasks[0])}
                    validationErrors={validationErrors.filter(e => 
                      e.cellLocation && tasks[e.cellLocation.row]
                    )}
                    onCellEdit={handleCellEdit('tasks')}
                    onSearch={(query) => handleSearch(query, 'tasks')}
                    title="Tasks"
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No task data uploaded yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Business Rules Configuration</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Define rules for resource allocation using natural language or visual builders.
              </p>
            </div>

            <RuleBuilder
              rules={rules}
              onAddRule={handleAddRule}
              onUpdateRule={handleUpdateRule}
              onDeleteRule={handleDeleteRule}
              onGenerateFromNL={handleGenerateRuleFromNL}
              availableData={{ clients, workers, tasks }}
            />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Export Configuration</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Download your cleaned data and configuration for use in production systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cleaned Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Export validated and corrected data files
                  </p>
                  <Button onClick={exportData} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV/Excel
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rules Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Export business rules as JSON configuration
                  </p>
                  <Button onClick={exportData} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Validation Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Detailed validation and correction report
                  </p>
                  <Button onClick={exportData} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </ClientOnly>
  );
}

