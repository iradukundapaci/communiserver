import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Citizen } from "../entities/citizen.entity";

export namespace UpdateIsiboDto {
  export class Input {
    @IsString()
    @IsOptional()
    name?: string;

    @IsUUID()
    @IsOptional()
    leaderId?: string;

    @IsUUID()
    @IsOptional()
    villageId?: string;

    @IsNotEmpty()
    members: Citizen[];
  }
}
