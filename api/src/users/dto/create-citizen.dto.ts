import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";

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

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    password: string;

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
