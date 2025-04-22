import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cell } from "./entities/cell.entity";
import { Village } from "./entities/village.entity";
import { CellDto } from "./dto/cell.dto";
import { VillageDto } from "./dto/village.dto";
import { User } from "../users/entities/user.entity";
import { UserRole } from "../__shared__/enums/user-role.enum";

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
  ) {}

  // Cell operations
  async createCell(createCellDto: CellDto.Create, user: User): Promise<Cell> {
    if (user.role !== UserRole.CELL_LEADER) {
      throw new ForbiddenException("Only cell leaders can create cells");
    }

    const cell = this.cellRepository.create({
      ...createCellDto,
      cellLeader: { id: createCellDto.cellLeaderId },
    });
    return this.cellRepository.save(cell);
  }

  async updateCell(
    id: string,
    updateCellDto: CellDto.Update,
    user: User,
  ): Promise<Cell> {
    const cell = await this.cellRepository.findOne({
      where: { id },
      relations: ["cellLeader"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    if (
      user.role !== UserRole.CELL_LEADER ||
      cell.cellLeader.id !== user.profile.id
    ) {
      throw new ForbiddenException("You can only update your own cell");
    }

    Object.assign(cell, updateCellDto);
    return this.cellRepository.save(cell);
  }

  async deleteCell(id: string, user: User): Promise<void> {
    const cell = await this.cellRepository.findOne({
      where: { id },
      relations: ["cellLeader"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    if (
      user.role !== UserRole.CELL_LEADER ||
      cell.cellLeader.id !== user.profile.id
    ) {
      throw new ForbiddenException("You can only delete your own cell");
    }

    await this.cellRepository.softDelete(id);
  }

  // Village operations
  async createVillage(
    createVillageDto: VillageDto.Create,
    user: User,
  ): Promise<Village> {
    if (
      user.role !== UserRole.VILLAGE_LEADER &&
      user.role !== UserRole.CELL_LEADER
    ) {
      throw new ForbiddenException(
        "Only village leaders and cell leaders can create villages",
      );
    }

    const cell = await this.cellRepository.findOne({
      where: { id: createVillageDto.cellId },
      relations: ["cellLeader"],
    });

    if (!cell) {
      throw new NotFoundException("Cell not found");
    }

    if (
      user.role === UserRole.CELL_LEADER &&
      cell.cellLeader.id !== user.profile.id
    ) {
      throw new ForbiddenException(
        "You can only create villages in your own cell",
      );
    }

    const village = this.villageRepository.create({
      ...createVillageDto,
      villageLeader: { id: createVillageDto.villageLeaderId },
      cell: { id: createVillageDto.cellId },
    });
    return this.villageRepository.save(village);
  }

  async updateVillage(
    id: string,
    updateVillageDto: VillageDto.Update,
    user: User,
  ): Promise<Village> {
    const village = await this.villageRepository.findOne({
      where: { id },
      relations: ["villageLeader", "cell", "cell.cellLeader"],
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    const isVillageLeader =
      user.role === UserRole.VILLAGE_LEADER &&
      village.villageLeader.id === user.profile.id;
    const isCellLeader =
      user.role === UserRole.CELL_LEADER &&
      village.cell.cellLeader.id === user.profile.id;

    if (!isVillageLeader && !isCellLeader) {
      throw new ForbiddenException(
        "You can only update villages you lead or are in your cell",
      );
    }

    Object.assign(village, updateVillageDto);
    return this.villageRepository.save(village);
  }

  async deleteVillage(id: string, user: User): Promise<void> {
    const village = await this.villageRepository.findOne({
      where: { id },
      relations: ["villageLeader", "cell", "cell.cellLeader"],
    });

    if (!village) {
      throw new NotFoundException("Village not found");
    }

    const isVillageLeader =
      user.role === UserRole.VILLAGE_LEADER &&
      village.villageLeader.id === user.profile.id;
    const isCellLeader =
      user.role === UserRole.CELL_LEADER &&
      village.cell.cellLeader.id === user.profile.id;

    if (!isVillageLeader && !isCellLeader) {
      throw new ForbiddenException(
        "You can only delete villages you lead or are in your cell",
      );
    }

    await this.villageRepository.softDelete(id);
  }
}
