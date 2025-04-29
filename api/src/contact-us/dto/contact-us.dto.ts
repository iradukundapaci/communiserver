import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Subject } from "../enum/subject.enum";

export namespace CreateContactDto {
  export class Input {
    @IsString()
    @IsNotEmpty()
    names: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsNotEmpty()
    @IsEnum(Subject)
    subject: Subject;

    @IsString()
    @IsNotEmpty()
    message: string;
  }
}
