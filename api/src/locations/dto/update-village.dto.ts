import { IsString, IsUUID, IsOptional } from "class-validator";

export namespace UpdateVillageDto {
  export class Input {
    @IsString()
    @IsOptional()
    villageName: string;

    @IsUUID()
    @IsOptional()
    villageLeaderId?: string;

    @IsUUID()
    @IsOptional()
    cellId: string;
  }
}
