import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Citizen } from "../entities/citizen.entity";
import { Type } from "class-transformer";

export namespace UpdateHouseDto {
  export class Input {
    @IsString()
    @IsOptional()
    code?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Citizen)
    @IsOptional()
    members?: Citizen[];
  }
}
