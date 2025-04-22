import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { User } from "../entities/user.entity";

export namespace CreateProfileDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    fullName: string;
  
    @IsString()
    @IsOptional()
    profileImage?: string;
  
    @IsNotEmpty()
    user: User;
  }
}
