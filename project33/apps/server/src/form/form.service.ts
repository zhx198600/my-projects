import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDefinitionDto, UpdateFormDefinitionDto, FormDefinition, FormConfig } from '@project33/shared';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<FormDefinition[]> {
    const forms = await this.prisma.formDefinition.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    return forms.map((form) => ({
      ...form,
      config: JSON.parse(form.config) as FormConfig,
      status: form.status as any,
    })) as any;
  }

  async findOne(id: string): Promise<FormDefinition | null> {
    const form = await this.prisma.formDefinition.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (!form) return null;
    return {
      ...form,
      config: JSON.parse(form.config) as FormConfig,
      status: form.status as any,
    } as any;
  }

  async create(data: CreateFormDefinitionDto, userId?: string): Promise<FormDefinition> {
    const form = await this.prisma.formDefinition.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        config: JSON.stringify(data.config || { fields: [] }),
        createdById: userId,
        updatedById: userId,
      },
    });
    return {
      ...form,
      config: JSON.parse(form.config) as FormConfig,
      status: form.status as any,
    } as any;
  }

  async update(id: string, data: UpdateFormDefinitionDto, userId?: string): Promise<FormDefinition> {
    const updateData: any = {
      updatedById: userId,
    };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.config !== undefined) updateData.config = JSON.stringify(data.config);

    const form = await this.prisma.formDefinition.update({
      where: { id },
      data: updateData,
    });
    return {
      ...form,
      config: JSON.parse(form.config) as FormConfig,
      status: form.status as any,
    } as any;
  }

  async remove(id: string): Promise<FormDefinition> {
    const form = await this.prisma.formDefinition.delete({
      where: { id },
    });
    return {
      ...form,
      config: JSON.parse(form.config) as FormConfig,
      status: form.status as any,
    } as any;
  }
}
