import { IsEmail, IsOptional, IsString } from "class-validator";

export namespace UpdateProfileDto {
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
  }
  export class Output {
    id: string;
    names: string;
    email: string;
    phoneNumber: string;
    isiboId: string;
    isVillageLeader: boolean;
    isCellLeader: boolean;
    isIsiboLeader: boolean;
  }
}
