import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PasswordEncryption } from "src/auth/utils/password-encrytion.util";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";

@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    public configService: ConfigService<IAppConfig>,
  ) {}

  async run() {
    const backdoor = this.configService.get("backdoor");
    const email = backdoor?.username;
    const adminPassword = backdoor?.password;

    if (!email || !adminPassword) {
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
      const password = PasswordEncryption.hashPassword(adminPassword);
      const user = {
        email,
        names: "BACKDOOR ADMIN",
        password,
        role: UserRole.ADMIN,
        refreshToken: "",
        verifiedAt: new Date(),
        activated: true,
      };
      await this.userRepository.save(user);

      this.logger.log("Backdoor admin created successfully");
      return;
    }
    this.logger.log("Backdoor admin already exists");
  }
}
