import { SesService } from "./ses.service";
import { NotificationService } from "./notification.service";
import { EmailTemplatesService } from "./email-templates.service";
import { Module } from "@nestjs/common";

@Module({
  providers: [SesService, NotificationService, EmailTemplatesService],
  exports: [NotificationService, SesService],
})
export class NotificationsModule {}
