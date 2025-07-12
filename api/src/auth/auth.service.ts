import { forgotPasswordEmailTemplate } from "src/__shared__/templates/forgot-password.template";
import { verifyEmailTemplate } from "src/__shared__/templates/verify-email.template";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";
import { IJwtPayload } from "./interfaces/jwt.payload.interface";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { NotificationService } from "src/notifications/notification.service";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/entities/user.entity";
import { TokenService } from "./utils/jwt.util";
import { ConfigService } from "@nestjs/config";
import { SignupDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { EmailDto } from "./dto/email-dto";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { PasswordEncryption } from "src/__shared__/utils/password-encrytion.util";

@Injectable()
export class AuthService {
  private tokenService: TokenService;

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService<IAppConfig>,
    private readonly notificationService: NotificationService,
  ) {
    this.tokenService = new TokenService();
  }

  async signup(signUpDTO: SignupDto.Input): Promise<void> {
    const { email, names, phone, cellId, villageId, password } = signUpDTO;

    const userExists = await this.usersService.findUserByEmail(email);
    if (userExists) {
      throw new ConflictException("Email already taken");
    }
    const hashedPassword = PasswordEncryption.hashPassword(password);
    await this.entityManager.transaction(async (manager: EntityManager) => {
      try {
        let user = plainToInstance(User, {
          email,
          phone,
          names,
          password: hashedPassword,
          role: UserRole.CITIZEN,
        });

        const cell = await manager
          .getRepository("Cell")
          .findOneBy({ id: cellId });

        if (!cell) {
          throw new NotFoundException("Cell not found");
        }

        const village = await manager
          .getRepository("Village")
          .findOneBy({ id: villageId });

        if (!village) {
          throw new NotFoundException("Village not found");
        }

        user.cell = cell as any;
        user.village = village as any;

        user = await manager.save(user);

        await this.sendVerificationEmail(user);
      } catch {
        throw new BadRequestException("Signup request failed");
      }
    });
  }

  async signIn(signInDTO: SignInDto.Input): Promise<SignInDto.Output> {
    const { email, password } = signInDTO;
    const user = await this.usersService.findUserByEmail(email);

    if (!user || !PasswordEncryption.comparePassword(password, user.password))
      throw new UnauthorizedException("Invalid email or password");

    const payload: IJwtPayload = {
      sub: user.email,
      id: user.id,
      role: user.role,
    };
    const accessToken = this.tokenService.generateJwtToken(payload);

    return new SignInDto.Output(accessToken);
  }

  async logout(userId: string): Promise<void> {
    const user = await this.usersService.findUserById(userId);

    if (!user) throw new UnauthorizedException();
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto.Input,
  ): Promise<void> {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findUserByEmail(email);

    if (!user) throw new NotFoundException("User not found");

    const resetToken = this.tokenService.generateEmailToken(email);
    const frontendUrl =
      this.configService.get("url")?.client || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await this.notificationService.sendPasswordResetEmail({
        name: user.names,
        email: user.email,
        resetToken,
        resetUrl,
        expiresIn: "1 hour",
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new BadRequestException("Forgot password request failed");
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto.Input): Promise<void> {
    const { password, token } = resetPasswordDto;
    const { email } = this.tokenService.getTokenPayload<{ email: string }>(
      token,
    );

    if (!email) throw new BadRequestException("Invalid token");

    const user = await this.usersService.findUserByEmail(email);
    if (!user) throw new NotFoundException("User not found");

    await this.usersService.updatePassword(user.id, password);
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const verificationToken = this.tokenService.generateEmailToken(user.email);
    const verifyEmailLink = `${this.configService.get("url")?.client || "http://localhost:3000"}/en/verify-email?token=${verificationToken}`;

    await this.notificationService.sendEmailVerification(
      user.email,
      user.names,
      verifyEmailLink,
    );
  }

  async verifyEmail(token: string): Promise<void> {
    const { email } = this.tokenService.getTokenPayload<{ email: string }>(
      token,
    );
    if (!email) {
      throw new BadRequestException("Invalid token");
    }

    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Email verification is now handled differently since we removed verifiedAt
    // You might want to implement a different verification mechanism
  }

  async requestEmailVerification(emailDto: EmailDto.Input): Promise<void> {
    const user = await this.usersService.findUserByEmail(emailDto.email);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    await this.sendVerificationEmail(user);
  }
}
