import { IsOptional, IsString, IsUUID } from "class-validator";

export namespace UpdateVillageDto {
  export class Input {
    @IsString()
    @IsOptional()
    name: string;

    @IsUUID()
    @IsOptional()
    villageLeaderId?: string;

    @IsUUID()
    @IsOptional()
    cellId: string;
  }
}
