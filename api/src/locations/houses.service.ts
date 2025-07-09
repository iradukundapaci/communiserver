import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { Repository } from "typeorm";
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
      where: { isibo: { id: isiboId }, code },
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
        "village.profiles",
        "village.cell",
        "village.cell.profiles",
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

    // Assign members if provided
    if (createHouseDto.members && createHouseDto.members.length > 0) {
      const memberIds = await this.createCitizensAndGetIds(
        createHouseDto.members,
        isibo.village.id,
        isibo.id,
        house.id,
      );
      await this.assignMembersToHouse(house.id, memberIds);
    }

    return house;
  }

  async updateHouse(
    id: string,
    updateHouseDto: UpdateHouseDto.Input,
  ): Promise<House> {
    const house = await this.houseRepository.findOne({
      where: { id },
      relations: [
        "representative",
        "isibo",
        "isibo.leader",
        "isibo.village",
        "isibo.village.profiles",
        "isibo.village.cell",
        "isibo.village.cell.profiles",
      ],
    });

    if (!house) {
      throw new NotFoundException("House not found");
    }

    // Update the house
    if (updateHouseDto.code) {
      await this.validateHouseCode(house.isibo.id, updateHouseDto.code);
      house.code = updateHouseDto.code;
    }

    if (updateHouseDto.address) {
      house.address = updateHouseDto.address;
    }

    return this.houseRepository.save(house);
  }

  async deleteHouse(id: string): Promise<void> {
    const house = await this.houseRepository.findOne({
      where: { id },
      relations: [
        "representative",
        "isibo",
        "isibo.leader",
        "isibo.village",
        "isibo.village.profiles",
        "isibo.village.cell",
        "isibo.village.cell.profiles",
      ],
    });

    if (!house) {
      throw new NotFoundException("House not found");
    }

    await this.houseRepository.softDelete(id);
  }

  async findAllHouses(dto: FetchHouseDto.Input): Promise<FetchHouseDto.Output> {
    const queryBuilder = this.houseRepository
      .createQueryBuilder("house")
      .leftJoinAndSelect("house.representative", "representative")
      .leftJoin("house.isibo", "isibo")
      .where("isibo.id = :isiboId", { isiboId: dto.isiboId });

    if (dto.q) {
      queryBuilder.andWhere("house.code ILIKE :search", {
        search: `%${dto.q}%`,
      });
    }

    return paginate(queryBuilder, {
      page: dto.page,
      limit: dto.size,
    });
  }

  async findHouseById(id: string): Promise<House> {
    const house = await this.houseRepository.findOne({
      where: { id },
      relations: ["representative", "isibo", "members"],
    });

    if (!house) {
      throw new NotFoundException("House not found");
    }

    return house;
  }

  private async createCitizensAndGetIds(
    citizens: Citizen[],
    villageId: string,
    isiboId: string,
    houseId: string,
  ): Promise<string[]> {
    const profileIds: string[] = [];

    const village = await this.villageRepository.findOne({
      where: { id: villageId },
      relations: ["cell"],
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    for (const citizen of citizens) {
      try {
        // Check if user already exists
        const existingUser = await this.usersService.findUserByEmail(
          citizen.email,
        );
        if (existingUser) {
          throw new ConflictException(
            `User with email ${citizen.email} already exists`,
          );
        }

        // Create citizen using the users service
        const citizenData: CreateCitizenDTO.Input = {
          names: citizen.names,
          email: citizen.email,
          phone: citizen.phone,
          cellId: village.cell.id,
          villageId: villageId,
          isiboId: isiboId,
          houseId: houseId,
        };

        await this.usersService.createCitizen(citizenData);

        // Get the created user to get their profile ID
        const createdUser = await this.usersService.findUserByEmail(
          citizen.email,
        );
        if (createdUser && createdUser.profile) {
          profileIds.push(createdUser.profile.id);
        }
      } catch (error) {
        // If citizen creation fails, we should handle it appropriately
        console.error(`Failed to create citizen ${citizen.email}:`, error);
        throw new BadRequestException(
          `Failed to create citizen ${citizen.email}: ${error.message}`,
        );
      }
    }

    return profileIds;
  }

  async assignMembersToHouse(
    houseId: string,
    memberIds: string[],
  ): Promise<void> {
    // First, remove all current members from this isibo
    await this.usersService.removeHouseFromProfiles(houseId);

    // Then assign new members if any
    if (memberIds.length > 0) {
      // Validate that all member IDs exist and are citizens
      const profiles = await this.usersService.findProfilesByIds(memberIds);

      if (profiles.length !== memberIds.length) {
        throw new NotFoundException("One or more member profiles not found");
      }

      // Check that all users have CITIZEN role
      const nonCitizens = profiles.filter(
        (profile) => profile.user.role !== UserRole.CITIZEN,
      );
      if (nonCitizens.length > 0) {
        throw new BadRequestException("All members must have CITIZEN role");
      }

      // Assign members to house
      await this.usersService.assignProfilesToHouse(memberIds, houseId);
    }
  }
}
