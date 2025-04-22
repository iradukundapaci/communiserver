import { IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export namespace UpdateUserDto {
  export class Input{
    @IsEmail()
    @IsOptional()
    email?: string;
  
    @IsPhoneNumber()
    @IsOptional()
    phoneNumber?: string;
  }
}
