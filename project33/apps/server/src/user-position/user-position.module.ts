import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserPositionService } from './user-position.service';
import { UserPositionController } from './user-position.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserPositionController],
  providers: [UserPositionService],
  exports: [UserPositionService],
})
export class UserPositionModule {}
