import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Citizen)
    @IsOptional()
    newMembers?: Citizen[]; // New members to create

    @IsArray()
    @IsUUID("4", { each: true })
    @IsOptional()
    existingMemberIds?: string[]; // Existing member profile IDs to keep
  }
}
