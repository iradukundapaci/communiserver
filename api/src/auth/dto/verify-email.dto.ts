import { IsNotEmpty, IsString } from "class-validator";

export namespace VerifyEmailDto {
  export class Input {
    @IsNotEmpty()
    @IsString()
    token: string;
  }
}
