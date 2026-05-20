import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDefinitionDto, UpdateFormDefinitionDto, ApiResponse, FormDefinition } from '@project33/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Get()
  async findAll(): Promise<ApiResponse<FormDefinition[]>> {
    try {
      const data = await this.formService.findAll();
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<FormDefinition>> {
    try {
      const data = await this.formService.findOne(id);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Post()
  async create(@Body() createFormDto: CreateFormDefinitionDto, @Request() req: any): Promise<ApiResponse<FormDefinition>> {
    try {
      const data = await this.formService.create(createFormDto, req.user?.userId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDefinitionDto, @Request() req: any): Promise<ApiResponse<FormDefinition>> {
    try {
      const data = await this.formService.update(id, updateFormDto, req.user?.userId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<FormDefinition>> {
    try {
      const data = await this.formService.remove(id);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }
}
