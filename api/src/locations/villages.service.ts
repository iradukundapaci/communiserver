import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { CreateVillageDto } from "./dto/create-village.dto";
import { FetchVillageDto } from "./dto/fetch-village.dto";
import { UpdateVillageDto } from "./dto/update-village.dto";
import { Cell } from "./entities/cell.entity";
import { Village } from "./entities/village.entity";

@Injectable()
export class VillagesService {
  constructor(
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
    private readonly usersService: UsersService,
  ) {}

  private async validateVillageNames(
    cellId: string,
    villageNames: string[],
  ): Promise<void> {
    const existingVillages = await this.villageRepository.find({
      where: { cell: { id: cellId } },
    });

    const existingVillageNames = existingVillages.map((v) => v.name);
    const duplicateNames = villageNames.filter((name) =>
      existingVillageNames.includes(name.toUpperCase()),
    );

    if (duplicateNames.length > 0) {
      throw new ConflictException(
        `Villages with names ${duplicateNames.join(", ")} already exist in this cell`,
      );
    }
  }

  async createVillage(
    createVillageDto: CreateVillageDto.Input,
    user: User,
  ): Promise<Village> {
    const cell = await this.cellRepository.findOne({
      where: { id: createVillageDto.cellId },
      relations: ["profiles"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    const isCellLeader = cell.profiles.some(
      (profile) => profile.isCellLeader && profile.user.id === user.id,
    );

    if (!isCellLeader) {
      throw new ForbiddenException(
        "You can only create villages in your own cell",
      );
    }

    // Validate villageLeaderId if provided
    if (createVillageDto.villageLeaderId) {
      const leader = await this.usersService.findUserById(
        createVillageDto.villageLeaderId,
      );
      if (!leader) {
        throw new NotFoundException("Village leader not found");
      }
    }

    const villageName = createVillageDto.name;

    // Validate village name uniqueness within the cell
    await this.validateVillageNames(createVillageDto.cellId, [villageName]);

    const village = this.villageRepository.create({
      name: villageName.toUpperCase(),
      cell: { id: createVillageDto.cellId },
    });
    return this.villageRepository.save(village);
  }

  async updateVillage(
    id: string,
    updateVillageDto: UpdateVillageDto.Input,
    user: User,
  ): Promise<Village> {
    const village = await this.villageRepository.findOne({
      where: { id },
      relations: ["profiles", "cell", "cell.profiles"],
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    // Check if user is the village leader or cell leader
    const isVillageLeader = village.profiles.some(
      (profile) => profile.isVillageLeader && profile.user.id === user.id,
    );
    const isCellLeader = village.cell.profiles.some(
      (profile) => profile.isCellLeader && profile.user.id === user.id,
    );

    if (!isVillageLeader && !isCellLeader) {
      throw new ForbiddenException(
        "You can only update villages you lead or are in your cell",
      );
    }

    if (updateVillageDto.name) {
      const uppercaseName = updateVillageDto.name.toUpperCase();
      if (uppercaseName !== village.name) {
        await this.validateVillageNames(village.cell.id, [uppercaseName]);
        village.name = uppercaseName;
      }
    }

    // If updating cellId, validate it
    if (
      updateVillageDto.cellId &&
      updateVillageDto.cellId !== village.cell.id
    ) {
      const newCell = await this.cellRepository.findOne({
        where: { id: updateVillageDto.cellId },
      });
      if (!newCell) {
        throw new NotFoundException("New cell not found");
      }
      // Validate village name uniqueness in the new cell
      await this.validateVillageNames(updateVillageDto.cellId, [
        updateVillageDto.name || village.name,
      ]);
    }

    // Validate villageLeaderId if provided
    if (updateVillageDto.villageLeaderId) {
      const leader = await this.usersService.findUserById(
        updateVillageDto.villageLeaderId,
      );
      if (!leader) {
        throw new NotFoundException("Village leader not found");
      }
    }

    // Update the village
    if (updateVillageDto.cellId) {
      village.cell = { id: updateVillageDto.cellId } as Cell;
      delete updateVillageDto.cellId;
    }
    Object.assign(village, updateVillageDto);

    return this.villageRepository.save(village);
  }

  async deleteVillage(id: string, user: User): Promise<void> {
    const village = await this.villageRepository.findOne({
      where: { id },
      relations: ["profiles", "cell", "cell.profiles"],
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    // Check if user is the village leader or cell leader
    const isVillageLeader = village.profiles.some(
      (profile) => profile.isVillageLeader && profile.user.id === user.id,
    );
    const isCellLeader = village.cell.profiles.some(
      (profile) => profile.isCellLeader && profile.user.id === user.id,
    );

    if (!isVillageLeader && !isCellLeader) {
      throw new ForbiddenException(
        "You can only delete villages you lead or are in your cell",
      );
    }

    await this.villageRepository.softDelete(id);
  }

  async findAllVillages(
    dto: FetchVillageDto.Input,
  ): Promise<FetchVillageDto.Output> {
    const queryBuilder = this.villageRepository
      .createQueryBuilder("village")
      .leftJoin("village.cell", "cell")
      .where("cell.id = :cellId", { cellId: dto.cellId });

    if (dto.q) {
      queryBuilder.andWhere("village.name ILIKE :search", {
        search: `%${dto.q.toUpperCase()}%`,
      });
    }

    return paginate(queryBuilder, {
      page: dto.page,
      limit: dto.size,
    });
  }

  async findVillageById(id: string): Promise<Village> {
    const village = await this.villageRepository.findOne({
      where: { id },
      relations: ["cell"],
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    return village;
  }

  async assignVillageLeader(
    villageId: string,
    userId: string,
  ): Promise<Village> {
    const village = await this.villageRepository.findOne({
      where: { id: villageId },
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    // Check if village already has a leader
    if (village.hasLeader) {
      throw new ConflictException("This village already has a leader");
    }

    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Update the user's role to VILLAGE_LEADER
    user.role = UserRole.VILLAGE_LEADER;
    user.profile.isVillageLeader = true;
    await this.usersService.saveUser(user);

    // Update the village with the leader information
    village.hasLeader = true;
    village.leaderId = userId;
    await this.villageRepository.save(village);

    return this.findVillageById(villageId);
  }

  async removeVillageLeader(villageId: string): Promise<Village> {
    const village = await this.villageRepository.findOne({
      where: { id: villageId },
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    // Check if village has a leader
    if (!village.hasLeader) {
      throw new NotFoundException("This village does not have a leader");
    }

    // Find the village leader
    const villageLeader = await this.usersService.findVillageLeader(villageId);
    if (!villageLeader) {
      throw new NotFoundException("Village leader user not found");
    }

    // Update the user's role back to CITIZEN
    villageLeader.role = UserRole.CITIZEN;
    villageLeader.profile.isVillageLeader = false;
    await this.usersService.saveUser(villageLeader);

    // Update the village to remove leader information
    village.hasLeader = false;
    village.leaderId = null;
    await this.villageRepository.save(village);

    return this.findVillageById(villageId);
  }
}
