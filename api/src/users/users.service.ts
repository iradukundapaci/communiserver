import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";
import { PasswordEncryption } from "src/__shared__/utils/password-encrytion.util";
import { SesService } from "src/notifications/ses.service";
import { VerificationService } from "src/verification/verification.service";
import { EntityManager, Not, Repository } from "typeorm";
import { CreateCellLeaderDTO } from "./dto/create-cell-leader.dto";
import { CreateCitizenDTO } from "./dto/create-citizen.dto";
import { CreateIsiboLeaderDTO } from "./dto/create-isibo-leader.dto";
import { CreateVillageLeaderDTO } from "./dto/create-village-leader.dto";
import { FetchProfileDto } from "./dto/fetch-profile.dto";
import { FetchUserDto } from "./dto/fetch-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { Profile } from "./entities/profile.entity";
import { User } from "./entities/user.entity";

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

  private async validateAndGetLocationsForIsiboLeader(
    manager: EntityManager,
    cellId: string,
    villageId: string,
    isiboId: string,
  ): Promise<{ cell: any; village: any; isibo: any }> {
    const cell = await manager.getRepository("Cell").findOneBy({ id: cellId });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    const village = await manager
      .getRepository("Village")
      .findOneBy({ id: villageId });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    const isibo = await manager.getRepository("Isibo").findOne({
      where: { id: isiboId },
      relations: ["leader"],
    });

    if (!isibo) {
      throw new NotFoundException("Isibo not found");
    }

    // Check if isibo already has a leader
    if (isibo.leader) {
      throw new ConflictException("Isibo already has a leader");
    }

    return { cell, village, isibo };
  }

  private async createLeaderUser(
    manager: EntityManager,
    dto: { email: string; phone: string; names: string },
    role: UserRole,
    cell: any,
    village: any,
    isVillageLeader: boolean,
    isCellLeader: boolean,
    isIsiboLeader: boolean,
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
      isIsiboLeader,
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

  async createIsiboLeader(
    createIsiboLeaderDTO: CreateIsiboLeaderDTO.Input,
  ): Promise<void> {
    const { email, names, phone, cellId, villageId, isiboId } =
      createIsiboLeaderDTO;

    const userExists = await this.findUserByEmail(email);
    if (userExists) {
      throw new ConflictException("User already exists");
    }

    try {
      await this.entityManager.transaction(async (manager: EntityManager) => {
        const { cell, village, isibo } =
          await this.validateAndGetLocationsForIsiboLeader(
            manager,
            cellId,
            villageId,
            isiboId,
          );

        const user = await this.createLeaderUser(
          manager,
          { email, phone, names },
          UserRole.ISIBO_LEADER,
          cell,
          village,
          false,
          false,
          true,
        );

        // Set the user's profile as the isibo leader
        isibo.leader = user.profile;
        await manager.save(isibo);
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Isibo leader registration failed: ${error.message}`,
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

  async findCellLeader(cellId: string): Promise<User> {
    const cellLeader = await this.usersRepository.findOne({
      where: {
        role: UserRole.CELL_LEADER,
        profile: {
          cell: { id: cellId },
          isCellLeader: true,
        },
      },
      relations: ["profile"],
    });
    if (!cellLeader) throw new NotFoundException("Cell leader not found");
    return cellLeader;
  }

  async findVillageLeader(villageId: string): Promise<User> {
    const villageLeader = await this.usersRepository.findOne({
      where: {
        role: UserRole.VILLAGE_LEADER,
        profile: {
          village: { id: villageId },
          isVillageLeader: true,
        },
      },
      relations: ["profile"],
    });
    if (!villageLeader) throw new NotFoundException("Village leader not found");
    return villageLeader;
  }

  async findIsiboLeader(isiboId: string): Promise<User> {
    const isiboLeader = await this.usersRepository.findOne({
      where: {
        role: UserRole.ISIBO_LEADER,
        profile: {
          isibo: { id: isiboId },
          isIsiboLeader: true,
        },
      },
      relations: ["profile"],
    });
    if (!isiboLeader) throw new NotFoundException("Isibo leader not found");
    return isiboLeader;
  }

  async findHouseRepresentative(houseId: string): Promise<User> {
    const houseRepresentative = await this.usersRepository.findOne({
      where: {
        role: UserRole.HOUSE_REPRESENTATIVE,
        profile: {
          house: { id: houseId },
        },
      },
      relations: ["profile"],
    });
    if (!houseRepresentative)
      throw new NotFoundException("House representative not found");
    return houseRepresentative;
  }

  async saveProfile(profile: Profile): Promise<Profile> {
    return this.profilesRepository.save(profile);
  }

  async saveUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
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

  async findAllUsers(fetchUserDto: FetchUserDto.Input) {
    try {
      const { q, role, page, size } = fetchUserDto;

      const queryBuilder = this.usersRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.profile", "profile")
        .select([
          "user.id",
          "user.email",
          "user.phone",
          "user.role",
          "user.activated",
          "user.createdAt",
          "profile.names",
        ]);

      // Apply search filter if query is provided
      if (q) {
        queryBuilder.andWhere(
          "(profile.names ILIKE :query OR user.email ILIKE :query OR user.phone ILIKE :query)",
          { query: `%${q}%` },
        );
      }

      // Apply role filter if provided
      if (role) {
        queryBuilder.andWhere("user.role = :role", { role });
      }

      // Calculate pagination
      const skip = (page - 1) * size;
      queryBuilder.skip(skip).take(size);

      // Order by ID as a fallback since createdAt might not be selected
      queryBuilder.orderBy("user.createdAt", "DESC");

      // Execute query with count
      const [items, totalItems] = await queryBuilder.getManyAndCount();

      // Transform results
      const transformedItems = items.map((user) => ({
        id: user.id,
        names: user.profile.names,
        email: user.email,
        phone: user.phone,
        role: user.role,
        activated: user.activated,
      }));

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalItems / size);

      return {
        items: transformedItems,
        meta: {
          totalItems,
          itemCount: transformedItems.length,
          itemsPerPage: size,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      throw error;
    }
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

  private async validateAndGetLocationsForCitizen(
    manager: EntityManager,
    cellId: string,
    villageId: string,
    isiboId?: string,
    houseId?: string,
  ): Promise<{ cell: any; village: any; isibo?: any; house?: any }> {
    const cell = await manager.getRepository("Cell").findOneBy({ id: cellId });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    const village = await manager
      .getRepository("Village")
      .findOneBy({ id: villageId });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    let isibo = undefined;
    if (isiboId) {
      isibo = await manager.getRepository("Isibo").findOneBy({ id: isiboId });
      if (!isibo) {
        throw new NotFoundException("Isibo not found");
      }
    }

    let house = undefined;
    if (houseId) {
      house = await manager.getRepository("House").findOneBy({ id: houseId });
      if (!house) {
        throw new NotFoundException("House not found");
      }
    }

    return { cell, village, isibo, house };
  }

  async createCitizen(createCitizenDTO: CreateCitizenDTO.Input): Promise<void> {
    const { email, names, phone, cellId, villageId, isiboId, houseId } =
      createCitizenDTO;

    const userExists = await this.findUserByEmail(email);
    if (userExists) {
      throw new ConflictException("User already exists");
    }

    try {
      await this.entityManager.transaction(async (manager: EntityManager) => {
        const { cell, village, isibo, house } =
          await this.validateAndGetLocationsForCitizen(
            manager,
            cellId,
            villageId,
            isiboId,
            houseId,
          );

        const user = plainToInstance(User, {
          email,
          phone,
          password: await PasswordEncryption.hashPassword(
            this.generateRandomPassword(),
          ),
          role: UserRole.CITIZEN,
        });

        user.verifiedAt = new Date();
        const profile = plainToInstance(Profile, {
          names,
          cell,
          village,
          isibo,
          house,
          isVillageLeader: false,
          isCellLeader: false,
          isIsiboLeader: false,
        });
        user.profile = profile;

        await manager.save(user);
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Citizen registration failed: ${error.message}`,
      );
    }
  }
}
