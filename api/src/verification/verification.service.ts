import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Verification } from "./entity/verification.entity";
import { ConfigService } from "@nestjs/config";
import { SesService } from "src/notifications/ses.service";
import { verificationCodeTemplate } from "src/__shared__/templates/verify-code.template";

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly configService: ConfigService,
    private readonly sesService: SesService,
  ) {}

  async createVerification(user: User): Promise<Verification> {
    const code = await this.generateUniqueCode();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const verification =
      (await this.verificationRepository.findOne({
        where: { user: { id: user.id } },
      })) ||
      this.verificationRepository.create({
        user: { id: user.id } as User,
      });

    verification.verificationCode = code;
    verification.expiresAt = expiresAt;

    return this.verificationRepository.save(verification);
  }

  async validateVerification(code: string): Promise<void> {
    const verification = await this.verificationRepository.findOne({
      where: { verificationCode: code },
      relations: ["user"],
    });

    if (!verification || verification.expiresAt < new Date()) {
      throw new BadRequestException(
        "Invalid or expired verification code. Please request a new one.",
      );
    }

    // Since we removed verifiedAt, we just remove the verification
    await this.verificationRepository.remove(verification);
  }

  async sendVerificationEmail(
    user: User,
    verificationCode: string,
  ): Promise<void> {
    const email = {
      to: [user.email],
      subject: "Your Verification Code",
      from: this.configService.get("emails").from,
      text: `Your verification code is: ${verificationCode}`,
      html: verificationCodeTemplate(user.names, verificationCode),
    };

    await this.sesService.sendEmail(email);
  }

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = Math.floor(100000 + Math.random() * 900000).toString();

      const exists = await this.verificationRepository.exist({
        where: { verificationCode: code },
      });

      isUnique = !exists;
    }

    return code;
  }

  async sendNewVerificationCode(email: string): Promise<void> {
    const user = await this.verificationRepository.manager
      .getRepository(User)
      .findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException("User with this email does not exist.");
    }

    const verification = await this.createVerification(user);
    await this.sendVerificationEmail(user, verification.verificationCode);
  }
}
