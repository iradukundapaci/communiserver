import { IsNotEmpty, IsString } from "class-validator";

export namespace UpdateSettingValueDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    value: string;
  }
}
