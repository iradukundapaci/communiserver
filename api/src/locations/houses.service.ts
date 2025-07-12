import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { Not, Repository } from "typeorm";
import { UsersService } from "../users/users.service";
import { CreateHouseDto } from "./dto/create-house.dto";
import { UpdateHouseDto } from "./dto/update-house.dto";
import { House } from "./entities/house.entity";
import { Isibo } from "./entities/isibo.entity";
import { Citizen } from "./entities/citizen.entity";
import { CreateCitizenDTO } from "src/users/dto/create-citizen.dto";
import { Village } from "./entities/village.entity";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { FetchHouseDto } from "./dto/fetch-house.dto";

@Injectable()
export class HousesService {
  constructor(
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
    @InjectRepository(Isibo)
    private readonly isiboRepository: Repository<Isibo>,
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    private readonly usersService: UsersService,
  ) {}

  private async validateHouseCode(
    isiboId: string,
    code: string,
  ): Promise<void> {
    const existingHouse = await this.houseRepository.findOne({
      where: {
        isibo: { id: Not(isiboId) },
        code,
      },
    });

    if (existingHouse) {
      throw new ConflictException(
        `House with code ${code} already exists in this isibo`,
      );
    }
  }

  async createHouse(createHouseDto: CreateHouseDto.Input): Promise<House> {
    // Validate isiboId
    const isibo = await this.isiboRepository.findOne({
      where: { id: createHouseDto.isiboId },
      relations: [
        "leader",
        "village",
        "village.users",
        "village.cell",
        "village.cell.users",
      ],
    });

    if (!isibo) {
      throw new NotFoundException("Isibo not found");
    }

    await this.validateHouseCode(createHouseDto.isiboId, createHouseDto.code);

    const house = this.houseRepository.create({
      code: createHouseDto.code,
      address: createHouseDto.address,
      isibo: { id: createHouseDto.isiboId },
    });

    // Save the house first to get the ID
    const savedHouse = await this.houseRepository.save(house);

    // Assign members if provided
    if (createHouseDto.members && createHouseDto.members.length > 0) {
      const memberIds = await this.createCitizensAndGetIds(
        createHouseDto.members,
        isibo.village.id,
        isibo.id,
        savedHouse.id,
      );
      await this.assignMembersToHouse(savedHouse.id, memberIds);
    }

    // Fetch the house with members to return the complete data
    const houseWithMembers = await this.houseRepository.findOne({
      where: { id: savedHouse.id },
      relations: ["isibo", "members"],
    });

    if (!houseWithMembers) {
      throw new NotFoundException("House not found after creation");
    }

    return houseWithMembers;
  }

  async updateHouse(
    id: string,
    updateHouseDto: UpdateHouseDto.Input,
  ): Promise<House> {
    const house = await this.houseRepository.findOne({
      where: { id },
      relations: [
        "isibo",
        "isibo.leader",
        "isibo.village",
        "isibo.village.users",
        "isibo.village.cell",
        "isibo.village.cell.users",
        "members",
      ],
    });

    if (!house) {
      throw new NotFoundException("House not found");
    }

    if (updateHouseDto.code) {
      await this.validateHouseCode(house.isibo.id, updateHouseDto.code);
      house.code = updateHouseDto.code;
    }

    if (updateHouseDto.address) {
      house.address = updateHouseDto.address;
    }

    // Handle member assignment if provided
    if (updateHouseDto.memberIds && updateHouseDto.memberIds.length > 0) {
      // Assign existing citizens to the house
      await this.assignMembersToHouse(house.id, updateHouseDto.memberIds);
    } else if (updateHouseDto.members && updateHouseDto.members.length > 0) {
      // Create new citizens and assign them to the house
      const memberIds = await this.createCitizensAndGetIds(
        updateHouseDto.members,
        house.isibo.village.id,
        house.isibo.id,
        house.id,
      );
      await this.assignMembersToHouse(house.id, memberIds);
    }

    const savedHouse = await this.houseRepository.save(house);

    // Fetch the house with members to return the complete data
    const houseWithMembers = await this.houseRepository.findOne({
      where: { id: savedHouse.id },
      relations: ["isibo", "members"],
    });

    if (!houseWithMembers) {
      throw new NotFoundException("House not found after update");
    }

    return houseWithMembers;
  }

