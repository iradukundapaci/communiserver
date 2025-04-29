import { Module } from "@nestjs/common";
import { AdminSeedService } from "./admin-seed.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Profile } from "src/users/entities/profile.entity";
import { Setting } from "src/settings/entities/setting.entity";
import { SettingsSeedService } from "./setting-seed.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Setting])],
  providers: [AdminSeedService, SettingsSeedService],
  exports: [AdminSeedService, SettingsSeedService],
})
export class SeedModule {}
