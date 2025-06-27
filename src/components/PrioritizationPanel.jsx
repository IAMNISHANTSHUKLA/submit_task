import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { ArrowUpDown, RotateCcw, Target, TrendingUp, Users, Clock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const PrioritizationPanel = ({ priorities, onPrioritiesChange, onNext }) => {
  const [activeMethod, setActiveMethod] = useState('sliders');
  const [sliderValues, setSliderValues] = useState({
    priorityLevel: 70,
    taskFulfillment: 80,
    fairnessConstraints: 60,
    workloadBalance: 75,
    skillUtilization: 65,
    timeEfficiency: 85
  });
  const [rankingOrder, setRankingOrder] = useState([
    { id: 'priorityLevel', name: 'Priority Level', icon: Target },
    { id: 'taskFulfillment', name: 'Task Fulfillment', icon: TrendingUp },
    { id: 'fairnessConstraints', name: 'Fairness Constraints', icon: Users },
    { id: 'workloadBalance', name: 'Workload Balance', icon: ArrowUpDown },
    { id: 'skillUtilization', name: 'Skill Utilization', icon: Target },
    { id: 'timeEfficiency', name: 'Time Efficiency', icon: Clock }
  ]);
  const [pairwiseMatrix, setPairwiseMatrix] = useState({});
  const [selectedPreset, setSelectedPreset] = useState('');

  const presets = {
    maximizeFulfillment: {
      name: 'Maximize Fulfillment',
      description: 'Focus on completing as many requested tasks as possible',
      weights: {
        priorityLevel: 60,
        taskFulfillment: 95,
        fairnessConstraints: 40,
        workloadBalance: 50,
        skillUtilization: 70,
        timeEfficiency: 80
      }
    },
    fairDistribution: {
      name: 'Fair Distribution',
      description: 'Ensure equitable distribution of work across all workers',
      weights: {
        priorityLevel: 50,
        taskFulfillment: 60,
        fairnessConstraints: 95,
        workloadBalance: 90,
        skillUtilization: 70,
        timeEfficiency: 60
      }
    },
    minimizeWorkload: {
      name: 'Minimize Workload',
      description: 'Optimize for minimal worker stress and balanced assignments',
      weights: {
        priorityLevel: 40,
        taskFulfillment: 50,
        fairnessConstraints: 80,
        workloadBalance: 95,
        skillUtilization: 60,
        timeEfficiency: 70
      }
    },
    skillOptimized: {
      name: 'Skill Optimized',
      description: 'Maximize utilization of worker skills and expertise',
      weights: {
        priorityLevel: 70,
        taskFulfillment: 75,
        fairnessConstraints: 60,
        workloadBalance: 65,
        skillUtilization: 95,
        timeEfficiency: 85
      }
    }
  };

  useEffect(() => {
    updatePriorities();
  }, [sliderValues, rankingOrder, pairwiseMatrix, activeMethod]);

  const updatePriorities = () => {
    let weights = {};
    
    switch (activeMethod) {
      case 'sliders':
        weights = sliderValues;
        break;
      case 'ranking':
        rankingOrder.forEach((item, index) => {
          weights[item.id] = 100 - (index * 15); // Higher rank = higher weight
        });
        break;
      case 'pairwise':
        weights = calculatePairwiseWeights();
        break;
      default:
        weights = sliderValues;
    }
    
    onPrioritiesChange({
      method: activeMethod,
      weights,
      preset: selectedPreset
    });
  };

  const calculatePairwiseWeights = () => {
    // Simplified AHP calculation
    const criteria = Object.keys(sliderValues);
    const weights = {};
    
    criteria.forEach(criterion => {
      let sum = 0;
      criteria.forEach(other => {
        const key = `${criterion}-${other}`;
        const reverseKey = `${other}-${criterion}`;
        if (pairwiseMatrix[key]) {
          sum += pairwiseMatrix[key];
        } else if (pairwiseMatrix[reverseKey]) {
          sum += 1 / pairwiseMatrix[reverseKey];
        } else {
          sum += 1; // Equal importance
        }
      });
      weights[criterion] = Math.round((sum / criteria.length) * 20); // Normalize to 0-100
    });
    
    return weights;
  };

  const handleSliderChange = (criterion, value) => {
    setSliderValues(prev => ({
      ...prev,
      [criterion]: value[0]
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(rankingOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setRankingOrder(items);
  };

  const handlePairwiseChange = (criterion1, criterion2, value) => {
    const key = `${criterion1}-${criterion2}`;
    setPairwiseMatrix(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  };

  const applyPreset = (presetKey) => {
    const preset = presets[presetKey];
    setSliderValues(preset.weights);
    setSelectedPreset(presetKey);
    setActiveMethod('sliders');
  };

  const resetToDefaults = () => {
    setSliderValues({
      priorityLevel: 70,
      taskFulfillment: 80,
      fairnessConstraints: 60,
      workloadBalance: 75,
      skillUtilization: 65,
      timeEfficiency: 85
    });
    setSelectedPreset('');
  };

  const renderSliders = () => (
    <div className="space-y-6">
      {Object.entries(sliderValues).map(([key, value]) => {
        const item = rankingOrder.find(r => r.id === key);
        const Icon = item?.icon || Target;
        
        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4 text-blue-400" />
                <label className="text-sm font-medium text-white">
                  {item?.name || key}
                </label>
              </div>
              <span className="text-sm text-gray-400">{value}%</span>
            </div>
            <Slider
              value={[value]}
              onValueChange={(newValue) => handleSliderChange(key, newValue)}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        );
      })}
    </div>
  );

  const renderRanking = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-400 mb-4">
        Drag and drop to reorder criteria by importance (top = most important)
      </p>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="ranking">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {rankingOrder.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-gray-800 rounded-lg p-4 flex items-center space-x-3 transition-all ${
                        snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <item.icon className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">{item.name}</span>
                      <ArrowUpDown className="h-4 w-4 text-gray-400 ml-auto" />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );

  const renderPairwise = () => {
    const criteria = Object.keys(sliderValues);
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-400 mb-4">
          Compare each pair of criteria. Select how much more important the first is compared to the second.
        </p>
        <div className="grid gap-4">
          {criteria.map((criterion1, i) => 
            criteria.slice(i + 1).map(criterion2 => {
              const key = `${criterion1}-${criterion2}`;
              const item1 = rankingOrder.find(r => r.id === criterion1);
              const item2 = rankingOrder.find(r => r.id === criterion2);
              
              return (
                <div key={key} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{item1?.name}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-white font-medium">{item2?.name}</span>
                  </div>
                  <select
                    value={pairwiseMatrix[key] || 1}
                    onChange={(e) => handlePairwiseChange(criterion1, criterion2, e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                  >
                    <option value={9}>Extremely more important</option>
                    <option value={7}>Very strongly more important</option>
                    <option value={5}>Strongly more important</option>
                    <option value={3}>Moderately more important</option>
                    <option value={1}>Equally important</option>
                    <option value={0.33}>Moderately less important</option>
                    <option value={0.2}>Strongly less important</option>
                    <option value={0.14}>Very strongly less important</option>
                    <option value={0.11}>Extremely less important</option>
                  </select>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Prioritization & Weights</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Set the relative importance of different criteria that the allocation system will use to balance competing needs.
        </p>
      </div>

      {/* Preset Profiles */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Start Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`text-left p-4 rounded-lg border transition-all ${
                selectedPreset === key
                  ? 'border-green-400 bg-green-900/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <h4 className="font-medium text-white mb-2">{preset.name}</h4>
              <p className="text-sm text-gray-400">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Method Selection */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-semibold text-white mb-4">Prioritization Method</h3>
          <div className="space-y-2">
            {[
              { key: 'sliders', name: 'Weight Sliders', description: 'Assign weights using sliders' },
              { key: 'ranking', name: 'Drag & Drop Ranking', description: 'Rank criteria by importance' },
              { key: 'pairwise', name: 'Pairwise Comparison', description: 'Compare criteria pairs (AHP)' }
            ].map(method => (
              <button
                key={method.key}
                onClick={() => setActiveMethod(method.key)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  activeMethod === method.key
                    ? 'border-blue-400 bg-blue-900/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <h4 className="font-medium text-white">{method.name}</h4>
                <p className="text-sm text-gray-400 mt-1">{method.description}</p>
              </button>
            ))}
          </div>
          
          <button
            onClick={resetToDefaults}
            className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              {activeMethod === 'sliders' && 'Weight Configuration'}
              {activeMethod === 'ranking' && 'Criteria Ranking'}
              {activeMethod === 'pairwise' && 'Pairwise Comparisons'}
            </h3>
            
            {activeMethod === 'sliders' && renderSliders()}
            {activeMethod === 'ranking' && renderRanking()}
            {activeMethod === 'pairwise' && renderPairwise()}
          </div>
        </div>
      </div>

      {/* Current Weights Summary */}
      <div className="bg-gray-900/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Current Weight Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(priorities.weights || sliderValues).map(([key, weight]) => {
            const item = rankingOrder.find(r => r.id === key);
            const Icon = item?.icon || Target;
            
            return (
              <div key={key} className="text-center">
                <div className="bg-gray-800 rounded-lg p-4">
                  <Icon className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{Math.round(weight)}%</div>
                  <div className="text-sm text-gray-400">{item?.name || key}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Proceed to Export
        </button>
      </div>
    </div>
  );
};

export default PrioritizationPanel;

