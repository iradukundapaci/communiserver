import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { Profile } from "src/users/entities/profile.entity";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";
import { PasswordEncryption } from "../utils/password-encrytion.util";

@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    public configService: ConfigService<IAppConfig>,
  ) {}

  async run() {
    const backdoor = this.configService.get("backdoor");
    const email = backdoor?.username;
    const password = backdoor?.password;

    if (!email || !password) {
      this.logger.warn(
        "Backdoor admin credentials not found in the environment variables",
      );
      return;
    }

    if (backdoor?.enabled === false) {
      this.logger.warn("Backdoor admin creation is disabled");
      return;
    }

    const adminExist = await this.userRepository.existsBy({ email });

    if (!adminExist) {
      const hashedPassword = PasswordEncryption.hashPassword(password);
      const user = new User(
        email,
        "BACKDOOR ADMIN",
        hashedPassword,
        UserRole.ADMIN,
      );
      user.verifiedAt = new Date();
      user.activated = true;
      const savedUser = await this.userRepository.save(user);

      const profile = new Profile(
        "BACKDOOR ADMIN",
        true,
        true,
        true,
        null,
        null,
        null,
      );
      profile.user = savedUser;
      await this.profileRepository.save(profile);

      this.logger.log("Backdoor admin created successfully");
      return;
    }
    this.logger.log("Backdoor admin already exists");
  }
}
