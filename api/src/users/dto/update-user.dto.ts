import { IsEmail, IsOptional, IsString } from "class-validator";

export namespace UpdateUserDto {
  export class Input {
    @IsString()
    @IsOptional()
    names?: string;

    @IsEmail({}, { message: "Invalid email address" })
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    isiboId?: string;

    @IsString()
    @IsOptional()
    houseId?: string;
  }
  export class Output {
    id: string;
    names: string;
    email: string;
    phoneNumber: string;
    isiboId: string;
    houseId: string;
    isVillageLeader: boolean;
    isCellLeader: boolean;
    isIsiboLeader: boolean;
  }
}
