import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Citizen } from "../entities/citizen.entity";

export namespace CreateIsiboDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUUID()
    @IsOptional()
    leaderId?: string;

    @IsUUID()
    @IsNotEmpty()
    villageId: string;

    @IsNotEmpty()
    members: Citizen[];
  }
}
