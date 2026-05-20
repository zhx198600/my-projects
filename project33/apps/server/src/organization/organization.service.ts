import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto, Organization, OrganizationTree } from '@project33/shared';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Organization[]> {
    return this.prisma.organization.findMany({
      orderBy: [{ level: 'asc' }, { sort: 'asc' }],
    }) as any;
  }

  async findTree(): Promise<OrganizationTree[]> {
    const orgs = await this.prisma.organization.findMany({
      orderBy: [{ level: 'asc' }, { sort: 'asc' }],
    }) as any;

    const orgMap = new Map<string, OrganizationTree>();
    const roots: OrganizationTree[] = [];

    orgs.forEach((org: OrganizationTree) => {
      orgMap.set(org.id, { ...org, children: [] });
    });

    orgs.forEach((org) => {
      const node = orgMap.get(org.id)!;
      if (org.parentId && orgMap.has(org.parentId)) {
        orgMap.get(org.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async findOne(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        positions: true,
      },
    }) as any;
  }

  async create(data: CreateOrganizationDto): Promise<Organization> {
    let level = 1;
    if (data.parentId) {
      const parent = await this.prisma.organization.findUnique({
        where: { id: data.parentId },
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    return this.prisma.organization.create({
      data: {
        ...data,
        level,
      },
    }) as any;
  }

  async update(id: string, data: UpdateOrganizationDto): Promise<Organization> {
    if (data.parentId) {
      const parent = await this.prisma.organization.findUnique({
        where: { id: data.parentId },
      });
      if (parent) {
        (data as any).level = parent.level + 1;
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data,
    }) as any;
  }

  async remove(id: string): Promise<Organization> {
    const children = await this.prisma.organization.findMany({
      where: { parentId: id },
    });

    if (children.length > 0) {
      throw new Error('请先删除子部门');
    }

    return this.prisma.organization.delete({
      where: { id },
    }) as any;
  }
}
