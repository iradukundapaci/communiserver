import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber } from "class-validator";
import { UserRole } from "src/__shared__/enums/user-role.enum";

export namespace CreateUserDto {
  export class Input{
    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    @IsString()
    @IsNotEmpty()
    password: string;
  
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;
  
    @IsString()
    @IsNotEmpty()
    role: UserRole;
  }
}
