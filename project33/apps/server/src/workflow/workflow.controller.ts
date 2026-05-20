import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkflowService } from './workflow.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  SaveWorkflowDiagramDto,
  StartProcessDto,
  ApproveTaskDto,
  ProcessInstanceStatus,
  UpdateWorkflowFormDto,
  UpdateNodeFieldPermissionsDto,
} from '@project33/shared';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  async createWorkflow(@Request() req: any, @Body() dto: CreateWorkflowDto) {
    const workflow = await this.workflowService.createWorkflow(req.user.id, dto);
    return {
      success: true,
      data: workflow,
      error: null,
    };
  }

  @Get()
  async getWorkflows(@Request() req: any) {
    const workflows = await this.workflowService.getWorkflows(req.user.id);
    return {
      success: true,
      data: workflows,
      error: null,
    };
  }

  @Get(':id')
  async getWorkflow(@Param('id') id: string) {
    const workflow = await this.workflowService.getWorkflow(id);
    return {
      success: true,
      data: workflow,
      error: null,
    };
  }

  @Put(':id')
  async updateWorkflow(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    const workflow = await this.workflowService.updateWorkflow(id, dto);
    return {
      success: true,
      data: workflow,
      error: null,
    };
  }

  @Delete(':id')
  async deleteWorkflow(@Param('id') id: string) {
    await this.workflowService.deleteWorkflow(id);
    return {
      success: true,
      data: null,
      error: null,
    };
  }

  @Post(':id/diagram')
  async saveDiagram(
    @Param('id') workflowId: string,
    @Body() dto: SaveWorkflowDiagramDto
  ) {
    const workflow = await this.workflowService.saveDiagram(workflowId, dto);
    return {
      success: true,
      data: workflow,
      error: null,
    };
  }

  @Get(':id/validate')
  async validateWorkflow(@Param('id') workflowId: string) {
    const result = await this.workflowService.validateWorkflow(workflowId);
    return {
      success: true,
      data: result,
      error: null,
    };
  }

  @Post('process/start')
  async startProcess(@Request() req: any, @Body() dto: StartProcessDto) {
    const processInstance = await this.workflowService.startProcess(req.user.id, dto);
    return {
      success: true,
      data: processInstance,
      error: null,
    };
  }

  @Post('process/:processInstanceId/tasks/:nodeInstanceId/approve')
  async approveTask(
    @Request() req: any,
    @Param('processInstanceId') processInstanceId: string,
    @Param('nodeInstanceId') nodeInstanceId: string,
    @Body() dto: ApproveTaskDto
  ) {
    const result = await this.workflowService.approveTask(
      req.user.id,
      processInstanceId,
      nodeInstanceId,
      dto
    );
    return {
      success: true,
      data: result,
      error: null,
    };
  }

  @Get('tasks/my')
  async getMyTasks(@Request() req: any) {
    const tasks = await this.workflowService.getMyTasks(req.user.id);
    return {
      success: true,
      data: tasks,
      error: null,
    };
  }

  @Get('process/my')
  async getMyProcesses(
    @Request() req: any,
    @Query('status') status?: ProcessInstanceStatus
  ) {
    const processes = await this.workflowService.getMyProcesses(req.user.id, status);
    return {
      success: true,
      data: processes,
      error: null,
    };
  }

  @Get('process/:id')
  async getProcessInstance(@Param('id') processInstanceId: string) {
    const detail = await this.workflowService.getProcessInstance(processInstanceId);
    return {
      success: true,
      data: detail,
      error: null,
    };
  }

  @Get('nodes/:nodeId/approvers')
  async resolveNodeApprovers(
    @Param('nodeId') nodeId: string,
    @Request() req: any
  ) {
    const approvers = await this.workflowService.resolveNodeApprovers(
      nodeId,
      req.user.id
    );
    return {
      success: true,
      data: approvers,
      error: null,
    };
  }

  @Post(':id/form')
  async bindWorkflowForm(@Param('id') workflowId: string, @Body() dto: UpdateWorkflowFormDto) {
    const workflow = await this.workflowService.bindWorkflowForm(workflowId, dto);
    return {
      success: true,
      data: workflow,
      error: null,
    };
  }

  @Get(':id/form')
  async getWorkflowWithForm(@Param('id') workflowId: string) {
    const workflow = await this.workflowService.getWorkflowWithForm(workflowId);
    return {
      success: true,
      data: workflow,
      error: null,
    };
  }

  @Post(':id/field-permissions')
  async updateNodeFieldPermissions(
    @Param('id') workflowId: string,
    @Body() dto: UpdateNodeFieldPermissionsDto
  ) {
    const node = await this.workflowService.updateNodeFieldPermissions(workflowId, dto);
    return {
      success: true,
      data: node,
      error: null,
    };
  }

  @Get('nodes/:nodeId/field-permissions')
  async getNodeFieldPermissions(@Param('nodeId') nodeId: string) {
    const permissions = await this.workflowService.getNodeFieldPermissions(nodeId);
    return {
      success: true,
      data: permissions,
      error: null,
    };
  }
}
