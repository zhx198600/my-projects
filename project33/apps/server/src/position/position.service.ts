import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto, UpdatePositionDto, Position } from '@project33/shared';

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId?: string): Promise<Position[]> {
    const where = organizationId ? { organizationId } : {};
    return this.prisma.position.findMany({
      where,
      include: { organization: true },
      orderBy: [{ level: 'asc' }, { sort: 'asc' }],
    }) as any;
  }

  async findOne(id: string): Promise<Position | null> {
    return this.prisma.position.findUnique({
      where: { id },
      include: { organization: true },
    }) as any;
  }

  async create(data: CreatePositionDto): Promise<Position> {
    return this.prisma.position.create({
      data,
      include: { organization: true },
    }) as any;
  }

  async update(id: string, data: UpdatePositionDto): Promise<Position> {
    return this.prisma.position.update({
      where: { id },
      data,
      include: { organization: true },
    }) as any;
  }

  async remove(id: string): Promise<Position> {
    return this.prisma.position.delete({
      where: { id },
      include: { organization: true },
    }) as any;
  }
}
