import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class Citizen {
  @IsString()
  @IsNotEmpty()
  names: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
