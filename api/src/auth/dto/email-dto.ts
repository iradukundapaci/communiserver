import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export namespace EmailDto {
  export class Input {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;
  }
}
