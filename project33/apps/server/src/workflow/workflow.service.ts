import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessEngineService } from './process-engine.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  SaveWorkflowDiagramDto,
  WorkflowValidationResult,
  WorkflowValidationIssue,
  StartProcessDto,
  ApproveTaskDto,
  ApprovalAction,
  ProcessInstanceStatus,
  NodeInstanceStatus,
  UpdateWorkflowFormDto,
  UpdateNodeFieldPermissionsDto,
  FieldPermissionType,
} from '@project33/shared';

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService,
    private processEngine: ProcessEngineService
  ) {}

  async createWorkflow(userId: string, dto: CreateWorkflowDto) {
    return this.prisma.workflowDefinition.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        formSchema: JSON.stringify(dto.formSchema || {}),
        createdById: userId,
      },
      include: {
        nodes: true,
        edges: true,
      },
    });
  }

  async getWorkflows(userId: string) {
    return this.prisma.workflowDefinition.findMany({
      where: { createdById: userId },
      include: {
        nodes: true,
        edges: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkflow(id: string) {
    return this.prisma.workflowDefinition.findUnique({
      where: { id },
      include: {
        nodes: {
          include: {
            conditions: true,
          },
        },
        edges: true,
      },
    });
  }

  async updateWorkflow(id: string, dto: UpdateWorkflowDto) {
    return this.prisma.workflowDefinition.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        formSchema: dto.formSchema ? JSON.stringify(dto.formSchema) : undefined,
        isPublished: dto.isPublished,
        version: dto.isPublished ? { increment: 1 } : undefined,
      },
      include: {
        nodes: true,
        edges: true,
      },
    });
  }

  async deleteWorkflow(id: string) {
    return this.prisma.workflowDefinition.delete({
      where: { id },
    });
  }

  async saveDiagram(workflowId: string, dto: SaveWorkflowDiagramDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.workflowNode.deleteMany({ where: { workflowId } });
      await tx.workflowEdge.deleteMany({ where: { workflowId } });

      for (const node of dto.nodes) {
        await tx.workflowNode.create({
          data: {
            id: node.id,
            workflowId,
            name: node.name,
            type: node.type,
            x: node.x,
            y: node.y,
            properties: JSON.stringify(node.properties || {}),
            positionId: node.positionId,
            assigneeId: node.assigneeId,
            conditions: node.conditions
              ? {
                  create: node.conditions.map((c) => ({
                    fieldName: c.fieldName,
                    operator: c.operator,
                    value: c.value,
                    logicalOperator: c.logicalOperator,
                    priority: c.priority,
                    groupId: c.groupId,
                  })),
                }
              : undefined,
          },
        });
      }

      for (const edge of dto.edges) {
        await tx.workflowEdge.create({
          data: {
            id: edge.id,
            workflowId,
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            conditionExpression: edge.conditionExpression,
            priority: edge.priority,
          },
        });
      }

      return this.prisma.workflowDefinition.findUnique({
        where: { id: workflowId },
        include: {
          nodes: { include: { conditions: true } },
          edges: true,
        },
      });
    });
  }

  async validateWorkflow(workflowId: string): Promise<WorkflowValidationResult> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new BadRequestException('Workflow not found');
    }

    const issues: WorkflowValidationIssue[] = [];

    const cycleIssues = this.detectCycles(workflow.nodes, workflow.edges);
    issues.push(...cycleIssues);

    const orphanIssues = this.detectOrphanNodes(workflow.nodes, workflow.edges);
    issues.push(...orphanIssues);

    const serialIssues = this.validateSerialConnections(workflow.nodes, workflow.edges);
    issues.push(...serialIssues);

    const basicIssues = this.validateBasicStructure(workflow.nodes);
    issues.push(...basicIssues);

    return {
      valid: issues.every((i) => i.type !== 'error'),
      issues,
    };
  }

  private validateBasicStructure(nodes: any[]): WorkflowValidationIssue[] {
    const issues: WorkflowValidationIssue[] = [];

    const startNodes = nodes.filter((n) => n.type === 'START');
    const endNodes = nodes.filter((n) => n.type === 'END');

    if (startNodes.length === 0) {
      issues.push({
        type: 'error',
        code: 'NO_START_NODE',
        message: '流程缺少开始节点',
      });
    } else if (startNodes.length > 1) {
      issues.push({
        type: 'error',
        code: 'MULTIPLE_START_NODES',
        message: '流程只能有一个开始节点',
        nodeIds: startNodes.map((n) => n.id),
      });
    }

    if (endNodes.length === 0) {
      issues.push({
        type: 'warning',
        code: 'NO_END_NODE',
        message: '流程缺少结束节点',
      });
    }

    return issues;
  }

  private detectCycles(nodes: any[], edges: any[]): WorkflowValidationIssue[] {
    const issues: WorkflowValidationIssue[] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const adjList = new Map<string, string[]>();
    nodes.forEach((n) => adjList.set(n.id, []));
    edges.forEach((e) => {
      const neighbors = adjList.get(e.sourceId);
      if (neighbors) neighbors.push(e.targetId);
    });

    const dfs = (nodeId: string, path: string[]): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor, path)) return true;
        } else if (recStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor);
          const cyclePath = [...path.slice(cycleStart), neighbor];
          issues.push({
            type: 'error',
            code: 'CYCLE_DETECTED',
            message: `检测到循环: ${cyclePath.join(' -> ')}`,
            nodeIds: cyclePath,
          });
          return true;
        }
      }

      recStack.delete(nodeId);
      path.pop();
      return false;
    };

    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    });

    return issues;
  }

  private detectOrphanNodes(nodes: any[], edges: any[]): WorkflowValidationIssue[] {
    const issues: WorkflowValidationIssue[] = [];
    const connectedNodeIds = new Set<string>();

    edges.forEach((e) => {
      connectedNodeIds.add(e.sourceId);
      connectedNodeIds.add(e.targetId);
    });

    const startNodeIds = new Set(
      nodes.filter((n) => n.type === 'START').map((n) => n.id)
    );

    const orphanNodes = nodes.filter(
      (n) => !connectedNodeIds.has(n.id) && !startNodeIds.has(n.id)
    );

    if (orphanNodes.length > 0) {
      issues.push({
        type: 'warning',
        code: 'ORPHAN_NODES',
        message: `发现 ${orphanNodes.length} 个孤立节点: ${orphanNodes.map((n) => n.name).join(', ')}`,
        nodeIds: orphanNodes.map((n) => n.id),
      });
    }

    return issues;
  }

  private validateSerialConnections(nodes: any[], edges: any[]): WorkflowValidationIssue[] {
    const issues: WorkflowValidationIssue[] = [];

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const outgoingEdges = new Map<string, any[]>();
    const incomingEdges = new Map<string, any[]>();

    nodes.forEach((n) => {
      outgoingEdges.set(n.id, []);
      incomingEdges.set(n.id, []);
    });

    edges.forEach((e) => {
      outgoingEdges.get(e.sourceId)?.push(e);
      incomingEdges.get(e.targetId)?.push(e);
    });

    nodes.forEach((node) => {
      const outEdges = outgoingEdges.get(node.id) || [];
      const inEdges = incomingEdges.get(node.id) || [];

      if (node.type === 'SERIAL') {
        if (inEdges.length > 1) {
          issues.push({
            type: 'error',
            code: 'SERIAL_MULTIPLE_INCOMING',
            message: `串行节点 "${node.name}" 只能有一个输入连接`,
            nodeIds: [node.id],
            edgeIds: inEdges.map((e) => e.id),
          });
        }

        if (outEdges.length > 1) {
          issues.push({
            type: 'error',
            code: 'SERIAL_MULTIPLE_OUTGOING',
            message: `串行节点 "${node.name}" 只能有一个输出连接`,
            nodeIds: [node.id],
            edgeIds: outEdges.map((e) => e.id),
          });
        }
      }

      if (node.type === 'CONDITION') {
        const sortedEdges = [...outEdges].sort((a, b) => b.priority - a.priority);
        const hasDefaultPath = sortedEdges.some((e) => !e.conditionExpression);
        if (!hasDefaultPath && outEdges.length > 0) {
          issues.push({
            type: 'warning',
            code: 'CONDITION_NO_DEFAULT',
            message: `条件分支节点 "${node.name}" 建议设置一个默认分支`,
            nodeIds: [node.id],
          });
        }

        const priorities = outEdges.map((e) => e.priority);
        const uniquePriorities = new Set(priorities);
        if (uniquePriorities.size !== priorities.length) {
          issues.push({
            type: 'warning',
            code: 'CONDITION_DUPLICATE_PRIORITY',
            message: `条件分支节点 "${node.name}" 存在重复的优先级设置`,
            nodeIds: [node.id],
          });
        }
      }

      if (node.type === 'START' && inEdges.length > 0) {
        issues.push({
          type: 'error',
          code: 'START_HAS_INCOMING',
          message: `开始节点 "${node.name}" 不能有输入连接`,
          nodeIds: [node.id],
          edgeIds: inEdges.map((e) => e.id),
        });
      }

      if (node.type === 'END' && outEdges.length > 0) {
        issues.push({
          type: 'error',
          code: 'END_HAS_OUTGOING',
          message: `结束节点 "${node.name}" 不能有输出连接`,
          nodeIds: [node.id],
          edgeIds: outEdges.map((e) => e.id),
        });
      }
    });

    return issues;
  }

  async startProcess(userId: string, dto: StartProcessDto) {
    const workflow = await this.getWorkflow(dto.workflowId);
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }
    if (!workflow.isPublished) {
      throw new BadRequestException('Workflow is not published');
    }

    return this.prisma.$transaction(async (tx) => {
      const processInstance = await tx.processInstance.create({
        data: {
          workflowId: dto.workflowId,
          title: dto.title,
          status: ProcessInstanceStatus.RUNNING,
          formData: JSON.stringify(dto.formData || {}),
          startedById: userId,
        },
      });

      const startNode = this.processEngine.findStartNode(workflow.nodes);
      if (!startNode) {
        throw new BadRequestException('Workflow has no start node');
      }

      const firstNodes = this.processEngine.findNextNodes(
        startNode.id,
        workflow.edges,
        workflow.nodes,
        dto.formData
      );

      let currentNodeId: string | undefined;

      for (const node of firstNodes) {
        const nodeInstance = await this.createNodeInstance(
          tx,
          processInstance.id,
          node,
          userId,
          dto.formData
        );
        currentNodeId = nodeInstance.id;
      }

      await tx.processInstance.update({
        where: { id: processInstance.id },
        data: { currentNodeId },
      });

      return this.getProcessInstance(processInstance.id);
    });
  }

  private async createNodeInstance(
    tx: any,
    processInstanceId: string,
    node: any,
    starterId: string,
    formData: Record<string, any>
  ) {
    const approvers = await this.processEngine.resolveApprovers(node, starterId);
    const assigneeId = approvers.length > 0 ? approvers[0].userId : node.assigneeId;

    return tx.processNodeInstance.create({
      data: {
        processInstanceId,
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        status: node.type === 'END' ? NodeInstanceStatus.COMPLETED : NodeInstanceStatus.RUNNING,
        assigneeId,
        properties: node.properties,
        startedAt: node.type !== 'END' ? new Date() : null,
        completedAt: node.type === 'END' ? new Date() : null,
      },
    });
  }

  async approveTask(
    userId: string,
    processInstanceId: string,
    nodeInstanceId: string,
    dto: ApproveTaskDto
  ) {
    const nodeInstance = await this.prisma.processNodeInstance.findUnique({
      where: { id: nodeInstanceId },
      include: { processInstance: true },
    });

    if (!nodeInstance) {
      throw new NotFoundException('Task not found');
    }
    if (nodeInstance.assigneeId !== userId) {
      throw new ForbiddenException('You are not the assignee of this task');
    }
    if (nodeInstance.status !== NodeInstanceStatus.RUNNING) {
      throw new BadRequestException('Task is not in running status');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.processApproval.create({
        data: {
          processInstanceId,
          nodeInstanceId,
          approverId: userId,
          action: dto.action,
          comment: dto.comment,
          approvedAt: new Date(),
        },
      });

      if (dto.action === ApprovalAction.REJECT) {
        await tx.processNodeInstance.update({
          where: { id: nodeInstanceId },
          data: {
            status: NodeInstanceStatus.REJECTED,
            completedAt: new Date(),
          },
        });

        await tx.processInstance.update({
          where: { id: processInstanceId },
          data: {
            status: ProcessInstanceStatus.REJECTED,
            completedAt: new Date(),
            currentNodeId: null,
          },
        });

        return this.getProcessInstance(processInstanceId);
      }

      if (dto.action === ApprovalAction.APPROVE) {
        await tx.processNodeInstance.update({
          where: { id: nodeInstanceId },
          data: {
            status: NodeInstanceStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        await this.autoMoveToNextNode(tx, processInstanceId, nodeInstance, userId);
      }

      return this.getProcessInstance(processInstanceId);
    });
  }

  private async autoMoveToNextNode(
    tx: any,
    processInstanceId: string,
    currentNodeInstance: any,
    userId: string
  ) {
    const processInstance = await tx.processInstance.findUnique({
      where: { id: processInstanceId },
      include: {
        workflow: {
          include: {
            nodes: { include: { conditions: true } },
            edges: true,
          },
        },
      },
    });

    const formData = JSON.parse(processInstance.formData || '{}');
    const nextNodes = this.processEngine.findNextNodes(
      currentNodeInstance.nodeId,
      processInstance.workflow.edges,
      processInstance.workflow.nodes,
      formData
    );

    if (nextNodes.length === 0 || nextNodes.some((n) => n.type === 'END')) {
      await tx.processInstance.update({
        where: { id: processInstanceId },
        data: {
          status: ProcessInstanceStatus.COMPLETED,
          completedAt: new Date(),
          currentNodeId: null,
        },
      });

      for (const node of nextNodes.filter((n) => n.type === 'END')) {
        await tx.processNodeInstance.create({
          data: {
            processInstanceId,
            nodeId: node.id,
            nodeName: node.name,
            nodeType: node.type,
            status: NodeInstanceStatus.COMPLETED,
            properties: node.properties,
            completedAt: new Date(),
          },
        });
      }
      return;
    }

    let currentNodeId: string | undefined;
    for (const node of nextNodes) {
      const nodeInstance = await this.createNodeInstance(
        tx,
        processInstanceId,
        node,
        userId,
        formData
      );
      currentNodeId = nodeInstance.id;
    }

    await tx.processInstance.update({
      where: { id: processInstanceId },
      data: { currentNodeId },
    });
  }

  async getProcessInstance(id: string) {
    return this.prisma.processInstance.findUnique({
      where: { id },
      include: {
        startedBy: {
          select: { id: true, name: true, email: true },
        },
        nodeInstances: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
            approvals: {
              include: {
                approver: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getMyProcesses(userId: string, status?: ProcessInstanceStatus) {
    return this.prisma.processInstance.findMany({
      where: {
        startedById: userId,
        status: status ? status : undefined,
      },
      include: {
        startedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyTasks(userId: string) {
    return this.prisma.processNodeInstance.findMany({
      where: {
        assigneeId: userId,
        status: NodeInstanceStatus.RUNNING,
      },
      include: {
        processInstance: {
          include: {
            startedBy: { select: { id: true, name: true, email: true } },
          },
        },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveNodeApprovers(nodeId: string, starterId: string) {
    const node = await this.prisma.workflowNode.findUnique({
      where: { id: nodeId },
    });
    if (!node) {
      throw new NotFoundException('Node not found');
    }
    return this.processEngine.resolveApprovers(node, starterId);
  }

  async bindWorkflowForm(workflowId: string, dto: UpdateWorkflowFormDto) {
    const workflow = await this.prisma.workflowDefinition.findUnique({
      where: { id: workflowId },
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    if (dto.formId) {
      const form = await this.prisma.formDefinition.findUnique({
        where: { id: dto.formId },
      });
      if (!form) {
        throw new NotFoundException('Form not found');
      }
    }

    return this.prisma.workflowDefinition.update({
      where: { id: workflowId },
      data: {
        formId: dto.formId || null,
      },
      include: {
        form: true,
        nodes: {
          include: {
            fieldPermissions: true,
          },
        },
        edges: true,
      },
    });
  }

  async getWorkflowWithForm(workflowId: string) {
    const workflow = await this.prisma.workflowDefinition.findUnique({
      where: { id: workflowId },
      include: {
        form: true,
        nodes: {
          include: {
            fieldPermissions: true,
            conditions: true,
          },
        },
        edges: true,
      },
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }
    return workflow;
  }

  async updateNodeFieldPermissions(workflowId: string, dto: UpdateNodeFieldPermissionsDto) {
    const node = await this.prisma.workflowNode.findUnique({
      where: { id: dto.nodeId },
      include: { workflow: true },
    });
    if (!node) {
      throw new NotFoundException('Node not found');
    }
    if (node.workflowId !== workflowId) {
      throw new BadRequestException('Node does not belong to this workflow');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const perm of dto.permissions) {
        await tx.nodeFieldPermission.upsert({
          where: {
            nodeId_fieldName: {
              nodeId: dto.nodeId,
              fieldName: perm.fieldName,
            },
          },
          update: {
            permission: perm.permission,
          },
          create: {
            nodeId: dto.nodeId,
            fieldName: perm.fieldName,
            permission: perm.permission,
          },
        });
      }

      return tx.workflowNode.findUnique({
        where: { id: dto.nodeId },
        include: {
          fieldPermissions: true,
        },
      });
    });
  }

  async getNodeFieldPermissions(nodeId: string) {
    const node = await this.prisma.workflowNode.findUnique({
      where: { id: nodeId },
      include: {
        fieldPermissions: true,
      },
    });
    if (!node) {
      throw new NotFoundException('Node not found');
    }
    return node.fieldPermissions;
  }
}
