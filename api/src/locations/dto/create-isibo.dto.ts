import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Citizen)
    @IsOptional()
    members?: Citizen[];
  }
}
