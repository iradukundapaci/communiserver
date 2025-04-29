import { IsNotEmpty, IsString, IsUUID, IsOptional } from "class-validator";

export namespace CreateVillageDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    villageName: string;

    @IsUUID()
    @IsOptional()
    villageLeaderId?: string;

    @IsUUID()
    @IsNotEmpty()
    cellId: string;
  }
}
