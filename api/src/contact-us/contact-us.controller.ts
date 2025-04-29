import { Body, Controller } from "@nestjs/common";
import { ContactUsService } from "./contact-us.service";
import {
  ApiRequestBody,
  BadRequestResponse,
  CreatedResponse,
  ErrorResponses,
  NotFoundResponse,
  PostOperation,
} from "src/__shared__/decorators";
import { CreateContactDto } from "./dto/contact-us.dto";
import { GenericResponse } from "src/__shared__/dto/generic-response.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("contact us")
@Controller("contact-us")
export class ContactUsController {
  constructor(private readonly contactService: ContactUsService) {}
  @PostOperation("", "Send message in contact form")
  @ApiRequestBody(CreateContactDto.Input)
  @CreatedResponse()
  @ErrorResponses(NotFoundResponse, BadRequestResponse)
  async sendContactMessage(
    @Body() contactDto: CreateContactDto.Input,
  ): Promise<GenericResponse> {
    await this.contactService.sendContactMessage(contactDto);
    return new GenericResponse("Message successfully sent");
  }
}
