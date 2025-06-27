'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Zap, 
  GripVertical,
  MessageSquare
} from 'lucide-react';
import { Rule } from '@/types';

interface RuleBuilderProps {
  rules: Rule[];
  onAddRule: (rule: Rule) => void;
  onUpdateRule: (id: string, rule: Rule) => void;
  onDeleteRule: (id: string) => void;
  onGenerateFromNL: (description: string) => void;
  availableData: {
    clients: any[];
    workers: any[];
    tasks: any[];
  };
}

export default function RuleBuilder({
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onGenerateFromNL,
  availableData
}: RuleBuilderProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    type: 'coRun',
    parameters: {},
    description: '',
    priority: 1
  });
  const [nlDescription, setNlDescription] = useState('');

  const ruleTypes = [
    { value: 'coRun', label: 'Co-run Tasks', description: 'Tasks that must run together' },
    { value: 'slotRestriction', label: 'Slot Restriction', description: 'Minimum common slots requirement' },
    { value: 'loadLimit', label: 'Load Limit', description: 'Maximum load per phase' },
    { value: 'phaseWindow', label: 'Phase Window', description: 'Restrict tasks to specific phases' },
    { value: 'patternMatch', label: 'Pattern Match', description: 'Pattern-based rules' },
    { value: 'precedence', label: 'Precedence', description: 'Priority override rules' }
  ];

  const handleCreateRule = () => {
    if (newRule.type && newRule.description) {
      const rule: Rule = {
        id: `rule_${Date.now()}`,
        type: newRule.type as Rule['type'],
        parameters: newRule.parameters || {},
        description: newRule.description,
        priority: newRule.priority || 1
      };
      
      onAddRule(rule);
      setNewRule({ type: 'coRun', parameters: {}, description: '', priority: 1 });
      setIsCreating(false);
    }
  };

  const handleNLGeneration = () => {
    if (nlDescription.trim()) {
      onGenerateFromNL(nlDescription);
      setNlDescription('');
    }
  };

  const renderRuleParameters = (rule: Rule) => {
    switch (rule.type) {
      case 'coRun':
        return (
          <div className="space-y-2">
            <Label>Task IDs (comma-separated)</Label>
            <Input
              placeholder="T1,T2,T3"
              value={rule.parameters.taskIds || ''}
              onChange={(e) => onUpdateRule(rule.id, {
                ...rule,
                parameters: { ...rule.parameters, taskIds: e.target.value }
              })}
            />
          </div>
        );
      
      case 'slotRestriction':
        return (
          <div className="space-y-2">
            <Label>Client/Worker Groups</Label>
            <Input
              placeholder="GroupA,GroupB"
              value={rule.parameters.groups || ''}
              onChange={(e) => onUpdateRule(rule.id, {
                ...rule,
                parameters: { ...rule.parameters, groups: e.target.value }
              })}
            />
            <Label>Minimum Common Slots</Label>
            <Input
              type="number"
              placeholder="2"
              value={rule.parameters.minSlots || ''}
              onChange={(e) => onUpdateRule(rule.id, {
                ...rule,
                parameters: { ...rule.parameters, minSlots: parseInt(e.target.value) }
              })}
            />
          </div>
        );
      
      case 'loadLimit':
        return (
          <div className="space-y-2">
            <Label>Worker Group</Label>
            <Select
              value={rule.parameters.workerGroup || ''}
              onValueChange={(value) => onUpdateRule(rule.id, {
                ...rule,
                parameters: { ...rule.parameters, workerGroup: value }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select worker group" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set(availableData.workers.map(w => w.WorkerGroup))).map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Max Slots Per Phase</Label>
            <Input
              type="number"
              placeholder="5"
              value={rule.parameters.maxSlots || ''}
              onChange={(e) => onUpdateRule(rule.id, {
                ...rule,
                parameters: { ...rule.parameters, maxSlots: parseInt(e.target.value) }
              })}
            />
          </div>
        );
      
      case 'phaseWindow':
        return (
          <div className="space-y-2">
            <Label>Task ID</Label>
            <Select
              value={rule.parameters.taskId || ''}
              onValueChange={(value) => onUpdateRule(rule.id, {
                ...rule,
                parameters: { ...rule.parameters, taskId: value }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                {availableData.tasks.map(task => (
                  <SelectItem key={task.TaskID} value={task.TaskID}>
                    {task.TaskID} - {task.TaskName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Allowed Phases (e.g., 1-3 or 1,3,5)</Label>
            <Input
              placeholder="1-3"
              value={rule.parameters.phases || ''}
              onChange={(e) => onUpdateRule(rule.id, {
                ...rule,
                parameters: { ...rule.parameters, phases: e.target.value }
              })}
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <Label>Parameters (JSON)</Label>
            <Input
              placeholder='{"key": "value"}'
              value={JSON.stringify(rule.parameters)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  onUpdateRule(rule.id, { ...rule, parameters: params });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Rule Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            AI Rule Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Describe your rule in natural language</Label>
              <Input
                placeholder="e.g., Tasks T17 and T27 should always run together"
                value={nlDescription}
                onChange={(e) => setNlDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleNLGeneration} disabled={!nlDescription.trim()}>
              <Zap className="w-4 h-4 mr-2" />
              Generate Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rule List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Business Rules</CardTitle>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Create New Rule Form */}
            {isCreating && (
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Rule Type</Label>
                      <Select
                        value={newRule.type}
                        onValueChange={(value) => setNewRule({ ...newRule, type: value as Rule['type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ruleTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-gray-500">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Describe what this rule does"
                        value={newRule.description}
                        onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Priority (1-10)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newRule.priority}
                        onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateRule}>Create Rule</Button>
                      <Button variant="outline" onClick={() => setIsCreating(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Existing Rules */}
            {rules.map((rule, index) => (
              <Card key={rule.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {ruleTypes.find(t => t.value === rule.type)?.label}
                          </Badge>
                          <Badge variant="secondary">Priority {rule.priority}</Badge>
                        </div>
                        <p className="font-medium mt-1">{rule.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDeleteRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    {renderRuleParameters(rule)}
                  </div>
                </CardContent>
              </Card>
            ))}

            {rules.length === 0 && !isCreating && (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No rules defined yet</p>
                <p className="text-sm">Add rules to configure resource allocation behavior</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

