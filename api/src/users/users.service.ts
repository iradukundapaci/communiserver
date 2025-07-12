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
import { EntityManager, In, Not, Repository, Brackets } from "typeorm";
import { CreateCellLeaderDTO } from "./dto/create-cell-leader.dto";
import { CreateCitizenDTO } from "./dto/create-citizen.dto";
import { CreateIsiboLeaderDTO } from "./dto/create-isibo-leader.dto";
import { CreateVillageLeaderDTO } from "./dto/create-village-leader.dto";
import { FetchUserDto } from "./dto/fetch-user.dto";
import { SearchUsersDto } from "./dto/search-users.dto";
import { paginate } from "nestjs-typeorm-paginate";
import { FetchUserListDto } from "./dto/fetch-user-list.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly verificationService: VerificationService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService<IAppConfig>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

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
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    // Check if village already has a leader
    const hasVillageLeader = await manager.getRepository("User").exists({
      where: {
        village: { id: villageId },
        isVillageLeader: true,
      },
    });
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
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    // Check if cell already has a leader
    const hasCellLeader = await manager.getRepository("User").exists({
      where: {
        cell: { id: cellId },
        isCellLeader: true,
      },
    });
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
    dto: { email: string; phone: string; names: string; password: string },
    cell: any,
    village: any,
    isibo: any,
    house: any,
    isVillageLeader: boolean,
    isCellLeader: boolean,
    isIsiboLeader: boolean,
  ): Promise<User> {
    const hashedPassword = await PasswordEncryption.hashPassword(dto.password);

    let user = plainToInstance(User, {
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
      role: UserRole.CITIZEN,
      names: dto.names,
      cell,
      village,
      isibo,
      house,
      isVillageLeader,
      isCellLeader,
      isIsiboLeader,
    });

    user = await manager.save(user);

    // Send account creation email with the provided password
    await this.sendAccountCreationEmail(user, dto.password);

    return user;
  }

  async createCellLeader(
    createCellLeaderDTO: CreateCellLeaderDTO.Input,
  ): Promise<void> {
    const { email, names, phone, cellId, villageId, password } =
      createCellLeaderDTO;

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
          { email, phone, names, password },
          cell,
          village,
          null,
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
    const { email, names, phone, cellId, villageId, password } =
      createVillageLeaderDTO;

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
          { email, phone, names, password },
          cell,
          village,
          null,
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
    const { email, names, phone, cellId, villageId, isiboId, password } =
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
          { email, phone, names, password },
          cell,
          village,
          isibo,
          null,
          false,
          false,
          true,
        );

        // Set the user as the isibo leader
        isibo.leader = user;
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

  async createCitizen(
    createCitizenDTO: CreateCitizenDTO.Input,
    currentUser?: User,
  ): Promise<void> {
    const {
      email,
      names,
      phone,
      cellId,
      villageId,
      isiboId,
      houseId,
      password,
    } = createCitizenDTO;

    const userExists = await this.findUserByEmail(email);
    if (userExists) {
      throw new ConflictException("User already exists");
    }

    try {
      await this.entityManager.transaction(async (manager: EntityManager) => {
        let finalCellId = cellId;
        let finalVillageId = villageId;
        let finalIsiboId = isiboId;
        let finalHouseId = houseId;

        // If the current user is an isibo leader, auto-assign to their isibo
        if (currentUser) {
          const user = await this.findUserById(currentUser.id);

          if (user.role === UserRole.ISIBO_LEADER && user.isibo) {
            finalIsiboId = user.isibo.id;
            finalVillageId = user.village?.id || villageId;
            finalCellId = user.cell?.id || cellId;
            finalHouseId = user.house?.id || houseId;
          }
        }

        const { cell, village, isibo, house } =
          await this.validateAndGetLocationsForCitizen(
            manager,
            finalCellId,
            finalVillageId,
            finalIsiboId,
            finalHouseId,
          );

        await this.createLeaderUser(
          manager,
          { email, phone, names, password },
          cell,
          village,
          isibo,
          house,
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

  private async sendAccountCreationEmail(
    user: User,
    password: string,
  ): Promise<void> {
    try {
      const frontendUrl =
        this.configService.get("url")?.client || "http://localhost:3000";
      const loginUrl = `${frontendUrl}/login`;

      // Determine role and location
      let role = "CITIZEN";
      let location = "";

      if (user.isCellLeader) {
        role = "CELL_LEADER";
        location = user.cell?.name || "Unknown Cell";
      } else if (user.isVillageLeader) {
        role = "VILLAGE_LEADER";
        location = user.village?.name || "Unknown Village";
      } else if (user.isIsiboLeader) {
        role = "ISIBO_LEADER";
        location = user.isibo?.name || "Unknown Isibo";
      }

      await this.notificationService.sendAccountCreationEmail({
        name: user.names,
        email: user.email,
        role,
        password: password,
        loginUrl,
        location,
      });
    } catch (error) {
      // Log error but don't fail the user creation process
      console.error("Failed to send account creation email:", error);
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findUsersByIds(userIds: string[]): Promise<User[]> {
    return this.usersRepository.find({
      where: { id: In(userIds) },
    });
  }

  async findCellLeader(cellId: string): Promise<User> {
    const cellLeader = await this.usersRepository.findOne({
      where: {
        role: UserRole.CELL_LEADER,
        cell: { id: cellId },
        isCellLeader: true,
      },
    });
    if (!cellLeader) throw new NotFoundException("Cell leader not found");
    return cellLeader;
  }

  async findVillageLeader(villageId: string): Promise<User> {
    const villageLeader = await this.usersRepository.findOne({
      where: {
        role: UserRole.VILLAGE_LEADER,
        village: { id: villageId },
        isVillageLeader: true,
      },
    });
    if (!villageLeader) throw new NotFoundException("Village leader not found");
    return villageLeader;
  }

  async findIsiboLeader(isiboId: string): Promise<User> {
    const isiboLeader = await this.usersRepository.findOne({
      where: {
        role: UserRole.ISIBO_LEADER,
        isibo: { id: isiboId },
        isIsiboLeader: true,
      },
    });
    if (!isiboLeader) throw new NotFoundException("Isibo leader not found");
    return isiboLeader;
  }

  async saveUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async getUser(userId: string) {
    const user = await this.findUserById(userId);
    return plainToInstance(FetchUserDto.Output, {
      id: user.id,
      names: user.names,
      email: user.email,
      role: user.role,
      phone: user.phone,
      cell: user.cell,
      village: user.village,
      isibo: user.isibo,
      house: user.house,
      isIsiboLeader: user.isIsiboLeader,
      isVillageLeader: user.isVillageLeader,
      isCellLeader: user.isCellLeader,
    });
  }

  async updateUser(
    userId: string,
    { names, email, phone, isiboId, houseId }: UpdateUserDto.Input,
  ): Promise<UpdateUserDto.Output> {
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

    user.names = names ?? user.names;
    user.phone = phone ?? user.phone;
    user.isibo = isiboId ? ({ id: isiboId } as any) : null;
    user.house = houseId ? ({ id: houseId } as any) : null;

    if (isEmailChanged) {
      user.email = email!;
      await this.usersRepository.save(user);

      const verification =
        await this.verificationService.createVerification(user);
      const verifyEmailLink = `${verification.verificationCode}`;
      await this.verificationService.sendVerificationEmail(
        user,
        verifyEmailLink,
      );
    } else {
      await this.usersRepository.save(user);
    }

    return {
      id: user.id,
      names: user.names,
      email: user.email,
      phoneNumber: user.phone,
      isiboId: user.isibo?.id,
      isIsiboLeader: user.isIsiboLeader,
      isVillageLeader: user.isVillageLeader,
      isCellLeader: user.isCellLeader,
      houseId: user.house?.id,
    };
  }

  async findAllUsers(fetchUserDto: FetchUserListDto.Input, currentUser?: User) {
    try {
      const { q, role, page, size } = fetchUserDto;

      const queryBuilder = this.usersRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.isibo", "isibo")
        .select([
          "user.id",
          "user.email",
          "user.phone",
          "user.role",
          "user.names",
          "user.createdAt",
          "isibo.id",
          "isibo.name",
        ]);

      // Apply role-based filtering
      if (currentUser) {
        const user = await this.findUserById(currentUser.id);

        if (user.role === UserRole.ISIBO_LEADER && user.isibo) {
          // Isibo leaders can only see citizens in their isibo
          queryBuilder.andWhere("user.isibo.id = :isiboId", {
            isiboId: user.isibo.id,
          });
          queryBuilder.andWhere("user.role = :citizenRole", {
            citizenRole: UserRole.CITIZEN,
          });
        } else if (user.role === UserRole.VILLAGE_LEADER && user.village) {
          // Village leaders can see users in their village
          queryBuilder.andWhere("user.village.id = :villageId", {
            villageId: user.village.id,
          });
        } else if (user.role === UserRole.CELL_LEADER && user.cell) {
          // Cell leaders can see users in their cell
          queryBuilder.andWhere("user.cell.id = :cellId", {
            cellId: user.cell.id,
          });
        }
        // Admins can see all users (no additional filtering)
      }

      // Apply search filter if query is provided
      if (q) {
        queryBuilder.andWhere(
          "(user.names ILIKE :query OR user.email ILIKE :query OR user.phone ILIKE :query)",
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
        names: user.names,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isibo: user.isibo
          ? {
              id: user.isibo.id,
              name: user.isibo.name,
            }
          : null,
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

  async removeHouseFromUsers(houseId: string): Promise<void> {
    await this.usersRepository.update(
      { house: { id: houseId } },
      { house: null },
    );
  }

  async assignUsersToHouse(userIds: string[], houseId: string): Promise<void> {
    if (userIds.length > 0) {
      await this.usersRepository.update(
        { id: In(userIds) },
        { house: { id: houseId } },
      );
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.findUserById(userId);

    // Only allow deletion of CITIZEN role users
    if (user.role !== UserRole.CITIZEN) {
      throw new BadRequestException("Only citizens can be deleted");
    }

    // Soft delete the user
    await this.usersRepository.softDelete(userId);
  }

  async removeUserFromHouse(userId: string): Promise<void> {
    const user = await this.findUserById(userId);

    if (!user.house) {
      throw new BadRequestException("User is not assigned to any house");
    }

    // Remove user from house without deleting the user
    await this.usersRepository.update(
      { id: userId },
      { house: null }
    );
  }

  async addUserToHouse(userId: string, houseId: string): Promise<void> {
    const user = await this.findUserById(userId);

    if (user.role !== UserRole.CITIZEN) {
      throw new BadRequestException("Only citizens can be assigned to houses");
    }

    // Check if house exists
    const house = await this.usersRepository.manager.findOne("House", {
      where: { id: houseId }
    });

    if (!house) {
      throw new NotFoundException("House not found");
    }

    // Assign user to house
    await this.usersRepository.update(
      { id: userId },
      { house: { id: houseId } }
    );
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

  async searchUsers(dto: SearchUsersDto.Input): Promise<SearchUsersDto.Output> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.village", "village")
      .leftJoinAndSelect("user.cell", "cell")
      .leftJoinAndSelect("user.house", "house");

    // Apply search query
    if (dto.q) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("user.names ILIKE :searchKey", {
            searchKey: `%${dto.q}%`,
          }).orWhere("user.email ILIKE :searchKey", {
            searchKey: `%${dto.q}%`,
          }).orWhere("user.phone ILIKE :searchKey", {
            searchKey: `%${dto.q}%`,
          });
        }),
      );
    }

    // Apply role filters
    if (dto.role) {
      queryBuilder.andWhere("user.role = :role", {
        role: dto.role,
      });
    }

    if (dto.roles && dto.roles.length > 0) {
      queryBuilder.andWhere("user.role IN (:...roles)", {
        roles: dto.roles,
      });
    }

    // Apply location filters
    if (dto.villageIds && dto.villageIds.length > 0) {
      queryBuilder.andWhere("village.id IN (:...villageIds)", {
        villageIds: dto.villageIds,
      });
    }

    if (dto.cellIds && dto.cellIds.length > 0) {
      queryBuilder.andWhere("cell.id IN (:...cellIds)", {
        cellIds: dto.cellIds,
      });
    }

    if (dto.houseIds && dto.houseIds.length > 0) {
      queryBuilder.andWhere("house.id IN (:...houseIds)", {
        houseIds: dto.houseIds,
      });
    }

    // Apply date filters
    if (dto.createdFrom) {
      queryBuilder.andWhere("user.createdAt >= :createdFrom", {
        createdFrom: dto.createdFrom,
      });
    }

    if (dto.createdTo) {
      queryBuilder.andWhere("user.createdAt <= :createdTo", {
        createdTo: dto.createdTo,
      });
    }

    if (dto.startDate) {
      queryBuilder.andWhere("user.createdAt >= :startDate", {
        startDate: dto.startDate,
      });
    }

    if (dto.endDate) {
      queryBuilder.andWhere("user.createdAt <= :endDate", {
        endDate: dto.endDate,
      });
    }

    // Apply active filter
    if (dto.isActive !== undefined) {
      queryBuilder.andWhere("user.isActive = :isActive", {
        isActive: dto.isActive,
      });
    }

    // Apply location name filters
    if (dto.villageName) {
      queryBuilder.andWhere("village.name ILIKE :villageName", {
        villageName: `%${dto.villageName}%`,
      });
    }

    if (dto.cellName) {
      queryBuilder.andWhere("cell.name ILIKE :cellName", {
        cellName: `%${dto.cellName}%`,
      });
    }

    // Apply sorting
    const sortBy = dto.sortBy || 'createdAt';
    const sortOrder = dto.sortOrder || 'DESC';
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    const paginatedResult = await paginate(queryBuilder, {
      page: dto.page,
      limit: dto.size,
    });

    return {
      items: paginatedResult.items.map((user) =>
        plainToInstance(SearchUsersDto.UserItem, user)
      ),
      meta: {
        totalItems: paginatedResult.meta.totalItems || 0,
        itemCount: paginatedResult.meta.itemCount || 0,
        itemsPerPage: paginatedResult.meta.itemsPerPage || 0,
        totalPages: paginatedResult.meta.totalPages || 0,
        currentPage: paginatedResult.meta.currentPage || 0,
      },
    };
  }
}
