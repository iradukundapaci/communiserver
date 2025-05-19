import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { In, Repository } from "typeorm";
import { UsersService } from "../users/users.service";
import { CreateCellDto } from "./dto/create-cell.dto";
import { FetchCellDto } from "./dto/fetch-cell.dto";
import { UpdateCellDto } from "./dto/update-cell.dto";
import { Cell } from "./entities/cell.entity";
import { Village } from "./entities/village.entity";

@Injectable()
export class CellsService {
  constructor(
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
    private readonly usersService: UsersService,
  ) {}

  private async validateCellName(cellName: string): Promise<void> {
    const uppercaseCellName = cellName.toUpperCase();
    const existingCell = await this.cellRepository.findOne({
      where: { name: uppercaseCellName },
    });
    if (existingCell) {
      throw new ConflictException(
        `Cell with name ${uppercaseCellName} already exists`,
      );
    }
  }

  private async validateVillageNames(
    cellId: string,
    villageNames: string[],
  ): Promise<void> {
    const existingVillages = await this.villageRepository.find({
      where: { cell: { id: cellId } },
    });

    const existingVillageNames = existingVillages.map((v) => v.name);
    const duplicateNames = villageNames.filter((name) =>
      existingVillageNames.includes(name),
    );

    if (duplicateNames.length > 0) {
      throw new ConflictException(
        `Villages with names ${duplicateNames.join(", ")} already exist in this cell`,
      );
    }
  }

  async createCell(createCellDto: CreateCellDto.Input): Promise<Cell> {
    const cellName = createCellDto.name;
    await this.validateCellName(cellName);

    const cell = this.cellRepository.create({
      name: cellName.toUpperCase(),
    });

    const savedCell = await this.cellRepository.save(cell);

    if (createCellDto.villages && createCellDto.villages.length > 0) {
      await this.validateVillageNames(savedCell.id, createCellDto.villages);

      for (const villageName of createCellDto.villages) {
        const village = this.villageRepository.create({
          name: villageName.toUpperCase(),
          cell: { id: savedCell.id },
        });
        await this.villageRepository.save(village);
      }
    }

    return savedCell;
  }

  async updateCell(
    id: string,
    updateCellDto: UpdateCellDto.Input,
  ): Promise<Cell> {
    const cell = await this.cellRepository.findOne({
      where: { id },
      relations: ["profiles"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    if (updateCellDto.name) {
      const uppercaseName = updateCellDto.name.toUpperCase();
      if (uppercaseName !== cell.name) {
        await this.validateCellName(uppercaseName);
        cell.name = uppercaseName;
      }
      // Remove both properties to avoid conflicts
      delete updateCellDto.name;
      delete updateCellDto.cellName;
    }

    if (updateCellDto.cellLeaderId) {
      const leader = await this.usersService.findUserById(
        updateCellDto.cellLeaderId,
      );
      if (!leader) {
        throw new NotFoundException("Cell leader not found");
      }
    }

    if (updateCellDto.villageIds && updateCellDto.villageIds.length > 0) {
      const villages = await this.villageRepository.find({
        where: { id: In(updateCellDto.villageIds) },
      });
      const villageNames = villages.map((v) => v.name);
      await this.validateVillageNames(cell.id, villageNames);
    }

    Object.assign(cell, updateCellDto);
    return this.cellRepository.save(cell);
  }

  async deleteCell(id: string): Promise<void> {
    const cell = await this.cellRepository.findOne({
      where: { id },
      relations: ["profiles"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    await this.cellRepository.softDelete(id);
  }

  async findAllCells(dto: FetchCellDto.Input): Promise<FetchCellDto.Output> {
    const queryBuilder = this.cellRepository
      .createQueryBuilder("cell")
      .select(["cell.id", "cell.name", "cell.hasLeader", "cell.leaderId"]);

    if (dto.q) {
      queryBuilder.where("cell.name ILIKE :search", {
        search: `%${dto.q.toUpperCase()}%`,
      });
    }

    if (dto.hasLeader !== undefined) {
      queryBuilder.andWhere("cell.hasLeader = :hasLeader", {
        hasLeader: dto.hasLeader,
      });
    }

    return paginate(queryBuilder, {
      page: dto.page,
      limit: dto.size,
    });
  }

  async findCellById(id: string): Promise<Cell> {
    const cell = await this.cellRepository.findOne({
      where: { id },
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    return cell;
  }

  async assignCellLeader(cellId: string, userId: string): Promise<Cell> {
    const cell = await this.cellRepository.findOne({
      where: { id: cellId },
      relations: ["profiles"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    // Check if cell already has a leader
    if (cell.hasLeader) {
      throw new ConflictException("Cell already has a leader");
    }

    // Find the user to be assigned as leader
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Update the user's role to CELL_LEADER
    user.role = UserRole.CELL_LEADER;
    user.profile.isCellLeader = true;
    user.profile.cell = cell;
    await this.usersService.saveUser(user);
    await this.usersService.saveProfile(user.profile);

    // Update the cell with the leader information
    cell.hasLeader = true;
    cell.leaderId = userId;
    await this.cellRepository.save(cell);

    return this.findCellById(cellId);
  }

  async removeCellLeader(cellId: string): Promise<Cell> {
    const cell = await this.cellRepository.findOne({
      where: { id: cellId },
      relations: ["profiles", "profiles.user"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    // Check if cell has a leader
    if (!cell.hasLeader) {
      throw new NotFoundException("Cell does not have a leader");
    }

    // Find the cell leader
    const cellLeader = cell.profiles.find((profile) => profile.isCellLeader);
    if (!cellLeader) {
      throw new NotFoundException("Cell leader profile not found");
    }

    // Check if the profile has a user
    if (!cellLeader.user) {
      throw new NotFoundException("Cell leader user not found");
    }

    // Get the user
    const user = await this.usersService.findUserById(cellLeader.user.id);
    if (!user) {
      throw new NotFoundException("Cell leader user not found");
    }

    // Update the user's role back to CITIZEN
    user.role = UserRole.CITIZEN;
    user.profile.isCellLeader = false;
    await this.usersService.saveUser(user);
    await this.usersService.saveProfile(user.profile);

    // Update the cell to remove leader information
    cell.hasLeader = false;
    cell.leaderId = null;
    await this.cellRepository.save(cell);

    return this.findCellById(cellId);
  }
}
