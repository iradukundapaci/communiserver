import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsStrongPassword,
} from "class-validator";
import { UserRole } from "src/__shared__/enums/user-role.enum";

export namespace SignupDto {
  export class Input {
    @IsEmail()
    email: string;

    @IsStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    password: string;

    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    role: UserRole;

    @IsString()
    @IsNotEmpty()
    fullName: string;
  }
}
