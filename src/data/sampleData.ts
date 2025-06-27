import { Client, Worker, Task } from '@/types';

// Sample client data based on the specification with known issues for testing
export const sampleClients: Client[] = [
  {
    ClientID: "C1",
    ClientName: "Acme Corp",
    PriorityLevel: 1,
    RequestedTaskIDs: "T17,T27,T33",
    GroupTag: "GroupA",
    AttributesJSON: '{"location":"New York","budget":150000,"vip":true}'
  },
  {
    ClientID: "C2",
    ClientName: "Globex Inc",
    PriorityLevel: 2,
    RequestedTaskIDs: "T1,T5,T12",
    GroupTag: "GroupB",
    AttributesJSON: "ensure deliverables align with corporate standards" // Plain text instead of JSON
  },
  {
    ClientID: "C20",
    ClientName: "TechStart LLC",
    PriorityLevel: 3,
    RequestedTaskIDs: "T5,TX,T8", // Contains invalid TaskID "TX"
    GroupTag: "GroupC",
    AttributesJSON: '{"location":"San Francisco","budget":75000}'
  },
  {
    ClientID: "C21",
    ClientName: "Innovation Labs",
    PriorityLevel: 4,
    RequestedTaskIDs: "T12,TX,T15", // Contains invalid TaskID "TX"
    GroupTag: "GroupA",
    AttributesJSON: '{"location":"Austin","budget":null,"notes":""}' // Null budget, empty notes
  },
  {
    ClientID: "C33",
    ClientName: "Future Systems",
    PriorityLevel: 2,
    RequestedTaskIDs: "T20,T99,T25", // Contains invalid TaskID "T99"
    GroupTag: "GroupB",
    AttributesJSON: '{"location":"London","vip":false,"rush":true}'
  },
  {
    ClientID: "C1", // Duplicate ID for testing
    ClientName: "Duplicate Corp",
    PriorityLevel: 5,
    RequestedTaskIDs: "T1,T2",
    GroupTag: "GroupC",
    AttributesJSON: '{"location":"Boston"}'
  }
];

// Sample worker data
export const sampleWorkers: Worker[] = [
  {
    WorkerID: "W1",
    WorkerName: "Alice Johnson",
    Skills: "Python,JavaScript,React",
    AvailableSlots: "[1,2,3]",
    MaxLoadPerPhase: 3,
    WorkerGroup: "Development",
    QualificationLevel: "Senior"
  },
  {
    WorkerID: "W2",
    WorkerName: "Bob Smith",
    Skills: "Python,Database,Analytics",
    AvailableSlots: "[2,4,5]",
    MaxLoadPerPhase: 2,
    WorkerGroup: "Development",
    QualificationLevel: "Expert"
  },
  {
    WorkerID: "W3",
    WorkerName: "Carol Davis",
    Skills: "Marketing,Analytics,Design",
    AvailableSlots: "[1,3,4,5]", // More slots than MaxLoadPerPhase
    MaxLoadPerPhase: 2,
    WorkerGroup: "Marketing",
    QualificationLevel: "Junior"
  },
  {
    WorkerID: "W4",
    WorkerName: "David Wilson",
    Skills: "Testing,QA,Automation",
    AvailableSlots: "invalid json", // Invalid JSON format
    MaxLoadPerPhase: 3,
    WorkerGroup: "QA",
    QualificationLevel: "Senior"
  }
];

// Sample task data
export const sampleTasks: Task[] = [
  {
    TaskID: "T1",
    TaskName: "Frontend Development",
    Category: "Development",
    Duration: 3,
    RequiredSkills: "JavaScript,React",
    PreferredPhases: "1-3",
    MaxConcurrent: 2
  },
  {
    TaskID: "T5",
    TaskName: "Database Design",
    Category: "Development",
    Duration: 2,
    RequiredSkills: "Database,Python",
    PreferredPhases: "2,4",
    MaxConcurrent: 1
  },
  {
    TaskID: "T8",
    TaskName: "User Testing",
    Category: "Testing",
    Duration: 1,
    RequiredSkills: "Testing,QA",
    PreferredPhases: "4-5",
    MaxConcurrent: 3
  },
  {
    TaskID: "T12",
    TaskName: "Marketing Campaign",
    Category: "Marketing",
    Duration: 4,
    RequiredSkills: "Marketing,Analytics",
    PreferredPhases: "1,3,5",
    MaxConcurrent: 2
  },
  {
    TaskID: "T15",
    TaskName: "Performance Optimization",
    Category: "Development",
    Duration: 2,
    RequiredSkills: "Python,Performance", // "Performance" skill not available in workers
    PreferredPhases: "3-4",
    MaxConcurrent: 1
  },
  {
    TaskID: "T17",
    TaskName: "API Integration",
    Category: "Development",
    Duration: 3,
    RequiredSkills: "Python,JavaScript",
    PreferredPhases: "2-4",
    MaxConcurrent: 2
  },
  {
    TaskID: "T20",
    TaskName: "Security Audit",
    Category: "Testing",
    Duration: 1,
    RequiredSkills: "Security,Testing", // "Security" skill not available
    PreferredPhases: "5",
    MaxConcurrent: 1
  },
  {
    TaskID: "T25",
    TaskName: "Documentation",
    Category: "Documentation",
    Duration: 2,
    RequiredSkills: "Writing,Technical", // Skills not available
    PreferredPhases: "4-5",
    MaxConcurrent: 3
  },
  {
    TaskID: "T27",
    TaskName: "Code Review",
    Category: "Development",
    Duration: 1,
    RequiredSkills: "Python,JavaScript",
    PreferredPhases: "3",
    MaxConcurrent: 4
  },
  {
    TaskID: "T33",
    TaskName: "Deployment Setup",
    Category: "DevOps",
    Duration: 2,
    RequiredSkills: "DevOps,Automation", // Skills not available
    PreferredPhases: "5",
    MaxConcurrent: 1
  }
];

// Note: TaskIDs "TX" and "T99" are intentionally missing to test unknown reference validation

