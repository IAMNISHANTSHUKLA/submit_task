import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BackgroundBeams } from './components/ui/background-beams';
import { Spotlight } from './components/ui/spotlight';
import { FloatingNav } from './components/ui/floating-navbar';
import { HoverEffect } from './components/ui/card-hover-effect';
import FileUpload from './components/FileUpload';
import DataGrid from './components/DataGrid';
import ValidationPanel from './components/ValidationPanel';
import RuleBuilder from './components/RuleBuilder';
import PrioritizationPanel from './components/PrioritizationPanel';
import ExportPanel from './components/ExportPanel';
import { Home, Upload, Database, Settings, Download } from 'lucide-react';
import './App.css';

const navItems = [
  { name: "Home", link: "#home", icon: <Home className="h-4 w-4" /> },
  { name: "Upload", link: "#upload", icon: <Upload className="h-4 w-4" /> },
  { name: "Data", link: "#data", icon: <Database className="h-4 w-4" /> },
  { name: "Rules", link: "#rules", icon: <Settings className="h-4 w-4" /> },
  { name: "Export", link: "#export", icon: <Download className="h-4 w-4" /> },
];

function App() {
  const [currentStep, setCurrentStep] = useState('upload');
  const [uploadedData, setUploadedData] = useState({
    clients: [],
    workers: [],
    tasks: []
  });
  const [validationResults, setValidationResults] = useState({});
  const [rules, setRules] = useState([]);
  const [priorities, setPriorities] = useState({});

  const features = [
    {
      title: "AI-Powered Data Parsing",
      description: "Intelligent parsing that maps wrongly named headers and rearranged columns to correct data points automatically.",
      link: "#"
    },
    {
      title: "Real-time Validation",
      description: "Comprehensive validation engine that checks for missing columns, duplicates, malformed data, and complex business rules.",
      link: "#"
    },
    {
      title: "Natural Language Search",
      description: "Search your data using plain English queries. Find complex patterns without writing complex filters.",
      link: "#"
    },
    {
      title: "Smart Rule Builder",
      description: "Create business rules using natural language or intuitive UI components. AI converts your requirements to executable rules.",
      link: "#"
    },
    {
      title: "Dynamic Prioritization",
      description: "Set priorities using sliders, drag-and-drop ranking, or pairwise comparisons to balance different criteria.",
      link: "#"
    },
    {
      title: "Intelligent Export",
      description: "Export cleaned data and rules configuration ready for downstream allocation systems.",
      link: "#"
    }
  ];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <FileUpload 
            onDataUploaded={setUploadedData}
            onNext={() => setCurrentStep('data')}
          />
        );
      case 'data':
        return (
          <DataGrid 
            data={uploadedData}
            onDataChange={setUploadedData}
            onValidationResults={setValidationResults}
            onNext={() => setCurrentStep('rules')}
          />
        );
      case 'rules':
        return (
          <RuleBuilder 
            data={uploadedData}
            rules={rules}
            onRulesChange={setRules}
            onNext={() => setCurrentStep('priorities')}
          />
        );
      case 'priorities':
        return (
          <PrioritizationPanel 
            priorities={priorities}
            onPrioritiesChange={setPriorities}
            onNext={() => setCurrentStep('export')}
          />
        );
      case 'export':
        return (
          <ExportPanel 
            data={uploadedData}
            rules={rules}
            priorities={priorities}
            validationResults={validationResults}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Toaster position="top-right" />
      <FloatingNav navItems={navItems} />
      
      {/* Hero Section */}
      <div className="h-screen w-full relative flex flex-col items-center justify-center">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />
        
        <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
            Data Alchemist
          </h1>
          <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
            Forge Your Own AI Resource‑Allocation Configurator. Transform messy spreadsheets into clean, validated data with intelligent rules and prioritization.
          </p>
          
          <div className="mt-8 flex justify-center space-x-4">
            <button 
              onClick={() => setCurrentStep('upload')}
              className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                <span>Get Started</span>
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-white mb-4">
          Powerful Features
        </h2>
        <p className="text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
          Experience the next generation of data processing with AI-powered tools designed for non-technical users.
        </p>
        <HoverEffect items={features} />
      </div>

      {/* Main Application */}
      {currentStep !== 'upload' && (
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            {/* Step Navigation */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4">
                {['upload', 'data', 'rules', 'priorities', 'export'].map((step, index) => (
                  <button
                    key={step}
                    onClick={() => setCurrentStep(step)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      currentStep === step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Step Content */}
            {renderCurrentStep()}
          </div>
        </div>
      )}

      {/* Validation Panel - Always visible when there's data */}
      {Object.keys(validationResults).length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <ValidationPanel validationResults={validationResults} />
        </div>
      )}
    </div>
  );
}

export default App;

