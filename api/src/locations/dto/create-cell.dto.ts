import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export namespace CreateCellDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    cellName: string;

    @IsString()
    @IsOptional()
    cellLeaderId?: string;

    @IsOptional()
    villages?: string[];
  }
}
