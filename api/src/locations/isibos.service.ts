import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { Repository, EntityManager } from "typeorm";
import { UsersService } from "../users/users.service";
import { CreateIsiboDto } from "./dto/create-isibo.dto";
import { FetchIsiboDto } from "./dto/fetch-isibo.dto";
import { UpdateIsiboDto } from "./dto/update-isibo.dto";
import { Isibo } from "./entities/isibo.entity";
import { Village } from "./entities/village.entity";
import { Citizen } from "./entities/citizen.entity";
import { CreateCitizenDTO } from "../users/dto/create-citizen.dto";

@Injectable()
export class IsibosService {
  constructor(
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
    @InjectRepository(Isibo)
    private readonly isiboRepository: Repository<Isibo>,
    private readonly usersService: UsersService,
  ) {}

  private async validateIsiboNames(
    villageId: string,
    isiboNames: string[],
  ): Promise<void> {
    const existingIsibos = await this.isiboRepository.find({
      where: { village: { id: villageId } },
    });

    const existingIsiboNames = existingIsibos.map((i) => i.name);
    const duplicateNames = isiboNames.filter((name) =>
      existingIsiboNames.includes(name.toUpperCase()),
    );

    if (duplicateNames.length > 0) {
      throw new ConflictException(
        `Isibos with names ${duplicateNames.join(", ")} already exist in this village`,
      );
    }
  }

