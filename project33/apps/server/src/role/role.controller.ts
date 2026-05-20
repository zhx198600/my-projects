import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiResponse, Role } from '@project33/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findAll(): Promise<ApiResponse<Role[]>> {
    try {
      const data = await this.roleService.findAll();
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Role>> {
    try {
      const data = await this.roleService.findOne(id);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }
}
