import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Task } from '../activities/entities/task.entity';
import { Report } from '../activities/entities/report.entity';
import { Village } from '../locations/entities/village.entity';
import { Cell } from '../locations/entities/cell.entity';
import { Isibo } from '../locations/entities/isibo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      Activity,
      Task,
      Report,
      Village,
      Cell,
      Isibo,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
