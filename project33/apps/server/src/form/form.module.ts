import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FormService } from './form.service';
import { FormController } from './form.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FormController],
  providers: [FormService],
  exports: [FormService],
})
export class FormModule {}
