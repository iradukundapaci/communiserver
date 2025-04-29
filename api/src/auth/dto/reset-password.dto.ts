import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export namespace ResetPasswordDto {
  export class Input {
    @IsNotEmpty()
    @IsString()
    @IsStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    password: string;

    @IsNotEmpty()
    @IsString()
    token: string;
  }
}
