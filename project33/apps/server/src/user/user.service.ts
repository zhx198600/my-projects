import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, User, RoleCode } from '@project33/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        userRoles: {
          include: { role: true },
        },
        positions: {
          include: {
            organization: true,
            position: true,
          },
        },
      },
    }) as any;
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: { role: true },
        },
        positions: {
          include: {
            organization: true,
            position: true,
          },
        },
        supervisor: true,
        subordinates: true,
      },
    }) as any;
  }

  async create(data: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const roleData = data.roleCode
      ? {
          userRoles: {
            create: {
              role: {
                connect: { code: data.roleCode },
              },
            },
          },
        }
      : {};

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name || null,
        password: hashedPassword,
        ...roleData,
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    }) as any;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    }) as any;
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    }) as any;
  }

  async assignRole(userId: string, roleCode: RoleCode) {
    const role = await this.prisma.role.findUnique({
      where: { code: roleCode },
    });

    if (!role) {
      throw new Error('角色不存在');
    }

    return this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId,
        roleId: role.id,
      },
      include: { role: true },
    });
  }
}
