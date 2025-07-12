import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Activity } from "../activities/entities/activity.entity";
import { Task } from "../activities/entities/task.entity";
import { Report } from "../activities/entities/report.entity";
import { User } from "../users/entities/user.entity";
import { Village } from "../locations/entities/village.entity";
import { Cell } from "../locations/entities/cell.entity";
import { House } from "../locations/entities/house.entity";
import { Isibo } from "../locations/entities/isibo.entity";
import { GlobalSearchService } from "./services/global-search.service";
import { GlobalSearchController } from "./controllers/global-search.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      Task,
      Report,
      User,
      Village,
      Cell,
      House,
      Isibo,
    ]),
  ],
  controllers: [GlobalSearchController],
  providers: [GlobalSearchService],
  exports: [GlobalSearchService],
})
export class SharedModule {}
