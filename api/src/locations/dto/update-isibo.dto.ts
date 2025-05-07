import { IsOptional, IsString, IsUUID } from "class-validator";

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
  }
}
