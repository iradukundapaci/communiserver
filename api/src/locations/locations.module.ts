import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { CellsController } from "./cells.controller";
import { CellsService } from "./cells.service";
import { Cell } from "./entities/cell.entity";
import { District } from "./entities/district.entity";
import { Isibo } from "./entities/isibo.entity";
import { Province } from "./entities/province.entity";
import { Sector } from "./entities/sector.entity";
import { Village } from "./entities/village.entity";
import { IsibosController } from "./isibos.controller";
import { IsibosService } from "./isibos.service";
import { VillagesController } from "./villages.controller";
import { VillagesService } from "./villages.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Province,
      District,
      Sector,
      Cell,
      Village,
      Isibo,
    ]),
    UsersModule,
  ],
  controllers: [CellsController, VillagesController, IsibosController],
  providers: [CellsService, VillagesService, IsibosService],
  exports: [CellsService, VillagesService, IsibosService],
})
export class LocationsModule {}
