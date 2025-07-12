import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocationsModule } from "../locations/locations.module";
import { UsersModule } from "../users/users.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { ActivitiesController } from "./activities.controller";
import { ActivitiesService } from "./activities.service";
import { Activity } from "./entities/activity.entity";
import { Report } from "./entities/report.entity";
import { Task } from "./entities/task.entity";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { PdfReportService } from "./pdf-report.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Task, Report]),
    UsersModule,
    LocationsModule,
    NotificationsModule,
  ],
  controllers: [ActivitiesController, TasksController, ReportsController],
  providers: [ActivitiesService, TasksService, ReportsService, PdfReportService],
  exports: [ActivitiesService, TasksService],
})
export class ActivitiesModule {}
