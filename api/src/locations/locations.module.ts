import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cell } from "./entities/cell.entity";
import { Village } from "./entities/village.entity";
import { LocationsService } from "./locations.service";
import { LocationsController } from "./locations.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Cell, Village])],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
