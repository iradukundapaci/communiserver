import { forgotPasswordEmailTemplate } from "src/__shared__/templates/forgot-password.template";
import { verifyEmailTemplate } from "src/__shared__/templates/verify-email.template";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";
import { IJwtPayload } from "./interfaces/jwt.payload.interface";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SesService } from "src/notifications/ses.service";
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
import { Profile } from "src/users/entities/profile.entity";
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
    private readonly sesService: SesService,
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

        const cell = manager
          .getRepository("Cell")
          .findBy({
            Id: cellId,
          })
          .then((cell) => {
            if (!cell) {
              throw new NotFoundException("Cell not found");
            }
            return cell;
          });
        const village = manager
          .getRepository("Village")
          .findBy({
            Id: villageId,
          })
          .then((village) => {
            if (!village) {
              throw new NotFoundException("Village not found");
            }
            return village;
          });
        if (!cell || !village) {
          throw new NotFoundException("Cell or village not found");
        }
        const profile = plainToInstance(Profile, {
          names,
          isVillageLeader: false,
          isCellLeader: false,
          phone,
          cell,
          village,
        });
        user.profile = profile;

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

    if (!user.verifiedAt) {
      throw new ForbiddenException(
        "Account not verified, prease check your email to verify or request other verification email",
      );
    }

    if (!user.activated)
      throw new UnauthorizedException("Account not activated, contact support");

    const payload: IJwtPayload = {
      sub: user.email,
      id: user.id,
      role: user.role,
    };
    const accessToken = this.tokenService.generateJwtToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return new SignInDto.Output(accessToken, refreshToken);
  }

  async logout(userId: string): Promise<void> {
    const user = await this.usersService.findUserById(userId);

    if (!user) throw new UnauthorizedException();

    if (!user.refreshToken) throw new UnauthorizedException();

    await this.usersService.updateRefreshToken(userId, null);
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto.Input,
  ): Promise<void> {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findUserByEmail(email);

    if (!user) throw new NotFoundException("User not found");

    const resetToken = this.tokenService.generateEmailToken(email);
    const resetPasswordLink = `${this.configService.get("url").client}/reset-password?token=${resetToken}`;

    const forgotEmail = {
      to: [email],
      subject: "Reset password",
      text: "Reset password.",
      html: forgotPasswordEmailTemplate(user.profile.names, resetPasswordLink),
    };

    try {
      await this.sesService.sendEmail(forgotEmail);
    } catch {
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

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<User> {
    const user = await this.usersService.findUserById(userId);

    if (user.refreshToken !== refreshToken) throw new UnauthorizedException();

    return user;
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const verificationToken = this.tokenService.generateEmailToken(user.email);
    const verifyEmailLink = `${this.configService.get("url").client}/en/verify-email?token=${verificationToken}`;

    const verifyEmail = {
      to: [user.email],
      subject: "Verify email",
      from: this.configService.get("emails").from,
      text: "Verify email.",
      html: verifyEmailTemplate(user.profile.names, verifyEmailLink),
    };

    await this.sesService.sendEmail(verifyEmail);
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

    if (user.verifiedAt) {
      throw new BadRequestException("User already verified");
    }

    await this.usersService.verifyUser(user.id);
  }

  async refreshToken(user: User) {
    const authUser = await this.usersService.findUserById(user.id);

    if (!authUser) {
      throw new UnauthorizedException();
    }

    const payload: IJwtPayload = {
      sub: authUser.email,
      id: authUser.id,
      role: authUser.role,
    };

    const accessToken = this.tokenService.generateJwtToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(authUser.id);

    await this.usersService.updateRefreshToken(authUser.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async requestEmailVerification(emailDto: EmailDto.Input): Promise<void> {
    const user = await this.usersService.findUserByEmail(emailDto.email);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.verifiedAt) {
      throw new BadRequestException("User already verified");
    }
    await this.sendVerificationEmail(user);
  }
}
