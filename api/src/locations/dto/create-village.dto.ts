import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export namespace CreateVillageDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUUID()
    @IsOptional()
    villageLeaderId?: string;

    @IsUUID()
    @IsNotEmpty()
    cellId: string;
  }
}
