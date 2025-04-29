import { IsEmail, IsNotEmpty, IsString } from "class-validator";

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
    cellId: string;

    @IsString()
    @IsNotEmpty()
    villageId: string;
  }
}
