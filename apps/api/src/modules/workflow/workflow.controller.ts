import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkflowService } from './workflow.service';
import {
  CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto,
  SearchWorkflowDto, SearchExecutionDto,
} from './dto/workflow.dto';

@ApiTags('workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  // ─── Workflow Definitions ────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new workflow definition' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  async create(@Body() dto: CreateWorkflowDto, @CurrentUser() user: any) {
    const workflow = await this.workflowService.create(
      dto,
      user.sub || user.id,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      user.organizationId,
    );
    return {
      success: true,
      data: workflow,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search workflow definitions' })
  @ApiResponse({ status: 200, description: 'Workflow search results' })
  async search(@Query() params: SearchWorkflowDto, @CurrentUser() user: any) {
    const results = await this.workflowService.searchWorkflows(params, user.organizationId);
    return {
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('executions')
  @ApiOperation({ summary: 'List workflow executions' })
  @ApiResponse({ status: 200, description: 'Execution list returned' })
  async listExecutions(@Query() params: SearchExecutionDto, @CurrentUser() user: any) {
    const results = await this.workflowService.listExecutions(params, user.organizationId);
    return {
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('executions/:executionId')
  @ApiOperation({ summary: 'Get workflow execution details' })
  @ApiParam({ name: 'executionId', description: 'Execution UUID' })
  @ApiResponse({ status: 200, description: 'Execution details returned' })
  async getExecution(@Param('executionId') executionId: string, @CurrentUser() user: any) {
    const execution = await this.workflowService.getExecution(executionId, user.organizationId);
    return {
      success: true,
      data: execution,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('executions/:executionId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a running workflow execution' })
  @ApiParam({ name: 'executionId', description: 'Execution UUID' })
  @ApiResponse({ status: 200, description: 'Execution cancelled' })
  async cancelExecution(@Param('executionId') executionId: string, @CurrentUser() user: any) {
    const execution = await this.workflowService.cancelExecution(executionId, user.organizationId);
    return {
      success: true,
      data: execution,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow definition by ID' })
  @ApiParam({ name: 'id', description: 'Workflow UUID' })
  @ApiResponse({ status: 200, description: 'Workflow found' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    const workflow = await this.workflowService.findById(id, user.organizationId);
    return {
      success: true,
      data: workflow,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workflow definition' })
  @ApiParam({ name: 'id', description: 'Workflow UUID' })
  @ApiResponse({ status: 200, description: 'Workflow updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
    @CurrentUser() user: any,
  ) {
    const workflow = await this.workflowService.update(
      id,
      dto,
      user.sub || user.id,
      user.organizationId,
    );
    return {
      success: true,
      data: workflow,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a workflow definition' })
  @ApiParam({ name: 'id', description: 'Workflow UUID' })
  @ApiResponse({ status: 200, description: 'Workflow activated' })
  async activate(@Param('id') id: string, @CurrentUser() user: any) {
    const workflow = await this.workflowService.activate(id, user.organizationId);
    return {
      success: true,
      data: workflow,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a workflow definition' })
  @ApiParam({ name: 'id', description: 'Workflow UUID' })
  @ApiResponse({ status: 200, description: 'Workflow deactivated' })
  async deactivate(@Param('id') id: string, @CurrentUser() user: any) {
    const workflow = await this.workflowService.deactivate(id, user.organizationId);
    return {
      success: true,
      data: workflow,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/execute')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Execute a workflow' })
  @ApiParam({ name: 'id', description: 'Workflow UUID' })
  @ApiResponse({ status: 201, description: 'Workflow execution started' })
  async execute(
    @Param('id') id: string,
    @Body() dto: ExecuteWorkflowDto,
    @CurrentUser() user: any,
  ) {
    const execution = await this.workflowService.execute(
      id,
      dto,
      user.sub || user.id,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      user.organizationId,
    );
    return {
      success: true,
      data: execution,
      timestamp: new Date().toISOString(),
    };
  }
}
