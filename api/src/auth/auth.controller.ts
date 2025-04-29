import { GenericResponse } from "src/__shared__/dto/generic-response.dto";
import { Body, Controller } from "@nestjs/common";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { IsAuthorized, RefreshToken } from "./decorators/authorize.decorator";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { GetUser } from "./decorators/get-user.decorator";
import { User } from "src/users/entities/user.entity";
import { SignInDto } from "./dto/sign-in.dto";
import { SignupDto } from "./dto/sign-up.dto";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";
import {
  ApiRequestBody,
  BadRequestResponse,
  ConflictResponse,
  CreatedResponse,
  ErrorResponses,
  NotFoundResponse,
  OkResponse,
  PatchOperation,
  PostOperation,
  UnauthorizedResponse,
} from "../__shared__/decorators";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { EmailDto } from "./dto/email-dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PostOperation("/login", "Log in a user")
  @OkResponse(SignInDto.Output)
  @ApiRequestBody(SignInDto.Input)
  @ErrorResponses(NotFoundResponse, UnauthorizedResponse)
  async login(
    @Body() signInDTO: SignInDto.Input,
  ): Promise<GenericResponse<SignInDto.Output>> {
    const payload = await this.authService.signIn(signInDTO);
    return new GenericResponse("Logged in successfully", payload);
  }

  @PostOperation("/signup", "Sign up a new user")
  @CreatedResponse()
  @ApiRequestBody(SignupDto.Input)
  @ErrorResponses(ConflictResponse, BadRequestResponse)
  async SignUp(@Body() signUpDTO: SignupDto.Input): Promise<GenericResponse> {
    await this.authService.signup(signUpDTO);
    return new GenericResponse("User successfully registered");
  }

  @PatchOperation("/refresh-token", "Refresh token")
  @RefreshToken()
  @OkResponse(SignInDto.Output)
  @ErrorResponses(UnauthorizedResponse)
  async refreshToken(
    @GetUser() user: User,
  ): Promise<GenericResponse<SignInDto.Output>> {
    const tokens = await this.authService.refreshToken(user);
    return new GenericResponse("Token refreshed successfully", tokens);
  }

  @PostOperation("/logout", "Sign out a user")
  @IsAuthorized()
  @OkResponse()
  @ErrorResponses(UnauthorizedResponse)
  async logout(@GetUser("id") id: string): Promise<GenericResponse> {
    await this.authService.logout(id);
    return new GenericResponse("Logged out successfully");
  }

  @PostOperation("/forgot-password", "Forgot password")
  @OkResponse()
  @ApiRequestBody(ForgotPasswordDto.Input)
  @ErrorResponses(NotFoundResponse, BadRequestResponse)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto.Input,
  ): Promise<GenericResponse> {
    await this.authService.forgotPassword(forgotPasswordDto);
    return new GenericResponse("Reset email sent successfully");
  }

  @OkResponse()
  @PostOperation("/reset-password", "Reset password")
  @ApiRequestBody(ResetPasswordDto.Input)
  @ErrorResponses(NotFoundResponse, BadRequestResponse)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto.Input,
  ): Promise<GenericResponse> {
    await this.authService.resetPassword(resetPasswordDto);
    return new GenericResponse("Password reset successfully");
  }

  @OkResponse()
  @PatchOperation("/verify", "Verify email")
  @ErrorResponses(BadRequestResponse, NotFoundResponse)
  @ApiRequestBody(VerifyEmailDto.Input)
  async verify(
    @Body() verifyEmail: VerifyEmailDto.Input,
  ): Promise<GenericResponse> {
    await this.authService.verifyEmail(verifyEmail.token);
    return new GenericResponse("Email verified successfully");
  }

  @OkResponse()
  @PostOperation("/request-verify-email", "Request email verification")
  @ApiRequestBody(EmailDto.Input)
  @ErrorResponses(NotFoundResponse)
  async requestVerify(
    @Body() EmailDto: EmailDto.Input,
  ): Promise<GenericResponse> {
    await this.authService.requestEmailVerification(EmailDto);
    return new GenericResponse("Email verification requested successfully");
  }
}
