import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Lightbulb, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RuleBuilder = ({ data, rules, onRulesChange, onNext }) => {
  const [activeRuleType, setActiveRuleType] = useState('coRun');
  const [newRule, setNewRule] = useState({});
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isProcessingNL, setIsProcessingNL] = useState(false);
  const [ruleRecommendations, setRuleRecommendations] = useState([]);

  useEffect(() => {
    generateRuleRecommendations();
  }, [data]);

  const ruleTypes = {
    coRun: {
      name: 'Co-run Tasks',
      description: 'Tasks that must run together',
      fields: ['tasks'],
      template: { type: 'coRun', tasks: [] }
    },
    slotRestriction: {
      name: 'Slot Restriction',
      description: 'Minimum common slots for groups',
      fields: ['group', 'minCommonSlots'],
      template: { type: 'slotRestriction', group: '', minCommonSlots: 1 }
    },
    loadLimit: {
      name: 'Load Limit',
      description: 'Maximum slots per phase for worker groups',
      fields: ['workerGroup', 'maxSlotsPerPhase'],
      template: { type: 'loadLimit', workerGroup: '', maxSlotsPerPhase: 1 }
    },
    phaseWindow: {
      name: 'Phase Window',
      description: 'Allowed phases for specific tasks',
      fields: ['taskId', 'allowedPhases'],
      template: { type: 'phaseWindow', taskId: '', allowedPhases: [] }
    },
    precedence: {
      name: 'Precedence Override',
      description: 'Task execution order requirements',
      fields: ['beforeTask', 'afterTask', 'priority'],
      template: { type: 'precedence', beforeTask: '', afterTask: '', priority: 1 }
    }
  };

  // AI-powered rule recommendations
  const generateRuleRecommendations = () => {
    const recommendations = [];

    // Analyze co-run patterns
    const taskPairs = {};
    data.clients?.forEach(client => {
      if (client.RequestedTaskIDs) {
        const tasks = client.RequestedTaskIDs.split(',').map(t => t.trim());
        for (let i = 0; i < tasks.length; i++) {
          for (let j = i + 1; j < tasks.length; j++) {
            const pair = [tasks[i], tasks[j]].sort().join('-');
            taskPairs[pair] = (taskPairs[pair] || 0) + 1;
          }
        }
      }
    });

    // Recommend co-run rules for frequently paired tasks
    Object.entries(taskPairs).forEach(([pair, count]) => {
      if (count >= 2) {
        const [task1, task2] = pair.split('-');
        recommendations.push({
          type: 'coRun',
          description: `Tasks ${task1} and ${task2} appear together in ${count} client requests`,
          rule: { type: 'coRun', tasks: [task1, task2] },
          confidence: Math.min(count / data.clients.length, 1)
        });
      }
    });

    // Analyze worker overload
    data.workers?.forEach(worker => {
      if (worker.AvailableSlots && worker.MaxLoadPerPhase) {
        try {
          const slots = JSON.parse(worker.AvailableSlots.replace(/'/g, '"'));
          const maxLoad = parseInt(worker.MaxLoadPerPhase);
          if (slots.length < maxLoad) {
            recommendations.push({
              type: 'loadLimit',
              description: `Worker ${worker.WorkerName} may be overloaded (${slots.length} slots, max load ${maxLoad})`,
              rule: { type: 'loadLimit', workerGroup: worker.WorkerGroup, maxSlotsPerPhase: Math.floor(maxLoad * 0.8) },
              confidence: 0.7
            });
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    // Analyze skill coverage
    const skillCoverage = {};
    data.tasks?.forEach(task => {
      if (task.RequiredSkills) {
        const skills = task.RequiredSkills.split(',').map(s => s.trim());
        skills.forEach(skill => {
          skillCoverage[skill] = (skillCoverage[skill] || 0) + 1;
        });
      }
    });

    const workerSkills = {};
    data.workers?.forEach(worker => {
      if (worker.Skills) {
        const skills = worker.Skills.split(',').map(s => s.trim());
        skills.forEach(skill => {
          workerSkills[skill] = (workerSkills[skill] || 0) + 1;
        });
      }
    });

    Object.entries(skillCoverage).forEach(([skill, taskCount]) => {
      const workerCount = workerSkills[skill] || 0;
      if (workerCount < taskCount) {
        recommendations.push({
          type: 'slotRestriction',
          description: `Skill "${skill}" is required by ${taskCount} tasks but only ${workerCount} workers have it`,
          rule: { type: 'slotRestriction', group: `skill:${skill}`, minCommonSlots: Math.ceil(taskCount / Math.max(workerCount, 1)) },
          confidence: 0.8
        });
      }
    });

    setRuleRecommendations(recommendations.slice(0, 5)); // Limit to top 5
  };

  // Natural language to rule conversion
  const processNaturalLanguage = async (input) => {
    setIsProcessingNL(true);
    
    try {
      // Simple pattern matching for demo purposes
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('co-run') || lowerInput.includes('together') || lowerInput.includes('same time')) {
        // Extract task IDs
        const taskMatches = input.match(/t\d+/gi);
        if (taskMatches && taskMatches.length >= 2) {
          return {
            type: 'coRun',
            tasks: taskMatches.slice(0, 2),
            description: `Co-run rule for ${taskMatches.slice(0, 2).join(' and ')}`
          };
        }
      }
      
      if (lowerInput.includes('load limit') || lowerInput.includes('maximum') || lowerInput.includes('limit')) {
        const numberMatch = input.match(/(\d+)/);
        const groupMatch = input.match(/group\s*(\w+)/i);
        if (numberMatch && groupMatch) {
          return {
            type: 'loadLimit',
            workerGroup: groupMatch[1],
            maxSlotsPerPhase: parseInt(numberMatch[1]),
            description: `Load limit for ${groupMatch[1]}: max ${numberMatch[1]} slots per phase`
          };
        }
      }
      
      if (lowerInput.includes('phase') && (lowerInput.includes('only') || lowerInput.includes('restrict'))) {
        const taskMatch = input.match(/t\d+/i);
        const phaseMatches = input.match(/(\d+)/g);
        if (taskMatch && phaseMatches) {
          return {
            type: 'phaseWindow',
            taskId: taskMatch[0],
            allowedPhases: phaseMatches.map(p => parseInt(p)),
            description: `Phase restriction for ${taskMatch[0]}: phases ${phaseMatches.join(', ')}`
          };
        }
      }
      
      throw new Error('Could not parse the natural language input. Please try a different phrasing or use the UI builder.');
      
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setIsProcessingNL(false);
    }
  };

  const handleNaturalLanguageSubmit = async () => {
    if (!naturalLanguageInput.trim()) return;
    
    const rule = await processNaturalLanguage(naturalLanguageInput);
    if (rule) {
      const newRules = [...rules, { ...rule, id: Date.now() }];
      onRulesChange(newRules);
      setNaturalLanguageInput('');
      toast.success('Rule created from natural language input!');
    }
  };

  const addRule = () => {
    if (!newRule.type) {
      toast.error('Please select a rule type');
      return;
    }
    
    const rule = { ...ruleTypes[newRule.type].template, ...newRule, id: Date.now() };
    const newRules = [...rules, rule];
    onRulesChange(newRules);
    setNewRule({});
    toast.success('Rule added successfully!');
  };

  const deleteRule = (ruleId) => {
    const newRules = rules.filter(rule => rule.id !== ruleId);
    onRulesChange(newRules);
    toast.success('Rule deleted');
  };

  const acceptRecommendation = (recommendation) => {
    const rule = { ...recommendation.rule, id: Date.now() };
    const newRules = [...rules, rule];
    onRulesChange(newRules);
    setRuleRecommendations(prev => prev.filter(r => r !== recommendation));
    toast.success('Recommendation accepted!');
  };

  const renderRuleForm = () => {
    const ruleType = ruleTypes[activeRuleType];
    if (!ruleType) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">{ruleType.name}</h3>
        <p className="text-sm text-gray-400">{ruleType.description}</p>
        
        {ruleType.fields.map(field => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            {field === 'tasks' ? (
              <select
                multiple
                value={newRule[field] || []}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  type: activeRuleType,
                  [field]: Array.from(e.target.selectedOptions, option => option.value)
                }))}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
              >
                {data.tasks?.map(task => (
                  <option key={task.TaskID} value={task.TaskID}>
                    {task.TaskID} - {task.TaskName}
                  </option>
                ))}
              </select>
            ) : field === 'workerGroup' ? (
              <select
                value={newRule[field] || ''}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  type: activeRuleType,
                  [field]: e.target.value
                }))}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
              >
                <option value="">Select worker group</option>
                {[...new Set(data.workers?.map(w => w.WorkerGroup))].map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            ) : field === 'taskId' ? (
              <select
                value={newRule[field] || ''}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  type: activeRuleType,
                  [field]: e.target.value
                }))}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
              >
                <option value="">Select task</option>
                {data.tasks?.map(task => (
                  <option key={task.TaskID} value={task.TaskID}>
                    {task.TaskID} - {task.TaskName}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.includes('Phase') || field.includes('Slots') || field === 'priority' ? 'number' : 'text'}
                value={newRule[field] || ''}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  type: activeRuleType,
                  [field]: e.target.value
                }))}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
                placeholder={`Enter ${field}`}
              />
            )}
          </div>
        ))}
        
        <button
          onClick={addRule}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Rule
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Business Rules Configuration</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Create business rules using our intuitive interface or natural language. AI will help recommend rules based on your data patterns.
        </p>
      </div>

      {/* Natural Language Input */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Wand2 className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Natural Language Rule Creator</h3>
        </div>
        <div className="space-y-4">
          <textarea
            value={naturalLanguageInput}
            onChange={(e) => setNaturalLanguageInput(e.target.value)}
            placeholder="Describe your rule in plain English... e.g., 'Tasks T1 and T2 should co-run together' or 'Limit GroupA workers to maximum 3 slots per phase'"
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 h-24 resize-none"
          />
          <button
            onClick={handleNaturalLanguageSubmit}
            disabled={isProcessingNL || !naturalLanguageInput.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isProcessingNL ? 'Processing...' : 'Create Rule'}
          </button>
        </div>
      </div>

      {/* Rule Recommendations */}
      {ruleRecommendations.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">AI Rule Recommendations</h3>
          </div>
          <div className="space-y-3">
            {ruleRecommendations.map((rec, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{rec.description}</p>
                  <p className="text-sm text-gray-400">Confidence: {Math.round(rec.confidence * 100)}%</p>
                </div>
                <button
                  onClick={() => acceptRecommendation(rec)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rule Builder UI */}
        <div className="bg-gray-900/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Rule Builder</h3>
          
          {/* Rule Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Rule Type</label>
            <select
              value={activeRuleType}
              onChange={(e) => setActiveRuleType(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            >
              {Object.entries(ruleTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>

          {renderRuleForm()}
        </div>

        {/* Current Rules */}
        <div className="bg-gray-900/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Current Rules ({rules.length})</h3>
          
          {rules.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No rules created yet</p>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white">{ruleTypes[rule.type]?.name || rule.type}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {JSON.stringify(rule, null, 2).replace(/[{}",]/g, '').trim()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Proceed to Prioritization
        </button>
      </div>
    </div>
  );
};

export default RuleBuilder;

