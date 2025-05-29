import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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
    @IsUUID("4", { each: true })
    @IsOptional()
    memberIds?: string[];
  }
}
