import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from "class-validator";

export namespace SignupDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    names: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    cellId: string;

    @IsString()
    @IsNotEmpty()
    villageId: string;

    @IsStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    password: string;
  }
}
