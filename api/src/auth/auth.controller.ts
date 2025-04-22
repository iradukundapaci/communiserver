import { GenericResponse } from "src/__shared__/dto/generic-response.dto";
import { Body, Controller, HttpCode } from "@nestjs/common";
import { SignInDto } from "./dto/sign-in.dto";
import { SignupDto } from "./dto/sign-up.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ApiTags } from "@nestjs/swagger";
import {
  ApiRequestBody,
  BadRequestResponse,
  ConflictResponse,
  CreatedResponse,
  ErrorResponses,
  OkResponse,
  PostOperation,
} from "../__shared__/decorators";
import { AuthService } from "./auth.service";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PostOperation("/login", "Log in a user")
  @HttpCode(200)
  @OkResponse(SignInDto.Output)
  @ApiRequestBody(SignInDto.Input)
  @ErrorResponses(BadRequestResponse)
  async login(
    @Body() signInDTO: SignInDto.Input,
  ): Promise<GenericResponse<SignInDto.Output>> {
    const payload = await this.authService.signIn(signInDTO);
    return new GenericResponse("Logged in successfully", payload);
  }

  @PostOperation("/signup", "Sign up a new user")
  @CreatedResponse(SignInDto.Output)
  @ApiRequestBody(SignupDto.Input)
  @ErrorResponses(ConflictResponse, BadRequestResponse)
  async signUp(@Body() signUpDTO: SignupDto.Input): Promise<GenericResponse> {
    await this.authService.signup(signUpDTO);
    return new GenericResponse("User successfully registered");
  }

  @PostOperation("/forgot-password", "Request password reset")
  @HttpCode(200)
  @ApiRequestBody(ForgotPasswordDto.Input)
  @ErrorResponses(BadRequestResponse)
  async forgotPassword(
    @Body() forgotPasswordDTO: ForgotPasswordDto.Input,
  ): Promise<GenericResponse> {
    await this.authService.forgotPassword(forgotPasswordDTO);
    return new GenericResponse(
      "Password reset instructions sent to your email",
    );
  }
}
