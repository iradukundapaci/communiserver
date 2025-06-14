import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { PasswordEncryption } from "src/__shared__/utils/password-encrytion.util";
import { VerificationService } from "src/verification/verification.service";
import { NotificationService } from "src/notifications/notification.service";
import { ConfigService } from "@nestjs/config";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";
import { EntityManager, In, Not, Repository } from "typeorm";
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
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService<IAppConfig>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
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
    cell: any,
    village: any,
    isibo: any,
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
      role: UserRole.CITIZEN,
    });

    user.verifiedAt = new Date();
    const profile = plainToInstance(Profile, {
      names: dto.names,
      cell,
      village,
      isibo,
      isVillageLeader,
      isCellLeader,
      isIsiboLeader,
      phone: dto.phone,
    });
    user.profile = profile;

    user = await manager.save(user);

    // Send account creation email
    await this.sendAccountCreationEmail(user, password);

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
          cell,
          village,
          null,
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
          cell,
          village,
          null,
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
          cell,
          village,
          isibo,
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

  async createCitizen(createCitizenDTO: CreateCitizenDTO.Input, currentUser?: User): Promise<void> {
    const { email, names, phone, cellId, villageId, isiboId } = createCitizenDTO;

    const userExists = await this.findUserByEmail(email);
    if (userExists) {
      throw new ConflictException("User already exists");
    }

    try {
      await this.entityManager.transaction(async (manager: EntityManager) => {
        let finalCellId = cellId;
        let finalVillageId = villageId;
        let finalIsiboId = isiboId;

        // If the current user is an isibo leader, auto-assign to their isibo
        if (currentUser) {
          const userProfile = await this.findUserById(currentUser.id);

          if (userProfile.role === UserRole.ISIBO_LEADER && userProfile.profile.isibo) {
            finalIsiboId = userProfile.profile.isibo.id;
            finalVillageId = userProfile.profile.village?.id || villageId;
            finalCellId = userProfile.profile.cell?.id || cellId;
          }
        }

        const { cell, village, isibo } = await this.validateAndGetLocationsForCitizen(
          manager,
          finalCellId,
          finalVillageId,
          finalIsiboId,
        );

        await this.createLeaderUser(
          manager,
          { email, phone, names },
          cell,
          village,
          isibo,
          false,
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
        `Citizen registration failed: ${error.message}`,
      );
    }
  }

  private async sendAccountCreationEmail(user: User, password: string): Promise<void> {
    try {
      const frontendUrl = this.configService.get('url')?.client || 'http://localhost:3000';
      const loginUrl = `${frontendUrl}/login`;

      // Determine role and location
      let role = 'CITIZEN';
      let location = '';

      if (user.profile.isCellLeader) {
        role = 'CELL_LEADER';
        location = user.profile.cell?.name || 'Unknown Cell';
      } else if (user.profile.isVillageLeader) {
        role = 'VILLAGE_LEADER';
        location = user.profile.village?.name || 'Unknown Village';
      } else if (user.profile.isIsiboLeader) {
        role = 'ISIBO_LEADER';
        location = user.profile.isibo?.name || 'Unknown Isibo';
      }

      await this.notificationService.sendAccountCreationEmail({
        name: user.profile.names,
        email: user.email,
        role,
        temporaryPassword: password,
        loginUrl,
        location,
      });
    } catch (error) {
      // Log error but don't fail the user creation process
      console.error('Failed to send account creation email:', error);
    }
  }

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
      isibo: userProfile.profile.isibo,
      isIsiboLeader: userProfile.profile.isIsiboLeader,
      isVillageLeader: userProfile.profile.isVillageLeader,
      isCellLeader: userProfile.profile.isCellLeader,
      profileID: userProfile.profile.id,
    });
  }

  async updateProfile(
    userId: string,
    { names, email, phone, isiboId }: UpdateProfileDto.Input,
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
    user.profile.isibo = isiboId ? ({ id: isiboId } as any) : null;

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
      isiboId: user.profile.isibo?.id,
      isIsiboLeader: user.profile.isIsiboLeader,
      isVillageLeader: user.profile.isVillageLeader,
      isCellLeader: user.profile.isCellLeader,
    };
  }

  async findAllUsers(fetchUserDto: FetchUserDto.Input, currentUser?: User) {
    try {
      const { q, role, page, size } = fetchUserDto;

      const queryBuilder = this.usersRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.profile", "profile")
        .leftJoinAndSelect("profile.isibo", "isibo")
        .select([
          "user.id",
          "user.email",
          "user.phone",
          "user.role",
          "user.activated",
          "user.createdAt",
          "profile.names",
          "profile.id",
          "isibo.id",
          "isibo.name",
        ]);

      // Apply role-based filtering
      if (currentUser) {
        const userProfile = await this.findUserById(currentUser.id);

        if (userProfile.role === UserRole.ISIBO_LEADER && userProfile.profile.isibo) {
          // Isibo leaders can only see citizens in their isibo
          queryBuilder.andWhere("profile.isibo.id = :isiboId", {
            isiboId: userProfile.profile.isibo.id
          });
          queryBuilder.andWhere("user.role = :citizenRole", {
            citizenRole: UserRole.CITIZEN
          });
        } else if (userProfile.role === UserRole.VILLAGE_LEADER && userProfile.profile.village) {
          // Village leaders can see users in their village
          queryBuilder.andWhere("profile.village.id = :villageId", {
            villageId: userProfile.profile.village.id
          });
        } else if (userProfile.role === UserRole.CELL_LEADER && userProfile.profile.cell) {
          // Cell leaders can see users in their cell
          queryBuilder.andWhere("profile.cell.id = :cellId", {
            cellId: userProfile.profile.cell.id
          });
        }
        // Admins can see all users (no additional filtering)
      }

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
        profileID: user.profile.id,
        isibo: user.profile.isibo ? {
          id: user.profile.isibo.id,
          name: user.profile.isibo.name,
        } : null,
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

  async findProfilesByIds(profileIds: string[]): Promise<Profile[]> {
    return this.profilesRepository.find({
      where: { id: In(profileIds) },
      relations: ["user"],
    });
  }

  async removeIsiboFromProfiles(isiboId: string): Promise<void> {
    await this.profilesRepository.update(
      { isibo: { id: isiboId } },
      { isibo: null }
    );
  }

  async assignProfilesToIsibo(profileIds: string[], isiboId: string): Promise<void> {
    if (profileIds.length > 0) {
      await this.profilesRepository.update(
        { id: In(profileIds) },
        { isibo: { id: isiboId } }
      );
    }
  }

  private async validateAndGetLocationsForCitizen(
    manager: EntityManager,
    cellId: string,
    villageId: string,
    isiboId?: string,
  ): Promise<{ cell: any; village: any; isibo?: any }> {
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

    return { cell, village, isibo };
  }
}
