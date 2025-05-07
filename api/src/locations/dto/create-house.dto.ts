import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export namespace CreateHouseDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsOptional()
    street?: string;

    @IsUUID()
    @IsOptional()
    representativeId?: string;

    @IsUUID()
    @IsNotEmpty()
    isiboId: string;
  }
}
