import { IsOptional, IsString, IsUUID } from "class-validator";

export namespace UpdateCellDto {
  export class Input {
    @IsString()
    @IsOptional()
    cellName?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsUUID()
    @IsOptional()
    cellLeaderId?: string;

    @IsOptional()
    @IsString({ each: true })
    villageIds?: string[];
  }
}