  async createIsibo(createIsiboDto: CreateIsiboDto.Input): Promise<Isibo> {
    // Validate villageId
    const village = await this.villageRepository.findOne({
      where: { id: createIsiboDto.villageId },
      relations: ["profiles", "cell", "cell.profiles"],
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    // Validate leaderId if provided
    let leader = null;
    if (createIsiboDto.leaderId) {
      leader = await this.usersService.findUserById(createIsiboDto.leaderId);
      if (!leader) {
        throw new NotFoundException("Isibo leader not found");
      }

      // Update the profile to mark as isibo leader
      if (leader.profile) {
        leader.profile.isIsiboLeader = true;
        await this.usersService.saveProfile(leader.profile);
      }
    }

    // Ensure name is uppercase
    const isiboName = createIsiboDto.name.toUpperCase();

    // Validate isibo name uniqueness within the village
    await this.validateIsiboNames(createIsiboDto.villageId, [isiboName]);

    const isibo = this.isiboRepository.create({
      name: isiboName,
      village: { id: createIsiboDto.villageId },
      leader: leader?.profile,
    });

    const savedIsibo = await this.isiboRepository.save(isibo);

    // Create and assign members if provided
    if (createIsiboDto.members && createIsiboDto.members.length > 0) {
      const memberIds = await this.createCitizensAndGetIds(
        createIsiboDto.members,
        createIsiboDto.villageId,
        savedIsibo.id
      );
      await this.assignMembersToIsibo(savedIsibo.id, memberIds);
    }

    return this.findIsiboById(savedIsibo.id);
  }

  async updateIsibo(
    id: string,
    updateIsiboDto: UpdateIsiboDto.Input,
  ): Promise<Isibo> {
    const isibo = await this.isiboRepository.findOne({
      where: { id },
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

    // If updating isibo name, validate uniqueness within the village
    if (updateIsiboDto.name) {
      const uppercaseName = updateIsiboDto.name.toUpperCase();
      if (uppercaseName !== isibo.name) {
        await this.validateIsiboNames(isibo.village.id, [uppercaseName]);
        updateIsiboDto.name = uppercaseName;
      }
    }

    // If updating villageId, validate it
    if (
      updateIsiboDto.villageId &&
      updateIsiboDto.villageId !== isibo.village.id
    ) {
      const newVillage = await this.villageRepository.findOne({
        where: { id: updateIsiboDto.villageId },
      });
      if (!newVillage) {
        throw new NotFoundException("New village not found");
      }
      // Validate isibo name uniqueness in the new village
      await this.validateIsiboNames(updateIsiboDto.villageId, [
        updateIsiboDto.name || isibo.name,
      ]);
    }

    // If updating leaderId, validate it
    if (updateIsiboDto.leaderId) {
      // If there's a current leader, remove the isibo leader flag
      if (isibo.leader) {
        isibo.leader.isIsiboLeader = false;
        await this.usersService.saveProfile(isibo.leader);
      }

      const leader = await this.usersService.findUserById(
        updateIsiboDto.leaderId,
      );
      if (!leader) {
        throw new NotFoundException("Isibo leader not found");
      }

      // Update the profile to mark as isibo leader
      if (leader.profile) {
        leader.profile.isIsiboLeader = true;
        await this.usersService.saveProfile(leader.profile);
      }

      isibo.leader = leader.profile;
    }

    // Update the isibo
    if (updateIsiboDto.name) {
      isibo.name = updateIsiboDto.name;
    }
    if (updateIsiboDto.villageId) {
      isibo.village = { id: updateIsiboDto.villageId } as Village;
    }

    const savedIsibo = await this.isiboRepository.save(isibo);

    // Handle member updates
    let allMemberIds: string[] = [];

    // Keep existing members if specified
    if (updateIsiboDto.existingMemberIds) {
      allMemberIds = [...updateIsiboDto.existingMemberIds];
    }

    // Create new members if provided
    if (updateIsiboDto.newMembers && updateIsiboDto.newMembers.length > 0) {
      const newMemberIds = await this.createCitizensAndGetIds(
        updateIsiboDto.newMembers,
        updateIsiboDto.villageId || isibo.village.id,
        savedIsibo.id
      );
      allMemberIds = [...allMemberIds, ...newMemberIds];
    }

    // Update members if any changes were made
    if (updateIsiboDto.existingMemberIds !== undefined || updateIsiboDto.newMembers !== undefined) {
      await this.assignMembersToIsibo(savedIsibo.id, allMemberIds);
    }

    return this.findIsiboById(savedIsibo.id);
  }

  async deleteIsibo(id: string): Promise<void> {
    const isibo = await this.isiboRepository.findOne({
      where: { id },
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

    // If there's a leader, remove the isibo leader flag
    if (isibo.leader) {
      isibo.leader.isIsiboLeader = false;
      await this.usersService.saveProfile(isibo.leader);
    }

    await this.isiboRepository.softDelete(id);
  }

  async findAllIsibos(dto: FetchIsiboDto.Input): Promise<FetchIsiboDto.Output> {
    const queryBuilder = this.isiboRepository
      .createQueryBuilder("isibo")
      .leftJoinAndSelect("isibo.leader", "leader")
      .leftJoin("isibo.village", "village")
      .where("village.id = :villageId", { villageId: dto.villageId });

    if (dto.q) {
      queryBuilder.andWhere("isibo.name ILIKE :search", {
        search: `%${dto.q.toUpperCase()}%`,
      });
    }

    return paginate(queryBuilder, {
      page: dto.page,
      limit: dto.size,
    });
  }

  async findIsiboById(id: string): Promise<Isibo> {
    const isibo = await this.isiboRepository.findOne({
      where: { id },
      relations: ["leader", "village", "members", "members.user"],
    });

    if (!isibo) {
      throw new NotFoundException("Isibo not found");
    }

    return isibo;
  }

  async assignMembersToIsibo(isiboId: string, memberIds: string[]): Promise<void> {
    // First, remove all current members from this isibo
    await this.usersService.removeIsiboFromProfiles(isiboId);

    // Then assign new members if any
    if (memberIds.length > 0) {
      // Validate that all member IDs exist and are citizens
      const profiles = await this.usersService.findProfilesByIds(memberIds);

      if (profiles.length !== memberIds.length) {
        throw new NotFoundException("One or more member profiles not found");
      }

      // Check that all users have CITIZEN role
      const nonCitizens = profiles.filter((profile) => profile.user.role !== UserRole.CITIZEN);
      if (nonCitizens.length > 0) {
        throw new BadRequestException("All members must have CITIZEN role");
      }

      // Assign members to isibo
      await this.usersService.assignProfilesToIsibo(memberIds, isiboId);
    }
  }

  async assignIsiboLeader(id: string, userId: string): Promise<Isibo> {
    const isibo = await this.isiboRepository.findOne({
      where: { id },
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

    // Check if isibo already has a leader
    if (isibo.hasLeader) {
      throw new ConflictException("This isibo already has a leader");
    }

    // Find the user to be assigned as leader
    const leaderUser = await this.usersService.findUserById(userId);
    if (!leaderUser) {
      throw new NotFoundException("User not found");
    }

    // Update the user's role to ISIBO_LEADER
    leaderUser.role = UserRole.ISIBO_LEADER;
    leaderUser.profile.isIsiboLeader = true;
    await this.usersService.saveUser(leaderUser);
    await this.usersService.saveProfile(leaderUser.profile);

    // Set the isibo's leader
    isibo.leader = leaderUser.profile;
    isibo.hasLeader = true;
    isibo.leaderId = userId;

    return this.isiboRepository.save(isibo);
  }

  async removeIsiboLeader(id: string): Promise<Isibo> {
    const isibo = await this.isiboRepository.findOne({
      where: { id },
      relations: [
        "leader",
        "leader.user",
        "village",
        "village.profiles",
        "village.cell",
        "village.cell.profiles",
      ],
    });

    if (!isibo) {
      throw new NotFoundException("Isibo not found");
    }

    // Check if isibo has a leader
    if (!isibo.hasLeader) {
      throw new NotFoundException("This isibo does not have a leader");
    }

    // Get the leader user
    if (!isibo.leader || !isibo.leader.user) {
      throw new NotFoundException("Isibo leader user not found");
    }

    const leaderUser = isibo.leader.user;

    // Update the user's role back to CITIZEN
    leaderUser.role = UserRole.CITIZEN;
    leaderUser.profile.isIsiboLeader = false;
    await this.usersService.saveUser(leaderUser);
    await this.usersService.saveProfile(leaderUser.profile);

    // Remove the leader from the isibo
    isibo.leader = null;
    isibo.hasLeader = false;
    isibo.leaderId = null;

    return this.isiboRepository.save(isibo);
  }

  /**
   * Create citizens from citizen data and return their profile IDs
   * @param citizens Array of citizen data
   * @param villageId Village ID for the citizens
   * @param isiboId Isibo ID to assign citizens to
   * @returns Array of created profile IDs
   */
  private async createCitizensAndGetIds(
    citizens: Citizen[],
    villageId: string,
    isiboId: string
  ): Promise<string[]> {
    const profileIds: string[] = [];

    // Get village and cell information
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
        const existingUser = await this.usersService.findUserByEmail(citizen.email);
        if (existingUser) {
          throw new ConflictException(`User with email ${citizen.email} already exists`);
        }

        // Create citizen using the users service
        const citizenData: CreateCitizenDTO.Input = {
          names: citizen.names,
          email: citizen.email,
          phone: citizen.phone,
          cellId: village.cell.id,
          villageId: villageId,
          isiboId: isiboId,
        };

        await this.usersService.createCitizen(citizenData);

        // Get the created user to get their profile ID
        const createdUser = await this.usersService.findUserByEmail(citizen.email);
        if (createdUser && createdUser.profile) {
          profileIds.push(createdUser.profile.id);
        }
      } catch (error) {
        // If citizen creation fails, we should handle it appropriately
        console.error(`Failed to create citizen ${citizen.email}:`, error);
        throw new BadRequestException(`Failed to create citizen ${citizen.email}: ${error.message}`);
      }
    }

    return profileIds;
  }
}
