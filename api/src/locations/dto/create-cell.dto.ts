import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export namespace CreateCellDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    villages?: string[];
  }
}
