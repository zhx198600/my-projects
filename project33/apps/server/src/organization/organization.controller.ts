import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto, ApiResponse, Organization, OrganizationTree } from '@project33/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  async findAll(): Promise<ApiResponse<Organization[]>> {
    try {
      const data = await this.organizationService.findAll();
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Get('tree')
  async findTree(): Promise<ApiResponse<OrganizationTree[]>> {
    try {
      const data = await this.organizationService.findTree();
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Organization>> {
    try {
      const data = await this.organizationService.findOne(id);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Post()
  async create(@Body() createOrganizationDto: CreateOrganizationDto): Promise<ApiResponse<Organization>> {
    try {
      const data = await this.organizationService.create(createOrganizationDto);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto): Promise<ApiResponse<Organization>> {
    try {
      const data = await this.organizationService.update(id, updateOrganizationDto);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<Organization>> {
    try {
      const data = await this.organizationService.remove(id);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }
}
