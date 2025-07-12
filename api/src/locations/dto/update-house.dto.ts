import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsUUID,
} from "class-validator";
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
    @IsUUID("4", { each: true })
    @IsOptional()
    memberIds?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Citizen)
    @IsOptional()
    members?: Citizen[];
  }
}
