import { UserRole } from "src/__shared__/enums/user-role.enum";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { FetchProfileDto } from "./dto/fetch-profile.dto";
import { plainToInstance } from "class-transformer";
import { Profile } from "./entities/profile.entity";
import { paginate } from "nestjs-typeorm-paginate";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Brackets, EntityManager, Not, Repository } from "typeorm";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { FetchUserDto } from "./dto/fetch-user.dto";
import { ConfigService } from "@nestjs/config";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";
import { SesService } from "src/notifications/ses.service";
import { managerRegistrationTemplate } from "src/__shared__/templates/manager-registration.template copy";
import { CreateCellLeaderDTO } from "./dto/create-cell-leader.dto";
import { PasswordEncryption } from "src/__shared__/utils/password-encrytion.util";
import { VerificationService } from "src/verification/verification.service";
import { CreateVillageLeaderDTO } from "./dto/create-village-leader.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    private readonly verificationService: VerificationService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService<IAppConfig>,
    private readonly sesService: SesService,
  ) {}

  private generateRandomPassword(): string {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  private async validateAndGetLocations(
    manager: EntityManager,
    cellId: string,
    villageId: string,
  ): Promise<{ cell: any; village: any }> {
    const cell = await manager.getRepository("Cell").findOneBy({ id: cellId });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    const village = await manager.getRepository("Village").findOne({
      where: { id: villageId },
      relations: ["profiles"],
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    // Check if village already has a leader
    const hasVillageLeader = village.profiles.some(
      (profile) => profile.isVillageLeader,
    );
    if (hasVillageLeader) {
      throw new ConflictException("Village already has a leader");
    }

    return { cell, village };
  }

  private async validateAndGetLocationsForCellLeader(
    manager: EntityManager,
    cellId: string,
    villageId: string,
  ): Promise<{ cell: any; village: any }> {
    const cell = await manager.getRepository("Cell").findOne({
      where: { id: cellId },
      relations: ["profiles"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    // Check if cell already has a leader
    const hasCellLeader = cell.profiles.some((profile) => profile.isCellLeader);
    if (hasCellLeader) {
      throw new ConflictException("Cell already has a leader");
    }

    const village = await manager
      .getRepository("Village")
      .findOneBy({ id: villageId });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    return { cell, village };
  }

  private async createLeaderUser(
    manager: EntityManager,
    dto: { email: string; phone: string; names: string },
    role: UserRole,
    cell: any,
    village: any,
    isVillageLeader: boolean,
    isCellLeader: boolean,
  ): Promise<User> {
    const password = this.generateRandomPassword();
    const hashedPassword = await PasswordEncryption.hashPassword(password);

    let user = plainToInstance(User, {
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
      role,
    });

    user.verifiedAt = new Date();
    const profile = plainToInstance(Profile, {
      names: dto.names,
      cell,
      village,
      isVillageLeader,
      isCellLeader,
      phone: dto.phone,
    });
    user.profile = profile;

    user = await manager.save(user);
    // await this.sendAccountCreationEmail(user, password);

    return user;
  }

  async createCellLeader(
    createCellLeaderDTO: CreateCellLeaderDTO.Input,
  ): Promise<void> {
    const { email, names, phone, cellId, villageId } = createCellLeaderDTO;

    const userExists = await this.findUserByEmail(email);
    if (userExists) {
      throw new ConflictException("User already exists");
    }

    try {
      await this.entityManager.transaction(async (manager: EntityManager) => {
        const { cell, village } =
          await this.validateAndGetLocationsForCellLeader(
            manager,
            cellId,
            villageId,
          );

        await this.createLeaderUser(
          manager,
          { email, phone, names },
          UserRole.CELL_LEADER,
          cell,
          village,
          false,
          true,
        );
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Cell leader registration failed: ${error.message}`,
      );
    }
  }

  async createVillageLeader(
    createVillageLeaderDTO: CreateVillageLeaderDTO.Input,
  ): Promise<void> {
    const { email, names, phone, cellId, villageId } = createVillageLeaderDTO;

    const userExists = await this.findUserByEmail(email);
    if (userExists) {
      throw new ConflictException("User already exists");
    }

    try {
      await this.entityManager.transaction(async (manager: EntityManager) => {
        const { cell, village } = await this.validateAndGetLocations(
          manager,
          cellId,
          villageId,
        );

        await this.createLeaderUser(
          manager,
          { email, phone, names },
          UserRole.VILLAGE_LEADER,
          cell,
          village,
          true,
          false,
        );
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Village leader registration failed: ${error.message}`,
      );
    }
  }

  // async sendAccountCreationEmail(user: User, password: string): Promise<void> {
  //   const loginLink = `${this.configService.get("url").client}/en/admin`;

  //   const registrationEmail = {
  //     to: [user.email],
  //     subject: "Welcome to Communiserve",
  //     from: this.configService.get("emails").from,
  //     text: "Welcome to communiserver",
  //     html: managerRegistrationTemplate(
  //       user.profile.names,
  //       password,
  //       loginLink,
  //     ),
  //   };

  //   await this.sesService.sendEmail(registrationEmail);
  // }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ["profile"],
    });
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ["profile"],
    });

    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async getProfile(userId: string) {
    const userProfile = await this.findUserById(userId);
    return plainToInstance(FetchProfileDto.Output, {
      id: userProfile.id,
      names: userProfile.profile.names,
      email: userProfile.email,
      activated: userProfile.activated,
      role: userProfile.role,
      phone: userProfile.phone,
      cell: userProfile.profile.cell,
      village: userProfile.profile.village,
      isVillageLeader: userProfile.profile.isVillageLeader,
      isCellLeader: userProfile.profile.isCellLeader,
    });
  }

  async updateProfile(
    userId: string,
    { names, email, phone }: UpdateProfileDto.Input,
  ): Promise<UpdateProfileDto.Output> {
    const user = await this.findUserById(userId);

    const isEmailChanged = email && email !== user.email;

    if (email) {
      const emailTaken = await this.usersRepository.exists({
        where: { email, id: Not(userId) },
      });

      if (emailTaken) {
        throw new ConflictException("Email already taken");
      }
    }

    user.profile.names = names ?? user.profile.names;
    user.phone = phone ?? user.phone;

    if (isEmailChanged) {
      user.email = email!;
      user.verifiedAt = null;
      await this.usersRepository.save(user);

      const verification =
        await this.verificationService.createVerification(user);
      const verifyEmailLink = `${verification.verificationCode}`;
      await this.verificationService.sendVerificationEmail(
        user,
        verifyEmailLink,
      );
    } else {
      await this.profilesRepository.save(user.profile);
      await this.usersRepository.save(user);
    }

    return {
      id: user.id,
      names: user.profile.names,
      email: user.email,
      phoneNumber: user.phone,
      isVillageLeader: user.profile.isVillageLeader,
      isCellLeader: user.profile.isCellLeader,
    };
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = PasswordEncryption.hashPassword(newPassword);

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.password = hashedPassword;
    await this.usersRepository.save(user);
  }

  async verifyUser(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      verifiedAt: new Date().toISOString(),
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken });
  }

  private async buildUserQueryBuilder(dto: any): Promise<any> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.profile", "profile")
      .orderBy("user.id", "DESC")
      .select([
        "user.id",
        "user.names",
        "user.email",
        "user.role",
        "user.activated",
        "profile.phone",
        "profile.address",
      ]);

    if (dto.role) {
      queryBuilder.andWhere("user.role = :role", { role: dto.role });
    }

    if (dto.q) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("user.names ILIKE :searchKey", {
            searchKey: `%${dto.q}%`,
          }).orWhere("user.email ILIKE :searchKey", {
            searchKey: `%${dto.q}%`,
          });
        }),
      );
    }

    const paginatedResult = await paginate<User>(queryBuilder, {
      page: dto.page,
      limit: dto.size,
    });

    return {
      ...paginatedResult,
      items: paginatedResult.items.map((user) =>
        plainToInstance(FetchUserDto.Output, user),
      ),
    };
  }
}
