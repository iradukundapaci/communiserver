import { ApiTags } from "@nestjs/swagger";
import { Controller, Body } from "@nestjs/common";
import { VerificationService } from "./verification.service";
import {
  BadRequestResponse,
  ErrorResponses,
  NotFoundResponse,
  OkResponse,
  PostOperation,
  ApiRequestBody,
} from "src/__shared__/decorators";
import { SendVerificationDto } from "./dto/verification-code.dto";
import { GenericResponse } from "src/__shared__/dto/generic-response.dto";
import { RequestVerificationDto } from "./dto/request-verification-code.dto";

@ApiTags("verification")
@Controller("verification")
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @OkResponse()
  @PostOperation("/verify", "Validate verification code")
  @ApiRequestBody(SendVerificationDto.Input)
  @ErrorResponses(BadRequestResponse, NotFoundResponse)
  async validateCode(
    @Body() body: SendVerificationDto.Input,
  ): Promise<GenericResponse> {
    const { verificationCode } = body;

    await this.verificationService.validateVerification(verificationCode);
    return new GenericResponse("Your email has been successfully verified.");
  }

  @OkResponse()
  @PostOperation("", "Request verification code")
  @ApiRequestBody(RequestVerificationDto.Input)
  @ErrorResponses(BadRequestResponse, NotFoundResponse)
  async sendNewCode(@Body("email") email: string): Promise<GenericResponse> {
    await this.verificationService.sendNewVerificationCode(email);
    return new GenericResponse(
      "A verification code has been sent to your email address.",
    );
  }
}
