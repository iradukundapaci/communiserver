import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cell } from "src/locations/entities/cell.entity";
import { District } from "src/locations/entities/district.entity";
import { Province } from "src/locations/entities/province.entity";
import { Sector } from "src/locations/entities/sector.entity";
import { Village } from "src/locations/entities/village.entity";
import { Profile } from "src/users/entities/profile.entity";
import { User } from "src/users/entities/user.entity";
import { AdminSeedService } from "./admin-seed.service";
import { LocationSeedService } from "./location-seed.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      Province,
      District,
      Sector,
      Cell,
      Village,
    ]),
  ],
  providers: [AdminSeedService, LocationSeedService],
  exports: [AdminSeedService, LocationSeedService],
})
export class SeedModule {}
