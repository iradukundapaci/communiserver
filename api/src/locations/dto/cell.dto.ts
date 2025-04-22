import { IsNotEmpty, IsString, IsUUID, IsOptional } from "class-validator";

export namespace CellDto {
  export class Create {
    @IsString()
    @IsNotEmpty()
    cellName: string;

    @IsUUID()
    @IsNotEmpty()
    cellLeaderId: string;
  }

  export class Update {
    @IsString()
    @IsOptional()
    cellName?: string;

    @IsUUID()
    @IsOptional()
    cellLeaderId?: string;
  }
}
