import { IsOptional, IsString, IsUUID } from "class-validator";

export namespace UpdateHouseDto {
  export class Input {
    @IsString()
    @IsOptional()
    code?: string;

    @IsString()
    @IsOptional()
    street?: string;

    @IsUUID()
    @IsOptional()
    representativeId?: string;

    @IsUUID()
    @IsOptional()
    isiboId?: string;
  }
}
