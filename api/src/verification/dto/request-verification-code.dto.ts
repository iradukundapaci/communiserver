import { IsEmail } from "class-validator";

/**
 * DTO for resending the verification code.
 */
export namespace RequestVerificationDto {
  export class Input {
    @IsEmail()
    email: string;
  }
}
