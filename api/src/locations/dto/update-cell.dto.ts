import { IsString, IsUUID, IsOptional } from "class-validator";

export namespace UpdateCellDto {
  export class Input {
    @IsString()
    @IsOptional()
    cellName?: string;

    @IsUUID()
    @IsOptional()
    cellLeaderId?: string;

    @IsOptional()
    @IsString({ each: true })
    villageIds?: string[];
  }
}
