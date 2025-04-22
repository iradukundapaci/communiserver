import { IsNotEmpty, IsString, IsUUID, IsOptional } from "class-validator";

export namespace VillageDto {
  export class Create {
    @IsString()
    @IsNotEmpty()
    villageName: string;

    @IsUUID()
    @IsNotEmpty()
    villageLeaderId: string;

    @IsUUID()
    @IsNotEmpty()
    cellId: string;
  }

  export class Update {
    @IsString()
    @IsOptional()
    villageName?: string;

    @IsUUID()
    @IsOptional()
    villageLeaderId?: string;

    @IsUUID()
    @IsOptional()
    cellId?: string;
  }
}
