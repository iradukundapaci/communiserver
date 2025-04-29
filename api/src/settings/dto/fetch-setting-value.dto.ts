import { IsNotEmpty, IsString } from "class-validator";

export namespace FetchSettingValueDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    name: string;
  }

  export class Output {
    name: string;
    value: string;
  }
}
