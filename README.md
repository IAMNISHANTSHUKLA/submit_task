<<<<<<< HEAD
# Data Alchemist - AI Resource Allocation Configurator

Transform messy spreadsheets into clean, validated data with intelligent rules and prioritization.

## Overview

Data Alchemist is an AI-enabled Next.js web application that helps organizations manage their resource allocation data efficiently. Built with modern technologies and featuring beautiful Aceternity UI components, it provides a comprehensive solution for data ingestion, validation, rule creation, and export.

## Features

Data Alchemist offers AI-powered data processing that automatically maps wrongly named headers and rearranged columns. The application includes natural language search capabilities, allowing users to query their data using plain English. A comprehensive validation engine provides real-time feedback, while the AI suggests rules based on data patterns.

The data management system supports multiple file formats including CSV and XLSX uploads. Users can perform real-time editing with inline validation and cross-reference validation to ensure data integrity across entities. Visual indicators highlight validation issues for easy identification and correction.

The business rules engine features an intuitive rule builder that allows users to create rules using UI components. Rules can be described in natural language, supporting multiple types including co-run, load limits, phase windows, and precedence rules. The system validates rules to ensure they are applicable to your data.

Advanced prioritization capabilities include multiple configuration methods such as sliders, drag-and-drop ranking, and pairwise comparisons. Preset profiles provide quick start templates for common scenarios, while Analytic Hierarchy Process (AHP) support handles complex decisions. Real-time preview shows weight distribution as you configure settings.

The intelligent export system supports multiple formats including CSV and XLSX export options. Rules configuration can be exported as JSON, ready for downstream systems. Detailed validation reports provide error reporting, while processed and validated data is clean and ready for immediate use.

## Technology Stack

The application is built on React 19 with Vite for the frontend framework. Styling is handled through Tailwind CSS with Aceternity UI components, while UI components utilize Radix UI primitives. Data processing relies on PapaParse for CSV files and SheetJS for Excel files. Animations are powered by Framer Motion, icons by Lucide React, and the application includes Vercel-ready configuration for easy deployment.

## Getting Started

Before installation, ensure you have Node.js 18 or later installed, along with pnpm (recommended) or npm. Clone the repository and navigate to the data-alchemist directory. Install dependencies using pnpm install, then start the development server with pnpm run dev. Open your browser to http://localhost:5173 to access the application.

For production builds, use pnpm run build. The application is configured for easy deployment on Vercel by connecting your repository to Vercel, which will automatically detect the configuration and allow deployment with a single click.

## Sample Data

The samples directory contains example data files including the latest sample data and alternative sample data files. The data structure includes three main entities: Clients, Workers, and Tasks.

Client data includes ClientID as a unique identifier, ClientName, PriorityLevel ranging from 1-5, RequestedTaskIDs as comma-separated task IDs, GroupTag for client group classification, and AttributesJSON for additional metadata.

Worker data contains WorkerID as a unique identifier, WorkerName, Skills as comma-separated values, AvailableSlots as a JSON array, MaxLoadPerPhase indicating maximum workload per phase, WorkerGroup for worker group classification, and QualificationLevel indicating skill level from 1-5.

Task data includes TaskID as a unique identifier, TaskName, Category, Duration in phases, RequiredSkills as comma-separated required skills, PreferredPhases for preferred execution phases, and MaxConcurrent indicating maximum concurrent assignments.

## Usage Guide

The application workflow begins with data upload where users can upload CSV or XLSX files for clients, workers, and tasks. The AI-powered parser automatically maps columns and provides a preview before proceeding.

Data review and validation allows users to view data in an editable grid format. Natural language search helps find specific records, while validation errors can be fixed through inline editing. The system monitors validation status in real-time.

Rule configuration provides an intuitive UI for creating business rules. Users can describe complex rules using natural language, accept AI-generated rule recommendations, and preview rule configurations before applying them.

Prioritization setup offers multiple methods for configuration. Users can choose from preset profiles for quick setup, configure weights using sliders or ranking systems, and apply pairwise comparisons for complex scenarios.

