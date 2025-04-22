import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export namespace SignInDto {
  export class Input {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
  }

  export class Output {
    accessToken: string;

    constructor(accessToken: string) {
      this.accessToken = accessToken;
    }
  }
}
