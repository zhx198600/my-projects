import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { PositionModule } from './position/position.module';
import { UserPositionModule } from './user-position/user-position.module';
import { RoleModule } from './role/role.module';
import { WorkflowModule } from './workflow/workflow.module';
import { FormModule } from './form/form.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, OrganizationModule, PositionModule, UserPositionModule, RoleModule, WorkflowModule, FormModule],
})
export class AppModule {}