  async deleteHouse(id: string): Promise<void> {
    const house = await this.houseRepository.findOne({
      where: { id },
      relations: [
        "isibo",
        "isibo.leader",
        "isibo.village",
        "isibo.village.users",
        "isibo.village.cell",
        "isibo.village.cell.users",
        "members",
      ],
    });

    if (!house) {
      throw new NotFoundException("House not found");
    }

    // Delete all members of the house
    if (house.members && house.members.length > 0) {
      for (const member of house.members) {
        try {
          await this.usersService.deleteUser(member.id);
        } catch (error) {
          console.error(`Failed to delete member ${member.id}:`, error);
        }
      }
    }

    await this.houseRepository.softDelete(id);
  }

  async findAllHouses(dto: FetchHouseDto.Input): Promise<FetchHouseDto.Output> {
    const queryBuilder = this.houseRepository
      .createQueryBuilder("house")
      .leftJoin("house.isibo", "isibo")
      .leftJoinAndSelect("house.members", "members")
      .where("isibo.id = :isiboId", { isiboId: dto.isiboId });

    if (dto.q) {
      queryBuilder.andWhere("house.code ILIKE :search", {
        search: `%${dto.q}%`,
      });
    }

    const result = await paginate(queryBuilder, {
      page: dto.page,
      limit: dto.size,
    });

    return {
      items: result.items || [],
      meta: {
        totalItems: result.meta.totalItems || 0,
        itemCount: result.meta.itemCount || 0,
        itemsPerPage: result.meta.itemsPerPage || dto.size,
        totalPages: result.meta.totalPages || 0,
        currentPage: result.meta.currentPage || dto.page,
      },
    };
  }

  async findHouseById(id: string): Promise<House> {
    const house = await this.houseRepository.findOne({
      where: { id },
      relations: ["isibo", "members"],
    });

    if (!house) {
      throw new NotFoundException("House not found");
    }

    return house;
  }

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

  private async createCitizensAndGetIds(
    citizens: Citizen[],
    villageId: string,
    isiboId: string,
    houseId: string,
  ): Promise<string[]> {
    const userIds: string[] = [];

    const village = await this.villageRepository.findOne({
      where: { id: villageId },
      relations: ["cell"],
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    for (const citizen of citizens) {
      try {
        const existingUser = await this.usersService.findUserByEmail(
          citizen.email,
        );
        if (existingUser) {
          throw new ConflictException(
            `User with email ${citizen.email} already exists`,
          );
        }

        const citizenData: CreateCitizenDTO.Input = {
          names: citizen.names,
          email: citizen.email,
          phone: citizen.phone,
          password: this.generateRandomPassword(),
          cellId: village.cell.id,
          villageId: villageId,
          isiboId: isiboId,
          houseId: houseId,
        };

        await this.usersService.createCitizen(citizenData);

        const createdUser = await this.usersService.findUserByEmail(
          citizen.email,
        );
        if (createdUser) {
          userIds.push(createdUser.id);
        }
      } catch (error) {
        console.error(`Failed to create citizen ${citizen.email}:`, error);
        throw new BadRequestException(
          `Failed to create citizen ${citizen.email}: ${error.message}`,
        );
      }
    }

    return userIds;
  }

  async assignMembersToHouse(
    houseId: string,
    memberIds: string[],
  ): Promise<void> {
    // Remove all current members from this house first
    await this.usersService.removeHouseFromUsers(houseId);

    if (memberIds.length > 0) {
      const users = await this.usersService.findUsersByIds(memberIds);

      if (users.length !== memberIds.length) {
        throw new NotFoundException("One or more member users not found");
      }

      const nonCitizens = users.filter(
        (user) => user.role !== UserRole.CITIZEN,
      );
      if (nonCitizens.length > 0) {
        throw new BadRequestException("All members must have CITIZEN role");
      }

      await this.usersService.assignUsersToHouse(memberIds, houseId);
    }
  }

  async addMemberToHouse(houseId: string, userId: string): Promise<void> {
    const house = await this.houseRepository.findOne({
      where: { id: houseId },
      relations: ["members"],
    });

    if (!house) {
      throw new NotFoundException("House not found");
    }

    // Check if user is already a member
    const isAlreadyMember = house.members?.some(member => member.id === userId);
    if (isAlreadyMember) {
      throw new ConflictException("User is already a member of this house");
    }

    await this.usersService.addUserToHouse(userId, houseId);
  }

  async removeMemberFromHouse(houseId: string, userId: string): Promise<void> {
    const house = await this.houseRepository.findOne({
      where: { id: houseId },
      relations: ["members"],
    });

    if (!house) {
      throw new NotFoundException("House not found");
    }

    // Check if user is actually a member
    const isMember = house.members?.some(member => member.id === userId);
    if (!isMember) {
      throw new BadRequestException("User is not a member of this house");
    }

    await this.usersService.removeUserFromHouse(userId);
  }
}
