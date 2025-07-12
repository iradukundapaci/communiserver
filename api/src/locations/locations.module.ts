import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { CellsController } from "./cells.controller";
import { CellsService } from "./cells.service";
import { Cell } from "./entities/cell.entity";
import { District } from "./entities/district.entity";
import { House } from "./entities/house.entity";
import { Isibo } from "./entities/isibo.entity";
import { Province } from "./entities/province.entity";
import { Sector } from "./entities/sector.entity";
import { Village } from "./entities/village.entity";
import { HousesController } from "./houses.controller";
import { HousesService } from "./houses.service";
import { IsibosController } from "./isibos.controller";
import { IsibosService } from "./isibos.service";
import { VillagesController } from "./villages.controller";
import { VillagesService } from "./villages.service";
import { SearchLocationsController } from "./search-locations.controller";
import { SearchLocationsService } from "./search-locations.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Province,
      District,
      Sector,
      Cell,
      Village,
      Isibo,
      House,
    ]),
    UsersModule,
  ],
  controllers: [
    CellsController,
    VillagesController,
    IsibosController,
    HousesController,
    SearchLocationsController,
  ],
  providers: [CellsService, VillagesService, IsibosService, HousesService, SearchLocationsService],
  exports: [CellsService, VillagesService, IsibosService, HousesService, SearchLocationsService],
})
export class LocationsModule {}
