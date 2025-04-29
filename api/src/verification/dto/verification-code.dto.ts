import { IsNotEmpty, Length } from "class-validator";

/**
 * DTO for resending the verification code.
 */
export namespace SendVerificationDto {
  export class Input {
    @IsNotEmpty()
    @Length(6, 6)
    verificationCode: string;
  }
}
