import { Injectable } from '@nestjs/common';
import { WorkflowCondition, WorkflowOperator } from '@prisma/client';

@Injectable()
export class ConditionEvaluatorService {
  /**
   * Evaluates a set of workflow conditions against event payload data.
   */
  evaluateConditions(
    conditions: WorkflowCondition[],
    data: Record<string, any>,
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true; // No conditions means unconditionally true
    }

    const sortedConditions = [...conditions].sort((a, b) => a.order - b.order);
    let result = true;

    for (let i = 0; i < sortedConditions.length; i++) {
      const cond = sortedConditions[i];
      const match = this.evaluateSingleCondition(cond, data);

      if (i === 0) {
        result = match;
      } else {
        const logicalOp = (cond.logicalOperator || 'AND').toUpperCase();
        if (logicalOp === 'OR') {
          result = result || match;
        } else {
          result = result && match;
        }
      }
    }

    return result;
  }

  private evaluateSingleCondition(
    condition: WorkflowCondition,
    data: Record<string, any>,
  ): boolean {
    const valueInPayload = this.getValueFromPath(data, condition.field);
    const expectedValue = condition.value;

    switch (condition.operator) {
      case WorkflowOperator.EQUALS:
        return String(valueInPayload).toLowerCase() === String(expectedValue).toLowerCase();

      case WorkflowOperator.NOT_EQUALS:
        return String(valueInPayload).toLowerCase() !== String(expectedValue).toLowerCase();

      case WorkflowOperator.CONTAINS:
        if (valueInPayload === null || valueInPayload === undefined) return false;
        return String(valueInPayload).toLowerCase().includes(String(expectedValue).toLowerCase());

      case WorkflowOperator.NOT_CONTAINS:
        if (valueInPayload === null || valueInPayload === undefined) return true;
        return !String(valueInPayload).toLowerCase().includes(String(expectedValue).toLowerCase());

      case WorkflowOperator.GREATER_THAN:
        return Number(valueInPayload) > Number(expectedValue);

      case WorkflowOperator.LESS_THAN:
        return Number(valueInPayload) < Number(expectedValue);

      case WorkflowOperator.GREATER_OR_EQUAL:
        return Number(valueInPayload) >= Number(expectedValue);

      case WorkflowOperator.LESS_OR_EQUAL:
        return Number(valueInPayload) <= Number(expectedValue);

      case WorkflowOperator.EXISTS:
        return valueInPayload !== undefined && valueInPayload !== null && valueInPayload !== '';

      case WorkflowOperator.NOT_EXISTS:
        return valueInPayload === undefined || valueInPayload === null || valueInPayload === '';

      default:
        return true;
    }
  }

  private getValueFromPath(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    if (obj[path] !== undefined) return obj[path];

    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }
}
