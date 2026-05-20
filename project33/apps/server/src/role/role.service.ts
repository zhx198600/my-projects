import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@project33/shared';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    }) as any;
  }

  async findOne(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
    }) as any;
  }
}
