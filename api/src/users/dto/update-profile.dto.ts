import { IsString, IsEmail, IsOptional } from "class-validator";

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
  }
  export class Output {
    id: string;
    names: string;
    email: string;
    phoneNumber: string;
    isVillageLeader: boolean;
    isCellLeader: boolean;
  }
}
