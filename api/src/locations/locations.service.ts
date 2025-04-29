import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cell } from "./entities/cell.entity";
import { Village } from "./entities/village.entity";
import { CreateCellDto } from "./dto/create-cell.dto";
import { CreateVillageDto } from "./dto/create-village.dto";
import { User } from "../users/entities/user.entity";
import { UserRole } from "../__shared__/enums/user-role.enum";
import { UpdateCellDto } from "./dto/update-cell.dto";
import { UpdateVillageDto } from "./dto/update-village.dto";
import { UsersService } from "../users/users.service";
import { In } from "typeorm";
import { FetchCellDto } from "./dto/fetch-cell.dto";
import { FetchVillageDto } from "./dto/fetch-village.dto";
import { paginate } from "nestjs-typeorm-paginate";
import { Like } from "typeorm";

@Injectable()
export class LocationsService {
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
    if (!villageNames || villageNames.length === 0) return;

    const existingVillages = await this.villageRepository.find({
      where: {
        cell: { id: cellId },
        villageName: In(villageNames),
      },
    });

    if (existingVillages.length > 0) {
      const duplicateNames = existingVillages.map((v) => v.villageName);
      throw new ConflictException(
        `Villages with names [${duplicateNames.join(", ")}] already exist in this cell`,
      );
    }
  }

  private async validateCellName(
    cellName: string,
    excludeCellId?: string,
  ): Promise<void> {
    const query = this.cellRepository
      .createQueryBuilder("cell")
      .where("cell.cellName = :cellName", { cellName });

    if (excludeCellId) {
      query.andWhere("cell.id != :excludeCellId", { excludeCellId });
    }

    const existingCell = await query.getOne();

    if (existingCell) {
      throw new ConflictException(
        `Cell with name "${cellName}" already exists`,
      );
    }
  }

  // Cell operations
  async createCell(
    createCellDto: CreateCellDto.Input,
    user: User,
  ): Promise<Cell> {
    // Validate cell name uniqueness
    await this.validateCellName(createCellDto.cellName);

    // Validate cellLeaderId if provided
    if (createCellDto.cellLeaderId) {
      const leader = await this.usersService.findUserById(
        createCellDto.cellLeaderId,
      );
      if (!leader) {
        throw new NotFoundException("Cell leader not found");
      }
    }

    const cell = this.cellRepository.create({
      cellName: createCellDto.cellName,
    });

    const savedCell = await this.cellRepository.save(cell);

    // Create villages if provided
    if (createCellDto.villages && createCellDto.villages.length > 0) {
      // Validate village names before creating
      await this.validateVillageNames(savedCell.id, createCellDto.villages);

      for (const villageName of createCellDto.villages) {
        const village = this.villageRepository.create({
          villageName,
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
    user: User,
  ): Promise<Cell> {
    const cell = await this.cellRepository.findOne({
      where: { id },
      relations: ["profiles"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    // Check if user is the cell leader
    const isCellLeader = cell.profiles.some(
      (profile) => profile.isCellLeader && profile.user.id === user.id,
    );

    if (!isCellLeader) {
      throw new ForbiddenException("You can only update your own cell");
    }

    // Validate cell name uniqueness if being updated
    if (updateCellDto.cellName) {
      await this.validateCellName(updateCellDto.cellName, id);
    }

    // Validate cellLeaderId if provided
    if (updateCellDto.cellLeaderId) {
      const leader = await this.usersService.findUserById(
        updateCellDto.cellLeaderId,
      );
      if (!leader) {
        throw new NotFoundException("Cell leader not found");
      }
    }

    // If updating village names, validate them
    if (updateCellDto.villageIds && updateCellDto.villageIds.length > 0) {
      const villages = await this.villageRepository.find({
        where: { id: In(updateCellDto.villageIds) },
      });
      const villageNames = villages.map((v) => v.villageName);
      await this.validateVillageNames(cell.id, villageNames);
    }

    Object.assign(cell, updateCellDto);
    return this.cellRepository.save(cell);
  }

  async deleteCell(id: string, user: User): Promise<void> {
    const cell = await this.cellRepository.findOne({
      where: { id },
      relations: ["profiles"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    // Check if user is the cell leader
    const isCellLeader = cell.profiles.some(
      (profile) => profile.isCellLeader && profile.user.id === user.id,
    );

    if (!isCellLeader) {
      throw new ForbiddenException("You can only delete your own cell");
    }

    await this.cellRepository.softDelete(id);
  }

  // Village operations
  async createVillage(
    createVillageDto: CreateVillageDto.Input,
    user: User,
  ): Promise<Village> {
    // Validate cellId
    const cell = await this.cellRepository.findOne({
      where: { id: createVillageDto.cellId },
      relations: ["profiles"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    // Check if user is the cell leader
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

    // Validate village name uniqueness within the cell
    await this.validateVillageNames(createVillageDto.cellId, [
      createVillageDto.villageName,
    ]);

    const village = this.villageRepository.create({
      villageName: createVillageDto.villageName,
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

    // Validate villageLeaderId if provided
    if (updateVillageDto.villageLeaderId) {
      const leader = await this.usersService.findUserById(
        updateVillageDto.villageLeaderId,
      );
      if (!leader) {
        throw new NotFoundException("Village leader not found");
      }
    }

    // Validate cellId if provided
    if (updateVillageDto.cellId) {
      const cell = await this.cellRepository.findOne({
        where: { id: updateVillageDto.cellId },
      });
      if (!cell) {
        throw new NotFoundException("Cell not found");
      }
    }

    // If updating village name, validate uniqueness within the cell
    if (updateVillageDto.villageName) {
      const cellId = updateVillageDto.cellId || village.cell.id;
      await this.validateVillageNames(cellId, [updateVillageDto.villageName]);
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

  async findAllCells(dto: FetchCellDto.Input): Promise<FetchCellDto.Output> {
    const queryBuilder = this.cellRepository
      .createQueryBuilder("cell")
      .leftJoinAndSelect("cell.cellLeader", "cellLeader");

    if (dto.q) {
      queryBuilder.where("cell.cellName ILIKE :search", {
        search: `%${dto.q}%`,
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
      relations: ["villages"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    return cell;
  }

  async findAllVillages(
    dto: FetchVillageDto.Input,
  ): Promise<FetchVillageDto.Output> {
    const queryBuilder = this.villageRepository
      .createQueryBuilder("village")
      .leftJoin("village.cell", "cell")
      .where("cell.id = :cellId", { cellId: dto.cellId });

    if (dto.q) {
      queryBuilder.andWhere("village.villageName ILIKE :search", {
        search: `%${dto.q}%`,
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
}
