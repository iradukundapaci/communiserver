import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export namespace CreateIsiboLeaderDTO {
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

    @IsUUID()
    @IsNotEmpty()
    cellId: string;

    @IsUUID()
    @IsNotEmpty()
    villageId: string;

    @IsUUID()
    @IsNotEmpty()
    isiboId: string;
  }
}
