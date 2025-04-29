import { IsEmail, IsNotEmpty } from "class-validator";

export namespace ForgotPasswordDto {
  export class Input {
    @IsNotEmpty()
    @IsEmail()
    email: string;
  }
}
