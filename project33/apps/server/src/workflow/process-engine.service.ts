import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApproverType,
  EvaluatedApprover,
} from '@project33/shared';

@Injectable()
export class ProcessEngineService {
  constructor(private prisma: PrismaService) {}

  async resolveApprovers(
    node: any,
    starterId: string
  ): Promise<EvaluatedApprover[]> {
    const properties = JSON.parse(node.properties || '{}');
    const approverConfigs = properties.approverConfigs || [];
    const results: EvaluatedApprover[] = [];

    for (const config of approverConfigs) {
      const resolved = await this.resolveApproverByType(config, starterId);
      results.push(...resolved);
    }

    if (results.length === 0 && node.assigneeId) {
      results.push({
        userId: node.assigneeId,
        sourceType: ApproverType.USER,
        sourceValue: node.assigneeId,
      });
    }

    return this.removeDuplicateApprovers(results);
  }

  private async resolveApproverByType(
    config: any,
    starterId: string
  ): Promise<EvaluatedApprover[]> {
    switch (config.type) {
      case ApproverType.USER:
        return config.value
          ? [{
              userId: config.value,
              sourceType: ApproverType.USER,
              sourceValue: config.value,
            }]
          : [];

      case ApproverType.ROLE:
        return this.resolveUsersByRole(config.value);

      case ApproverType.DEPARTMENT:
        return this.resolveUsersByDepartment(config.value);

      case ApproverType.POSITION:
        return this.resolveUsersByPosition(config.value);

      case ApproverType.DIRECT_SUPERVISOR:
        return this.resolveDirectSupervisor(starterId);

      default:
        return [];
    }
  }

  private async resolveUsersByRole(roleCode: string): Promise<EvaluatedApprover[]> {
    if (!roleCode) return [];
    
    const users = await this.prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              code: roleCode,
            },
          },
        },
      },
    });

    return users.map((user) => ({
      userId: user.id,
      userName: user.name || user.email,
      sourceType: ApproverType.ROLE,
      sourceValue: roleCode,
    }));
  }

  private async resolveUsersByDepartment(orgId: string): Promise<EvaluatedApprover[]> {
    if (!orgId) return [];

    const users = await this.prisma.user.findMany({
      where: {
        positions: {
          some: {
            organizationId: orgId,
          },
        },
      },
    });

    return users.map((user) => ({
      userId: user.id,
      userName: user.name || user.email,
      sourceType: ApproverType.DEPARTMENT,
      sourceValue: orgId,
    }));
  }

  private async resolveUsersByPosition(positionId: string): Promise<EvaluatedApprover[]> {
    if (!positionId) return [];

    const users = await this.prisma.user.findMany({
      where: {
        positions: {
          some: {
            positionId: positionId,
          },
        },
      },
    });

    return users.map((user) => ({
      userId: user.id,
      userName: user.name || user.email,
      sourceType: ApproverType.POSITION,
      sourceValue: positionId,
    }));
  }

  private async resolveDirectSupervisor(starterId: string): Promise<EvaluatedApprover[]> {
    const starter = await this.prisma.user.findUnique({
      where: { id: starterId },
      select: { supervisorId: true, supervisor: { select: { name: true, email: true } } },
    });

    if (!starter || !starter.supervisorId) return [];

    return [
      {
        userId: starter.supervisorId,
        userName: starter.supervisor?.name || starter.supervisor?.email,
        sourceType: ApproverType.DIRECT_SUPERVISOR,
      },
    ];
  }

  private removeDuplicateApprovers(approvers: EvaluatedApprover[]): EvaluatedApprover[] {
    const seen = new Set<string>();
    return approvers.filter((a) => {
      if (seen.has(a.userId)) return false;
      seen.add(a.userId);
      return true;
    });
  }

  findStartNode(nodes: any[]): any {
    return nodes.find((n) => n.type === 'START');
  }

  findNextNodes(
    currentNodeId: string,
    edges: any[],
    nodes: any[],
    formData: Record<string, any>
  ): any[] {
    const outgoingEdges = edges
      .filter((e) => e.sourceId === currentNodeId)
      .sort((a, b) => b.priority - a.priority);

    if (outgoingEdges.length === 0) return [];

    const currentNode = nodes.find((n) => n.id === currentNodeId);

    if (currentNode?.type === 'CONDITION') {
      return this.evaluateConditionBranch(outgoingEdges, nodes, formData);
    }

    if (currentNode?.type === 'SERIAL' || currentNode?.type === 'APPROVAL' || currentNode?.type === 'START') {
      const firstEdge = outgoingEdges[0];
      const nextNode = nodes.find((n) => n.id === firstEdge.targetId);
      return nextNode ? [nextNode] : [];
    }

    return outgoingEdges
      .map((e) => nodes.find((n) => n.id === e.targetId))
      .filter((n) => !!n);
  }

  private evaluateConditionBranch(
    edges: any[],
    nodes: any[],
    formData: Record<string, any>
  ): any[] {
    for (const edge of edges) {
      if (!edge.conditionExpression) {
        const defaultNode = nodes.find((n) => n.id === edge.targetId);
        return defaultNode ? [defaultNode] : [];
      }

      const conditionMet = this.evaluateConditionExpression(
        edge.conditionExpression,
        formData
      );

      if (conditionMet) {
        const targetNode = nodes.find((n) => n.id === edge.targetId);
        return targetNode ? [targetNode] : [];
      }
    }

    return [];
  }

  private evaluateConditionExpression(
    expression: string,
    formData: Record<string, any>
  ): boolean {
    try {
      const fn = new Function('formData', `return ${expression}`);
      return !!fn(formData);
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  evaluateNodeConditions(node: any, formData: Record<string, any>): boolean {
    const conditions = node.conditions || [];
    if (conditions.length === 0) return true;

    const groups: Record<string, boolean[]> = {};
    const ungrouped: boolean[] = [];

    for (const condition of conditions.sort((a: any, b: any) => a.priority - b.priority)) {
      const result = this.evaluateSingleCondition(condition, formData);
      if (condition.groupId) {
        if (!groups[condition.groupId]) groups[condition.groupId] = [];
        groups[condition.groupId].push(result);
      } else {
        ungrouped.push(result);
      }
    }

    const groupResults = Object.values(groups).map((groupResults) =>
      groupResults.every((r) => r)
    );

    const allResults = [...groupResults, ...ungrouped];
    return allResults.length > 0 ? allResults.every((r) => r) : true;
  }

  private evaluateSingleCondition(condition: any, formData: Record<string, any>): boolean {
    const value = formData[condition.fieldName];
    const compareValue = condition.value;

    switch (condition.operator) {
      case 'EQUALS':
        return value === compareValue;
      case 'NOT_EQUALS':
        return value !== compareValue;
      case 'GREATER_THAN':
        return Number(value) > Number(compareValue);
      case 'LESS_THAN':
        return Number(value) < Number(compareValue);
      case 'GREATER_THAN_OR_EQUALS':
        return Number(value) >= Number(compareValue);
      case 'LESS_THAN_OR_EQUALS':
        return Number(value) <= Number(compareValue);
      case 'CONTAINS':
        return String(value).includes(String(compareValue));
      case 'NOT_CONTAINS':
        return !String(value).includes(String(compareValue));
      case 'IS_EMPTY':
        return value === null || value === undefined || value === '';
      case 'IS_NOT_EMPTY':
        return value !== null && value !== undefined && value !== '';
      default:
        return true;
    }
  }
}
