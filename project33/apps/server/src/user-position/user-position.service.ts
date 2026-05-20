import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignUserPositionDto, UserPosition, User, UpdateUserSupervisorDto } from '@project33/shared';

@Injectable()
export class UserPositionService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string): Promise<UserPosition[]> {
    return this.prisma.userPosition.findMany({
      where: { userId },
      include: {
        organization: true,
        position: true,
      },
    }) as any;
  }

  async findByOrganization(organizationId: string): Promise<UserPosition[]> {
    return this.prisma.userPosition.findMany({
      where: { organizationId },
      include: {
        user: true,
        position: true,
      },
    }) as any;
  }

  async assign(data: AssignUserPositionDto): Promise<UserPosition> {
    if (data.isPrimary) {
      await this.prisma.userPosition.updateMany({
        where: {
          userId: data.userId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    return this.prisma.userPosition.upsert({
      where: {
        userId_organizationId_positionId: {
          userId: data.userId,
          organizationId: data.organizationId,
          positionId: data.positionId || '',
        },
      },
      update: {
        isPrimary: data.isPrimary,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      create: data,
      include: {
        organization: true,
        position: true,
      },
    }) as any;
  }

  async remove(id: string): Promise<UserPosition> {
    return this.prisma.userPosition.delete({
      where: { id },
      include: {
        organization: true,
        position: true,
      },
    }) as any;
  }

  async updateSupervisor(data: UpdateUserSupervisorDto): Promise<User> {
    if (data.userId === data.supervisorId) {
      throw new Error('不能将自己设置为上级');
    }

    return this.prisma.user.update({
      where: { id: data.userId },
      data: { supervisorId: data.supervisorId },
      include: {
        supervisor: true,
        subordinates: true,
      },
    }) as any;
  }

  async getUsersByOrgAndRole(organizationId?: string, roleCode?: string): Promise<User[]> {
    const where: any = {};

    if (organizationId) {
      where.positions = {
        some: { organizationId },
      };
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        userRoles: { include: { role: true } },
        positions: {
          include: { organization: true, position: true },
        },
        supervisor: true,
      },
    });

    if (roleCode) {
      return users.filter((user: any) =>
        user.userRoles?.some((ur: any) => ur.role.code === roleCode)
      ) as any;
    }

    return users as any;
  }
}