The export and download process allows users to export cleaned data in CSV or XLSX format, download rules configuration as JSON, include validation reports if needed, and prepare data for downstream allocation systems.

## Validation Rules

The application includes comprehensive validation covering core validations such as missing required columns, duplicate IDs, malformed data formats, out-of-range values, invalid JSON structures, broken references, circular dependencies, and resource constraints.

AI-enhanced validations provide pattern recognition, anomaly detection, cross-entity consistency checks, and business rule compliance verification.

## API Integration

The application is designed to work with downstream allocation systems through a specific rules configuration format. The JSON structure includes version information, timestamp, rules array, prioritization details with method, weights, and preset information, along with relevant metadata.

## Contributing

Contributors should fork the repository, create a feature branch, make changes, add tests if applicable, and submit a pull request. This ensures a smooth collaboration process and maintains code quality.
=======
# AI Resource Allocation Configurator

A sophisticated Next.js web application that transforms chaotic spreadsheet data into clean, validated, rule-based resource allocation configurations using AI-powered features. Built for non-technical business professionals who need to process client, worker, and task data efficiently.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Architecture](#architecture)
- [AI Integration](#ai-integration)
- [Validation Engine](#validation-engine)
- [Data Formats](#data-formats)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Overview

The AI Resource Allocation Configurator addresses the common business challenge of managing complex resource allocation data stored in spreadsheets. Traditional approaches to handling client requests, worker assignments, and task scheduling often result in data inconsistencies, validation errors, and inefficient manual processes.

This application leverages artificial intelligence to automatically detect data patterns, validate business rules, and suggest corrections, transforming raw spreadsheet data into production-ready configuration files. The system supports multiple data formats, provides real-time validation feedback, and offers natural language interfaces for both data querying and rule creation.

### Key Problems Solved

The application specifically addresses several critical data management challenges commonly encountered in resource allocation scenarios:

**Data Quality Issues**: Spreadsheets often contain inconsistent formatting, missing values, duplicate entries, and broken references. Our validation engine identifies and flags these issues automatically, providing specific guidance for resolution.

**Complex Business Rules**: Resource allocation requires sophisticated rules governing task co-execution, worker load limits, skill matching, and priority handling. The visual rule builder and natural language processing capabilities make it easy to define and maintain these rules without technical expertise.

**Manual Validation Overhead**: Traditional approaches require extensive manual review to ensure data consistency. Our AI-powered validation engine performs comprehensive checks automatically, reducing validation time from hours to minutes.

**Integration Complexity**: Converting spreadsheet data into formats suitable for production systems typically requires custom development. This application provides standardized export formats and APIs for seamless integration with existing systems.

## Features

### Milestone 1: Data Ingestion and Validation

**Multi-Format File Upload System**
The application supports drag-and-drop file uploads for both CSV and Excel formats, with automatic format detection and parsing. The upload system includes progress indicators, error handling, and file size validation to ensure reliable data ingestion.

**AI-Powered Header Mapping**
Intelligent column mapping automatically detects and corrects common header naming inconsistencies. The system uses fuzzy string matching and machine learning to map variant column names to standardized field names, reducing manual configuration overhead.

**Interactive Data Grid**
A fully editable data grid provides immediate visual feedback for validation errors and warnings. Users can edit cells directly, with real-time validation and error highlighting. The grid supports bulk operations, filtering, and responsive design for mobile compatibility.

**Comprehensive Validation Engine**
The system implements twelve distinct validation categories covering all common data quality issues:

1. **Missing Required Fields**: Identifies empty or null values in mandatory columns
2. **Duplicate ID Detection**: Finds duplicate identifiers across all data entities
3. **Malformed List Validation**: Checks comma-separated lists and JSON arrays for proper formatting
4. **Range Validation**: Ensures numeric values fall within acceptable ranges
5. **JSON Structure Validation**: Validates JSON fields and identifies plain text masquerading as JSON
6. **Reference Integrity**: Verifies that all ID references point to existing entities
7. **Circular Dependency Detection**: Identifies potential loops in task dependencies
8. **Rule Conflict Analysis**: Checks for contradictory business rules
9. **Worker Overload Detection**: Ensures worker capacity constraints are respected
10. **Phase Saturation Analysis**: Validates task scheduling feasibility
11. **Skill Coverage Matrix**: Confirms required skills are available in the worker pool
12. **Concurrency Feasibility**: Validates maximum concurrent task limits

**Natural Language Data Retrieval**
Users can query data using natural language expressions such as "high priority clients in GroupA" or "clients with budgets over 100000". The system parses these queries using both rule-based patterns and AI-powered natural language processing, returning filtered results with confidence scores.

### Milestone 2: Rule Configuration and Prioritization

**Visual Rule Builder**
An intuitive interface for creating complex business rules without programming knowledge. The rule builder supports six primary rule types:

- **Co-run Rules**: Define tasks that must execute simultaneously
- **Slot Restrictions**: Set minimum common availability requirements
- **Load Limits**: Establish maximum workload per phase
- **Phase Windows**: Restrict tasks to specific time periods
- **Pattern Matching**: Create regex-based conditional rules
- **Precedence Overrides**: Define priority hierarchies

**Natural Language Rule Generation**
Users can describe rules in plain English, and the AI system converts these descriptions into structured rule configurations. For example, "Tasks T17 and T27 should always run together" automatically generates a co-run rule with appropriate parameters.

**AI Rule Recommendations**
The system analyzes data patterns to suggest relevant business rules. It identifies common task groupings, worker utilization patterns, and client priority distributions to recommend rules that improve allocation efficiency.

**Prioritization and Weights Interface**
A sophisticated interface for defining rule priorities and optimization weights. Users can adjust the relative importance of different criteria such as task fulfillment, resource utilization, and fairness through intuitive slider controls or drag-and-drop ranking.

### Milestone 3: Advanced AI Features

**Natural Language Data Modification**
Users can request data changes using natural language commands. The AI system interprets these requests, suggests specific modifications, and applies changes after user approval. This feature includes comprehensive undo/redo functionality and change tracking.

**AI-Based Error Correction**
The system provides intelligent suggestions for fixing validation errors. Using contextual analysis and pattern recognition, it recommends specific corrections for common data quality issues, with confidence scores and explanations for each suggestion.

**Intelligent Export System**
Multiple export formats support different integration scenarios:

- **Cleaned CSV/Excel**: Validated and corrected source data
- **JSON Configuration**: Complete rule and parameter definitions
- **Validation Reports**: Detailed analysis of data quality improvements
- **Integration APIs**: RESTful endpoints for real-time system integration

## Technology Stack

### Frontend Framework
**Next.js 14+** with TypeScript provides the foundation for a modern, performant web application. The App Router architecture enables efficient code splitting and server-side rendering for optimal user experience.

### UI Components and Styling
**Tailwind CSS** delivers utility-first styling with comprehensive responsive design capabilities. **shadcn/ui** components provide accessible, customizable interface elements following modern design principles. **Aceternity UI** integration adds sophisticated animations and glassmorphism effects for a premium user experience.

### AI Integration
**Google Gemini API** powers natural language processing capabilities, including query parsing, rule generation, and error correction suggestions. The integration includes fallback mechanisms and error handling to ensure graceful degradation when AI services are unavailable.

### Data Processing
**Papa Parse** handles CSV file parsing with robust error handling and large file support. **SheetJS (xlsx)** provides comprehensive Excel file processing capabilities. **React Dropzone** enables intuitive drag-and-drop file uploads with validation and progress tracking.

### State Management and Validation
React hooks manage application state with proper error boundaries and loading states. A custom validation engine implements comprehensive business rule checking with detailed error reporting and correction suggestions.

### Animation and Interactions
**Framer Motion** provides smooth animations and micro-interactions throughout the interface. Custom CSS animations enhance the user experience with loading states, hover effects, and transition animations.

## Installation

### Prerequisites

Ensure your development environment includes the following requirements:

- **Node.js 18.0 or higher**: Required for Next.js 14+ compatibility
- **npm 8.0 or higher**: Package management and dependency installation
- **Git**: Version control and repository cloning
- **Modern web browser**: Chrome, Firefox, Safari, or Edge with JavaScript enabled

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ai-resource-allocator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

### Production Deployment

For production deployment, follow these additional steps:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

3. **Environment configuration**:
   Ensure all environment variables are properly configured in your production environment, including API keys and any database connections.

## Usage Guide

### Getting Started

The application follows a structured workflow designed to guide users through the complete data processing pipeline:

**Step 1: Data Upload**
Begin by uploading your spreadsheet files using the drag-and-drop interface. The system accepts both CSV and Excel formats, automatically detecting file types and parsing content. Upload progress is displayed in real-time, with detailed error messages if parsing fails.

**Step 2: Data Review and Validation**
Once uploaded, data appears in interactive grids organized by entity type (Clients, Workers, Tasks). The validation engine automatically runs, highlighting errors and warnings with color-coded indicators. Click on any highlighted cell to view specific error details and suggested corrections.

**Step 3: Rule Configuration**
Navigate to the Rules tab to define business logic governing resource allocation. Use either the visual rule builder for structured rule creation or the natural language interface for intuitive rule description. The AI system provides recommendations based on data patterns and common business scenarios.

**Step 4: Export and Integration**
After validation and rule configuration, export your cleaned data and configuration files. Choose from multiple formats depending on your integration requirements, including CSV for spreadsheet compatibility, JSON for API integration, or comprehensive reports for documentation purposes.

### Advanced Features

**Natural Language Querying**
The search interface accepts complex natural language queries for data exploration. Examples include:

- "Show me all high priority clients in GroupA"
- "Find clients with budgets over 100000 in London"
- "List workers with Python and JavaScript skills"
- "Identify clients with invalid task references"

**Bulk Data Operations**
Select multiple rows in any data grid to perform bulk operations such as editing common fields, deleting records, or exporting subsets. The system maintains data integrity during bulk operations and provides undo functionality for accidental changes.

**Real-Time Collaboration**
Multiple users can work with the same dataset simultaneously, with changes synchronized in real-time. The system tracks all modifications with timestamps and user attribution for audit purposes.

## Architecture

### Component Structure

The application follows a modular architecture with clear separation of concerns:

**Core Components**:
- `FileUploader`: Handles file upload, parsing, and initial validation
- `DataGrid`: Provides interactive data editing with real-time validation
- `ValidationSummary`: Displays comprehensive validation results and suggestions
- `RuleBuilder`: Visual interface for business rule configuration
- `ThemeToggle`: Dark/light mode switching with system preference detection

**Utility Libraries**:
- `ValidationEngine`: Comprehensive data validation with 12 distinct check categories
- `QueryParser`: Natural language query processing with AI fallback
- `FileParser`: Multi-format file parsing with error handling
- `GeminiIntegration`: AI service integration with graceful degradation

**Type Definitions**:
Comprehensive TypeScript interfaces ensure type safety throughout the application, covering all data entities, validation results, rules, and configuration options.

### Data Flow

The application implements a unidirectional data flow pattern:

1. **File Upload**: Raw files are parsed and converted to standardized data structures
2. **Validation**: Data passes through the validation engine, generating error and warning reports
3. **User Interaction**: Users can edit data, create rules, and query information
4. **AI Processing**: Natural language inputs are processed by AI services with fallback mechanisms
5. **Export**: Validated data and configurations are formatted for external consumption

### Error Handling

Comprehensive error handling ensures application stability:

- **File Processing Errors**: Detailed messages for parsing failures with suggested corrections
- **Validation Errors**: Specific error locations with correction suggestions
- **AI Service Errors**: Graceful fallback to rule-based processing when AI services are unavailable
- **Network Errors**: Retry mechanisms and offline capability for critical functions

## AI Integration

### Google Gemini Integration

The application leverages Google's Gemini AI model for several key features:

**Natural Language Query Processing**
User queries are processed through a two-stage system. First, rule-based pattern matching handles common query types for fast response times. If pattern matching fails to produce confident results, the query is sent to Gemini for advanced natural language understanding.

**Rule Generation from Natural Language**
Users can describe business rules in plain English, which are then converted to structured rule objects. The AI system understands context from the current dataset, ensuring generated rules reference valid entities and follow business logic constraints.

**Data Validation Enhancement**
Beyond rule-based validation, the AI system analyzes data patterns to identify anomalies that might not trigger standard validation rules. This includes detecting unusual value distributions, identifying potential data entry errors, and suggesting data quality improvements.

**Error Correction Suggestions**
When validation errors are detected, the AI system analyzes the context and suggests specific corrections. These suggestions include confidence scores and explanations, allowing users to make informed decisions about data modifications.

### Fallback Mechanisms

The application is designed to function effectively even when AI services are unavailable:

- **Rule-Based Query Processing**: Common query patterns are handled without AI assistance
- **Manual Rule Creation**: The visual rule builder provides full functionality independent of AI services
- **Standard Validation**: Core validation rules operate without AI enhancement
- **Graceful Degradation**: AI features fail silently, with clear indicators when services are unavailable

## Validation Engine

### Comprehensive Validation Categories

The validation engine implements twelve distinct categories of data quality checks:

**1. Missing Required Fields**
Identifies empty, null, or undefined values in mandatory columns. The system maintains configurable lists of required fields for each entity type and provides specific guidance for completing missing information.

**2. Duplicate ID Detection**
Scans all entity collections to identify duplicate identifiers. The system checks for exact matches and similar values that might represent the same entity with minor variations.

**3. Malformed List Validation**
Validates comma-separated lists and JSON arrays for proper formatting. Common issues include trailing commas, inconsistent spacing, and mixed delimiter usage.

**4. Range Validation**
Ensures numeric values fall within acceptable business ranges. For example, priority levels must be between 1 and 5, and task durations must be positive integers.

**5. JSON Structure Validation**
Validates JSON fields and identifies plain text masquerading as JSON. The system can distinguish between valid JSON objects, malformed JSON, and plain text descriptions.

**6. Reference Integrity**
Verifies that all ID references point to existing entities. This includes checking task ID references in client requests and ensuring worker group references are valid.

**7. Circular Dependency Detection**
Identifies potential loops in task dependencies and co-run relationships. The system uses graph traversal algorithms to detect cycles that could cause infinite loops in allocation algorithms.

**8. Rule Conflict Analysis**
Checks for contradictory business rules that could prevent successful resource allocation. This includes conflicting priority assignments and mutually exclusive constraints.

**9. Worker Overload Detection**
Ensures worker capacity constraints are respected by comparing available slots with maximum load per phase settings.

**10. Phase Saturation Analysis**
Validates that task scheduling is feasible given worker availability and task duration requirements.

**11. Skill Coverage Matrix**
Confirms that all required skills are available in the worker pool, identifying potential skill gaps that could prevent task completion.

**12. Concurrency Feasibility**
Validates maximum concurrent task limits against available resources and scheduling constraints.

### Error Reporting and Resolution

The validation system provides detailed error reports with specific guidance for resolution:

- **Error Location**: Precise row and column identification for data grid highlighting
- **Error Description**: Clear explanation of the validation failure
- **Suggested Corrections**: Specific recommendations for fixing the issue
- **Severity Classification**: Distinction between critical errors and warnings
- **Batch Resolution**: Tools for fixing similar errors across multiple records

## Data Formats

### Supported Input Formats

**CSV Files**
Standard comma-separated value files with header rows. The system handles various CSV dialects, including different delimiter characters, quote styles, and encoding formats.

**Excel Files**
Microsoft Excel files in both .xlsx and .xls formats. The system processes the first worksheet by default, with options for selecting specific sheets in multi-sheet workbooks.

### Data Entity Structures

**Client Entity**
```typescript
interface Client {
  ClientID: string;        // Unique identifier (e.g., "C1", "C2")
  ClientName: string;      // Display name (e.g., "Acme Corp")
  PriorityLevel: number;   // Priority ranking 1-5 (1=highest)
  RequestedTaskIDs: string; // Comma-separated task list
  GroupTag: string;        // Group classification
  AttributesJSON: string;  // JSON metadata or plain text
}
```

**Worker Entity**
```typescript
interface Worker {
  WorkerID: string;           // Unique identifier
  WorkerName: string;         // Display name
  Skills: string;             // Comma-separated skill list
  AvailableSlots: string;     // JSON array of available time slots
  MaxLoadPerPhase: number;    // Maximum concurrent assignments
  WorkerGroup: string;        // Group classification
  QualificationLevel: string; // Skill level designation
}
```

**Task Entity**
```typescript
interface Task {
  TaskID: string;          // Unique identifier
  TaskName: string;        // Display name
  Category: string;        // Task classification
  Duration: number;        // Required phases for completion
  RequiredSkills: string;  // Comma-separated skill requirements
  PreferredPhases: string; // Preferred scheduling windows
  MaxConcurrent: number;   // Maximum parallel instances
}
```

### Export Formats

**Cleaned Data Files**
Validated and corrected versions of input data in CSV or Excel format, suitable for import into other systems or manual review.

**JSON Configuration**
Complete rule and parameter definitions in JSON format, designed for programmatic consumption by allocation algorithms and integration systems.

**Validation Reports**
Comprehensive documentation of data quality improvements, including before/after comparisons, error summaries, and correction details.

## API Reference

### Core Functions

**File Processing**
```typescript
FileParser.parseFile(file: File): Promise<FileUploadResult>
```
Parses uploaded files and returns structured data with headers and metadata.

**Validation**
```typescript
ValidationEngine.validateAll(): ValidationResult
```
Performs comprehensive validation and returns detailed error and warning reports.

**Natural Language Processing**
```typescript
QueryParser.parseQuery(query: string, dataType: string): Promise<FilterObject>
```
Converts natural language queries into structured filter objects for data retrieval.

**Rule Generation**
```typescript
generateRuleFromNaturalLanguage(description: string, context: any): Promise<Rule>
```
Creates structured rule objects from natural language descriptions.

### Integration Endpoints

The application provides RESTful API endpoints for system integration:

**Data Upload**
- `POST /api/upload` - Upload and parse data files
- `GET /api/data/{type}` - Retrieve parsed data by entity type
- `PUT /api/data/{type}/{id}` - Update specific data records

**Validation**
- `POST /api/validate` - Run validation on current dataset
- `GET /api/validation/results` - Retrieve validation results
- `POST /api/validation/fix` - Apply suggested corrections

**Rules**
- `GET /api/rules` - Retrieve all configured rules
- `POST /api/rules` - Create new business rules
- `PUT /api/rules/{id}` - Update existing rules
- `DELETE /api/rules/{id}` - Remove rules

**Export**
- `GET /api/export/data` - Export cleaned data files
- `GET /api/export/config` - Export rule configurations
- `GET /api/export/report` - Generate validation reports

## Contributing

We welcome contributions to improve the AI Resource Allocation Configurator. Please follow these guidelines:

### Development Setup

1. Fork the repository and create a feature branch
2. Install dependencies and configure your development environment
3. Make changes following the established code style and patterns
4. Add tests for new functionality
5. Update documentation as needed
6. Submit a pull request with a clear description of changes

### Code Standards

- Follow TypeScript best practices with strict type checking
- Use ESLint and Prettier for code formatting consistency
- Write comprehensive tests for new features
- Document complex functions and algorithms
- Follow accessibility guidelines for UI components

### Testing

The project includes comprehensive testing coverage:

- **Unit Tests**: Individual function and component testing
- **Integration Tests**: End-to-end workflow validation
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Performance Tests**: Large dataset handling and response times

## License

This project is licensed under the MIT License. See the LICENSE file for complete terms and conditions.

---

**Author**: Manus AI  
**Version**: 1.0.0  
**Last Updated**: December 2024

For support, feature requests, or bug reports, please visit our GitHub repository or contact our development team.

>>>>>>> c7e3adc (test)
