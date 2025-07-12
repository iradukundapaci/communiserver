import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export namespace CreateCellLeaderDTO {
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
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    password: string;

    @IsString()
    @IsNotEmpty()
    cellId: string;

    @IsString()
    @IsNotEmpty()
    villageId: string;
  }
}
