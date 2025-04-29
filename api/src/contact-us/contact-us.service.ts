import { Injectable } from "@nestjs/common";
import { CreateContactDto } from "./dto/contact-us.dto";
import { SesService } from "src/notifications/ses.service";
import { contactFormTemplate } from "src/__shared__/templates/contact-template";
import { ConfigService } from "@nestjs/config";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";

@Injectable()
export class ContactUsService {
  constructor(
    private readonly sesService: SesService,
    private config: ConfigService<IAppConfig>,
  ) {}

  async sendContactMessage(
    createContactDto: CreateContactDto.Input,
  ): Promise<void> {
    const sendContact = {
      to: this.config.get("emails").to,
      subject: `New Contact from: ${createContactDto.names} related to ${createContactDto.subject}`,
      from: this.config.get("emails").from,
      text: "You have a new contact form submission: ",
      html: contactFormTemplate(
        createContactDto.subject,
        createContactDto.names,
        createContactDto.email,
        createContactDto.phone,
        createContactDto.message,
      ),
    };

    await this.sesService.sendEmail(sendContact);
  }
}
