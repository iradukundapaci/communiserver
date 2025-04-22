import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SignInDto } from "./dto/sign-in.dto";
import { SignupDto } from "./dto/sign-up.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { UsersService } from "../users/users.service";
import { compare, hash } from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDTO: SignInDto.Input): Promise<SignInDto.Output> {
    const user = await this.usersService.findByEmail(signInDTO.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await compare(signInDTO.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return new SignInDto.Output(accessToken);
  }

  async signup(signUpDTO: SignupDto.Input): Promise<void> {
    const hashedPassword = await hash(signUpDTO.password, 10);

    // Create user
    const user = await this.usersService.create({
      email: signUpDTO.email,
      password: hashedPassword,
      phoneNumber: signUpDTO.phoneNumber,
      role: signUpDTO.role,
    });

    // Create profile
    await this.usersService.createProfile({
      fullName: signUpDTO.fullName,
      user: user,
    });
  }

  async forgotPassword(
    forgotPasswordDTO: ForgotPasswordDto.Input,
  ): Promise<void> {
    const user = await this.usersService.findByEmail(forgotPasswordDTO.email);
    if (!user) {
      // Don't reveal if the email exists or not
      return;
    }

    // TODO: Implement password reset email sending
    // For now, we'll just log the request
    console.log(
      `Password reset requested for email: ${forgotPasswordDTO.email}`,
    );
  }
}
