import { IsEmail, IsNotEmpty } from "class-validator";

/** Forgot Password DTO */
export namespace ForgotPasswordDto {
  export class Input {
    @IsEmail()
    @IsNotEmpty()
    email: string;
  }
}
