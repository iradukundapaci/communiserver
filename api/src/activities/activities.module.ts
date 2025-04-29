import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Activity } from "./entities/activity.entity";
import { Task } from "./entities/task.entity";
import { ActivitiesService } from "./activities.service";
import { ActivitiesController } from "./activities.controller";
import { UsersModule } from "../users/users.module";
import { LocationsModule } from "../locations/locations.module";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Task]),
    UsersModule,
    LocationsModule,
  ],
  controllers: [ActivitiesController, TasksController],
  providers: [ActivitiesService, TasksService],
  exports: [ActivitiesService, TasksService],
})
export class ActivitiesModule {}
