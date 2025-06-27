import { Client, Worker, Task, ValidationError, ValidationResult } from '@/types';

export class ValidationEngine {
  private clients: Client[] = [];
  private workers: Worker[] = [];
  private tasks: Task[] = [];

  setData(clients: Client[], workers: Worker[], tasks: Task[]) {
    this.clients = clients;
    this.workers = workers;
    this.tasks = tasks;
  }

  validateAll(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Run all 12 validation checks
    errors.push(...this.validateMissingRequiredColumns());
    errors.push(...this.validateDuplicateIDs());
    errors.push(...this.validateMalformedLists());
    errors.push(...this.validateOutOfRangeValues());
    errors.push(...this.validateBrokenJSON());
    errors.push(...this.validateUnknownReferences());
    errors.push(...this.validateCircularDependencies());
    errors.push(...this.validateConflictingRules());
    errors.push(...this.validateOverloadedWorkers());
    errors.push(...this.validatePhaseSaturation());
    errors.push(...this.validateSkillCoverage());
    errors.push(...this.validateMaxConcurrencyFeasibility());

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 1. Missing Required Columns
  private validateMissingRequiredColumns(): ValidationError[] {
    const errors: ValidationError[] = [];
    const requiredClientFields = ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'];
    const requiredWorkerFields = ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'];
    const requiredTaskFields = ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'];

    this.clients.forEach((client, index) => {
      requiredClientFields.forEach(field => {
        if (!client[field as keyof Client] && client[field as keyof Client] !== 0) {
          errors.push({
            type: 'MISSING_REQUIRED_FIELD',
            message: `Missing required field: ${field}`,
            cellLocation: { row: index, column: field },
            severity: 'error'
          });
        }
      });
    });

    return errors;
  }

  // 2. Duplicate IDs
  private validateDuplicateIDs(): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Check client IDs
    const clientIDs = new Set();
    this.clients.forEach((client, index) => {
      if (clientIDs.has(client.ClientID)) {
        errors.push({
          type: 'DUPLICATE_ID',
          message: `Duplicate ClientID: ${client.ClientID}`,
          cellLocation: { row: index, column: 'ClientID' },
          severity: 'error'
        });
      }
      clientIDs.add(client.ClientID);
    });

    // Check worker IDs
    const workerIDs = new Set();
    this.workers.forEach((worker, index) => {
      if (workerIDs.has(worker.WorkerID)) {
        errors.push({
          type: 'DUPLICATE_ID',
          message: `Duplicate WorkerID: ${worker.WorkerID}`,
          cellLocation: { row: index, column: 'WorkerID' },
          severity: 'error'
        });
      }
      workerIDs.add(worker.WorkerID);
    });

    // Check task IDs
    const taskIDs = new Set();
    this.tasks.forEach((task, index) => {
      if (taskIDs.has(task.TaskID)) {
        errors.push({
          type: 'DUPLICATE_ID',
          message: `Duplicate TaskID: ${task.TaskID}`,
          cellLocation: { row: index, column: 'TaskID' },
          severity: 'error'
        });
      }
      taskIDs.add(task.TaskID);
    });

    return errors;
  }

  // 3. Malformed Lists
  private validateMalformedLists(): ValidationError[] {
    const errors: ValidationError[] = [];

    this.clients.forEach((client, index) => {
      // Validate RequestedTaskIDs format
      if (client.RequestedTaskIDs && !this.isValidCommaSeparatedList(client.RequestedTaskIDs)) {
        errors.push({
          type: 'MALFORMED_LIST',
          message: `Invalid RequestedTaskIDs format: ${client.RequestedTaskIDs}`,
          cellLocation: { row: index, column: 'RequestedTaskIDs' },
          severity: 'error'
        });
      }
    });

    this.workers.forEach((worker, index) => {
      // Validate AvailableSlots JSON format
      if (worker.AvailableSlots && !this.isValidJSONArray(worker.AvailableSlots)) {
        errors.push({
          type: 'MALFORMED_LIST',
          message: `Invalid AvailableSlots JSON format: ${worker.AvailableSlots}`,
          cellLocation: { row: index, column: 'AvailableSlots' },
          severity: 'error'
        });
      }

      // Validate Skills format
      if (worker.Skills && !this.isValidCommaSeparatedList(worker.Skills)) {
        errors.push({
          type: 'MALFORMED_LIST',
          message: `Invalid Skills format: ${worker.Skills}`,
          cellLocation: { row: index, column: 'Skills' },
          severity: 'error'
        });
      }
    });

    return errors;
  }

  // 4. Out-of-Range Values
  private validateOutOfRangeValues(): ValidationError[] {
    const errors: ValidationError[] = [];

    this.clients.forEach((client, index) => {
      if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
        errors.push({
          type: 'OUT_OF_RANGE',
          message: `PriorityLevel must be between 1-5, got: ${client.PriorityLevel}`,
          cellLocation: { row: index, column: 'PriorityLevel' },
          severity: 'error'
        });
      }
    });

