import { UsersController } from "./users.controller";
import { Profile } from "./entities/profile.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { Module } from "@nestjs/common";
import { SesService } from "src/notifications/ses.service";
import { VerificationModule } from "src/verification/verification.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile]), VerificationModule],
  controllers: [UsersController],
  providers: [UsersService, SesService],
  exports: [UsersService],
})
export class UsersModule {}
