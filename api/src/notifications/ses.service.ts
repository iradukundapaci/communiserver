import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import * as sgMail from "@sendgrid/mail";
import { ISesMail } from "./interfaces/ses-mail.interface";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";

@Injectable()
export class SesService {
  constructor(private config: ConfigService<IAppConfig>) {
    sgMail.setApiKey(this.config.get("emails").sendGridApiKey);
  }

  /**
   * Sends an email using SendGrid
   * @param email ISesMail - The email to be sent
   * @returns Promise<void>
   */
  async sendEmail(email: ISesMail): Promise<void> {
    const msg: any = {
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      from: this.config.get("emails").from,
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
    };

    // Handle attachments if they exist
    if (email.attachments && email.attachments.length > 0) {
      msg.attachments = email.attachments.map((attachment: any) => {
        // Convert Buffer to base64 string for SendGrid
        const content = attachment.content instanceof Buffer
          ? attachment.content.toString('base64')
          : attachment.content;

        return {
          content,
          filename: attachment.filename,
          type: attachment.contentType || 'application/octet-stream',
          disposition: 'attachment',
        };
      });
    }

    await sgMail.send(msg);
  }
}
