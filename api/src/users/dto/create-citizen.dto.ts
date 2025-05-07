import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export namespace CreateCitizenDTO {
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
    @IsOptional()
    isiboId?: string;

    @IsUUID()
    @IsOptional()
    houseId?: string;
  }
}
