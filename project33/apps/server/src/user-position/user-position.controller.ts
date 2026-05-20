import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { UserPositionService } from './user-position.service';
import { AssignUserPositionDto, UpdateUserSupervisorDto, ApiResponse, UserPosition, User } from '@project33/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-positions')
@UseGuards(JwtAuthGuard)
export class UserPositionController {
  constructor(private readonly userPositionService: UserPositionService) {}

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string): Promise<ApiResponse<UserPosition[]>> {
    try {
      const data = await this.userPositionService.findByUser(userId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Get('organization/:organizationId')
  async findByOrganization(@Param('organizationId') organizationId: string): Promise<ApiResponse<UserPosition[]>> {
    try {
      const data = await this.userPositionService.findByOrganization(organizationId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Get('users')
  async getUsersByOrgAndRole(
    @Query('organizationId') organizationId?: string,
    @Query('roleCode') roleCode?: string,
  ): Promise<ApiResponse<User[]>> {
    try {
      const data = await this.userPositionService.getUsersByOrgAndRole(organizationId, roleCode);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Post()
  async assign(@Body() data: AssignUserPositionDto): Promise<ApiResponse<UserPosition>> {
    try {
      const result = await this.userPositionService.assign(data);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Put('supervisor')
  async updateSupervisor(@Body() data: UpdateUserSupervisorDto): Promise<ApiResponse<User>> {
    try {
      const result = await this.userPositionService.updateSupervisor(data);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<UserPosition>> {
    try {
      const data = await this.userPositionService.remove(id);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }
}
