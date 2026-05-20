import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { PositionService } from './position.service';
import { CreatePositionDto, UpdatePositionDto, ApiResponse, Position } from '@project33/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  async findAll(@Query('organizationId') organizationId?: string): Promise<ApiResponse<Position[]>> {
    try {
      const data = await this.positionService.findAll(organizationId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Position>> {
    try {
      const data = await this.positionService.findOne(id);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Post()
  async create(@Body() createPositionDto: CreatePositionDto): Promise<ApiResponse<Position>> {
    try {
      const data = await this.positionService.create(createPositionDto);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto): Promise<ApiResponse<Position>> {
    try {
      const data = await this.positionService.update(id, updatePositionDto);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<Position>> {
    try {
      const data = await this.positionService.remove(id);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }
}
