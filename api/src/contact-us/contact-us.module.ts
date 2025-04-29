import { Module } from "@nestjs/common";
import { ContactUsController } from "./contact-us.controller";
import { ContactUsService } from "./contact-us.service";
import { SesService } from "src/notifications/ses.service";
import { NotificationsModule } from "src/notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [ContactUsController],
  providers: [ContactUsService, SesService],
})
export class ContactUsModule {}
