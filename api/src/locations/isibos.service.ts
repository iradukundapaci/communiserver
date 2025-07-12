import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service";
import { CreateIsiboDto } from "./dto/create-isibo.dto";
import { FetchIsiboDto } from "./dto/fetch-isibo.dto";
import { UpdateIsiboDto } from "./dto/update-isibo.dto";
import { Isibo } from "./entities/isibo.entity";
import { Village } from "./entities/village.entity";

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
      relations: ["cell"],
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

      // Update the user to mark as isibo leader
      leader.isIsiboLeader = true;
      await this.usersService.saveUser(leader);
    }

    // Ensure name is uppercase
    const isiboName = createIsiboDto.name.toUpperCase();

    // Validate isibo name uniqueness within the village
    await this.validateIsiboNames(createIsiboDto.villageId, [isiboName]);

    const isibo = this.isiboRepository.create({
      name: isiboName,
      village: { id: createIsiboDto.villageId },
      leader: leader,
    });

    return this.isiboRepository.save(isibo);
  }

  async updateIsibo(
    id: string,
    updateIsiboDto: UpdateIsiboDto.Input,
  ): Promise<Isibo> {
    const isibo = await this.isiboRepository.findOne({
      where: { id },
      relations: ["leader", "village", "village.cell"],
    });

    if (!isibo) {
      throw new NotFoundException("Isibo not found");
    }

    if (updateIsiboDto.name) {
      const uppercaseName = updateIsiboDto.name.toUpperCase();
      if (uppercaseName !== isibo.name) {
        await this.validateIsiboNames(isibo.village.id, [uppercaseName]);
        updateIsiboDto.name = uppercaseName;
      }
    }

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
      await this.validateIsiboNames(updateIsiboDto.villageId, [
        updateIsiboDto.name || isibo.name,
      ]);
    }

    if (updateIsiboDto.leaderId) {
      if (isibo.leader) {
        isibo.leader.isIsiboLeader = false;
        await this.usersService.saveUser(isibo.leader);
      }

      const leader = await this.usersService.findUserById(
        updateIsiboDto.leaderId,
      );
      if (!leader) {
        throw new NotFoundException("Isibo leader not found");
      }

      // Update the user to mark as isibo leader
      leader.isIsiboLeader = true;
      await this.usersService.saveUser(leader);

      isibo.leader = leader;
    }

    // Update the isibo
    if (updateIsiboDto.name) {
      isibo.name = updateIsiboDto.name;
    }
    if (updateIsiboDto.villageId) {
      isibo.village = { id: updateIsiboDto.villageId } as Village;
    }

    return this.isiboRepository.save(isibo);
  }

  async deleteIsibo(id: string): Promise<void> {
    const isibo = await this.isiboRepository.findOne({
      where: { id },
      relations: ["leader", "village", "village.cell"],
    });

    if (!isibo) {
      throw new NotFoundException("Isibo not found");
    }

    // If there's a leader, remove the isibo leader flag
    if (isibo.leader) {
      isibo.leader.isIsiboLeader = false;
      await this.usersService.saveUser(isibo.leader);
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
      relations: ["leader", "village", "houses"],
    });

    if (!isibo) {
      throw new NotFoundException("Isibo not found");
    }

    return isibo;
  }

  async assignIsiboLeader(id: string, userId: string): Promise<Isibo> {
    const isibo = await this.isiboRepository.findOne({
      where: { id },
      relations: ["leader", "village", "village.cell"],
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
    leaderUser.isIsiboLeader = true;
    leaderUser.isibo = isibo;
    await this.usersService.saveUser(leaderUser);

    // Update the isibo with the leader information
    isibo.hasLeader = true;
    isibo.leaderId = userId;
    isibo.leader = leaderUser;
    await this.isiboRepository.save(isibo);

    return this.findIsiboById(id);
  }

  async removeIsiboLeader(id: string): Promise<Isibo> {
    const isibo = await this.isiboRepository.findOne({
      where: { id },
      relations: ["leader", "village", "village.cell"],
    });

    if (!isibo) {
      throw new NotFoundException("Isibo not found");
    }

    // Check if isibo has a leader
    if (!isibo.hasLeader) {
      throw new NotFoundException("This isibo does not have a leader");
    }

    // Find the isibo leader
    const isiboLeader = await this.usersService.findIsiboLeader(id);
    if (!isiboLeader) {
      throw new NotFoundException("Isibo leader not found");
    }

    // Update the user's role back to CITIZEN
    isiboLeader.role = UserRole.CITIZEN;
    isiboLeader.isIsiboLeader = false;
    await this.usersService.saveUser(isiboLeader);

    // Update the isibo to remove leader information
    isibo.hasLeader = false;
    isibo.leaderId = null;
    isibo.leader = null;
    await this.isiboRepository.save(isibo);

    return this.findIsiboById(id);
  }
}