    this.tasks.forEach((task, index) => {
      if (task.Duration < 1) {
        errors.push({
          type: 'OUT_OF_RANGE',
          message: `Duration must be ≥ 1, got: ${task.Duration}`,
          cellLocation: { row: index, column: 'Duration' },
          severity: 'error'
        });
      }
    });

    return errors;
  }

  // 5. Broken JSON
  private validateBrokenJSON(): ValidationError[] {
    const errors: ValidationError[] = [];

    this.clients.forEach((client, index) => {
      if (client.AttributesJSON && !this.isValidJSON(client.AttributesJSON)) {
        // Check if it's plain text (not JSON)
        if (!client.AttributesJSON.startsWith('{') && !client.AttributesJSON.startsWith('[')) {
          errors.push({
            type: 'PLAIN_TEXT_INSTEAD_OF_JSON',
            message: `AttributesJSON contains plain text instead of JSON: ${client.AttributesJSON}`,
            cellLocation: { row: index, column: 'AttributesJSON' },
            severity: 'warning'
          });
        } else {
          errors.push({
            type: 'BROKEN_JSON',
            message: `Invalid JSON in AttributesJSON: ${client.AttributesJSON}`,
            cellLocation: { row: index, column: 'AttributesJSON' },
            severity: 'error'
          });
        }
      }
    });

    return errors;
  }

  // 6. Unknown References
  private validateUnknownReferences(): ValidationError[] {
    const errors: ValidationError[] = [];
    const validTaskIDs = new Set(this.tasks.map(task => task.TaskID));

    this.clients.forEach((client, index) => {
      if (client.RequestedTaskIDs) {
        const taskIDs = client.RequestedTaskIDs.split(',').map(id => id.trim());
        taskIDs.forEach(taskID => {
          if (!validTaskIDs.has(taskID)) {
            errors.push({
              type: 'UNKNOWN_REFERENCE',
              message: `Unknown TaskID reference: ${taskID}`,
              cellLocation: { row: index, column: 'RequestedTaskIDs' },
              severity: 'error'
            });
          }
        });
      }
    });

    return errors;
  }

  // 7. Circular Dependencies (placeholder)
  private validateCircularDependencies(): ValidationError[] {
    // Implementation for detecting circular co-run groups
    return [];
  }

  // 8. Conflicting Rules (placeholder)
  private validateConflictingRules(): ValidationError[] {
    // Implementation for checking rule consistency
    return [];
  }

  // 9. Overloaded Workers
  private validateOverloadedWorkers(): ValidationError[] {
    const errors: ValidationError[] = [];

    this.workers.forEach((worker, index) => {
      try {
        const availableSlots = JSON.parse(worker.AvailableSlots);
        if (Array.isArray(availableSlots) && availableSlots.length > worker.MaxLoadPerPhase) {
          errors.push({
            type: 'OVERLOADED_WORKER',
            message: `Worker has more available slots (${availableSlots.length}) than MaxLoadPerPhase (${worker.MaxLoadPerPhase})`,
            cellLocation: { row: index, column: 'MaxLoadPerPhase' },
            severity: 'warning'
          });
        }
      } catch (e) {
        // JSON parsing error already handled in malformed lists validation
      }
    });

    return errors;
  }

  // 10. Phase-slot Saturation (placeholder)
  private validatePhaseSaturation(): ValidationError[] {
    // Implementation for task duration allocation feasibility
    return [];
  }

  // 11. Skill Coverage Matrix
  private validateSkillCoverage(): ValidationError[] {
    const errors: ValidationError[] = [];
    const workerSkills = new Set();
    
    this.workers.forEach(worker => {
      if (worker.Skills) {
        worker.Skills.split(',').forEach(skill => {
          workerSkills.add(skill.trim());
        });
      }
    });

    this.tasks.forEach((task, index) => {
      if (task.RequiredSkills) {
        const requiredSkills = task.RequiredSkills.split(',').map(skill => skill.trim());
        requiredSkills.forEach(skill => {
          if (!workerSkills.has(skill)) {
            errors.push({
              type: 'MISSING_SKILL_COVERAGE',
              message: `No worker has required skill: ${skill}`,
              cellLocation: { row: index, column: 'RequiredSkills' },
              severity: 'warning'
            });
          }
        });
      }
    });

    return errors;
  }

  // 12. Max-concurrency Feasibility (placeholder)
  private validateMaxConcurrencyFeasibility(): ValidationError[] {
    // Implementation for concurrent task limits validation
    return [];
  }

  // Helper methods
  private isValidCommaSeparatedList(value: string): boolean {
    return /^[^,]+(,[^,]+)*$/.test(value.trim());
  }

  private isValidJSONArray(value: string): boolean {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  }

  private isValidJSON(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }
}

