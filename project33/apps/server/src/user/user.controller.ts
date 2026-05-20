import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, ApiResponse, User } from '@project33/shared';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<ApiResponse<User[]>> {
    try {
      const data = await this.userService.findAll();
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<User>> {
    try {
      const data = await this.userService.findOne(id);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    try {
      const data = await this.userService.create(createUserDto);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ApiResponse<User>> {
    try {
      const data = await this.userService.update(id, updateUserDto);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<User>> {
    try {
      const data = await this.userService.remove(id);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }
}
