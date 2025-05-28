import { UsersController } from "./users.controller";
import { Profile } from "./entities/profile.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { Module } from "@nestjs/common";
import { NotificationsModule } from "src/notifications/notifications.module";
import { VerificationModule } from "src/verification/verification.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile]), VerificationModule, NotificationsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
