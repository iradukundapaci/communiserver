import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export namespace PasswordDto {
  export class Input {
    @IsNotEmpty({ message: "Old password is required" })
    oldPassword: string;

    @IsString()
    @IsStrongPassword()
    newPassword: string;
  }
}
