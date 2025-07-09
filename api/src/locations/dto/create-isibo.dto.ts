import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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
  }
}
