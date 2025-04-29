import { SesService } from "./ses.service";
import { Module } from "@nestjs/common";

@Module({
  providers: [SesService],
})
export class NotificationsModule {}
