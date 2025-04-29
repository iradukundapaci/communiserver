import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerificationService } from "./verification.service";
import { VerificationController } from "./verification.controller";
import { Verification } from "./entity/verification.entity";
import { SesService } from "src/notifications/ses.service";

@Module({
  imports: [TypeOrmModule.forFeature([Verification])],
  controllers: [VerificationController],
  providers: [VerificationService, SesService],
  exports: [VerificationService],
})
export class VerificationModule {}
