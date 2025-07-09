import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Citizen } from "../entities/citizen.entity";
import { Type } from "class-transformer";

export namespace CreateHouseDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsUUID()
    @IsNotEmpty()
    isiboId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Citizen)
    @IsOptional()
    members?: Citizen[];
  }
}
