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
import { CreateHouseDto } from "./dto/create-house.dto";
import { FetchHouseDto } from "./dto/fetch-house.dto";
import { UpdateHouseDto } from "./dto/update-house.dto";
import { House } from "./entities/house.entity";
import { Isibo } from "./entities/isibo.entity";

@Injectable()
export class HousesService {
  constructor(
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

  async createHouse(
    createHouseDto: CreateHouseDto.Input,
    user: User,
  ): Promise<House> {
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

    // Check if user is the isibo leader, village leader, cell leader, or admin
    const isIsiboLeader = isibo.leader && isibo.leader.user.id === user.id;
    const isVillageLeader = isibo.village.profiles.some(
      (profile) => profile.isVillageLeader && profile.user.id === user.id,
    );
    const isCellLeader = isibo.village.cell.profiles.some(
      (profile) => profile.isCellLeader && profile.user.id === user.id,
    );

    if (
      !isIsiboLeader &&
      !isVillageLeader &&
      !isCellLeader &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        "You can only create houses in your own isibo",
      );
    }

    // Validate representativeId if provided
    let representative = null;
    if (createHouseDto.representativeId) {
      const user = await this.usersService.findUserById(
        createHouseDto.representativeId,
      );
      if (!user) {
        throw new NotFoundException("Representative not found");
      }
      representative = user.profile;
    }

    // Validate house code uniqueness within the isibo
    await this.validateHouseCode(createHouseDto.isiboId, createHouseDto.code);

    const house = this.houseRepository.create({
      code: createHouseDto.code,
      street: createHouseDto.street,
      representative,
      isibo: { id: createHouseDto.isiboId },
    });

    return this.houseRepository.save(house);
  }

  async updateHouse(
    id: string,
    updateHouseDto: UpdateHouseDto.Input,
    user: User,
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

    // Check if user is the isibo leader, village leader, cell leader, or admin
    const isIsiboLeader =
      house.isibo.leader && house.isibo.leader.user.id === user.id;
    const isVillageLeader = house.isibo.village.profiles.some(
      (profile) => profile.isVillageLeader && profile.user.id === user.id,
    );
    const isCellLeader = house.isibo.village.cell.profiles.some(
      (profile) => profile.isCellLeader && profile.user.id === user.id,
    );
    const isRepresentative =
      house.representative && house.representative.user.id === user.id;

    if (
      !isIsiboLeader &&
      !isVillageLeader &&
      !isCellLeader &&
      !isRepresentative &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        "You can only update houses you represent or are in your isibo",
      );
    }

    // If updating house code, validate uniqueness within the isibo
    if (updateHouseDto.code && updateHouseDto.code !== house.code) {
      await this.validateHouseCode(house.isibo.id, updateHouseDto.code);
    }

    // If updating isiboId, validate it
    if (updateHouseDto.isiboId && updateHouseDto.isiboId !== house.isibo.id) {
      const newIsibo = await this.isiboRepository.findOne({
        where: { id: updateHouseDto.isiboId },
      });
      if (!newIsibo) {
        throw new NotFoundException("New isibo not found");
      }
      // Validate house code uniqueness in the new isibo
      await this.validateHouseCode(
        updateHouseDto.isiboId,
        updateHouseDto.code || house.code,
      );
    }

    // If updating representativeId, validate it
    if (updateHouseDto.representativeId) {
      const user = await this.usersService.findUserById(
        updateHouseDto.representativeId,
      );
      if (!user) {
        throw new NotFoundException("Representative not found");
      }
      house.representative = user.profile;
    }

    // Update the house
    if (updateHouseDto.code) {
      house.code = updateHouseDto.code;
    }
    if (updateHouseDto.street) {
      house.street = updateHouseDto.street;
    }
    if (updateHouseDto.isiboId) {
      house.isibo = { id: updateHouseDto.isiboId } as Isibo;
    }

    return this.houseRepository.save(house);
  }

  async deleteHouse(id: string, user: User): Promise<void> {
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

    // Check if user is the isibo leader, village leader, cell leader, or admin
    const isIsiboLeader =
      house.isibo.leader && house.isibo.leader.user.id === user.id;
    const isVillageLeader = house.isibo.village.profiles.some(
      (profile) => profile.isVillageLeader && profile.user.id === user.id,
    );
    const isCellLeader = house.isibo.village.cell.profiles.some(
      (profile) => profile.isCellLeader && profile.user.id === user.id,
    );
    const isRepresentative =
      house.representative && house.representative.user.id === user.id;

    if (
      !isIsiboLeader &&
      !isVillageLeader &&
      !isCellLeader &&
      !isRepresentative &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        "You can only delete houses you represent or are in your isibo",
      );
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

  async assignHouseRepresentative(
    id: string,
    userId: string,
    user: User,
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

    // Check if user is the isibo leader, village leader, cell leader, or admin
    const isIsiboLeader =
      house.isibo.leader && house.isibo.leader.user.id === user.id;
    const isVillageLeader = house.isibo.village.profiles.some(
      (profile) => profile.isVillageLeader && profile.user.id === user.id,
    );
    const isCellLeader = house.isibo.village.cell.profiles.some(
      (profile) => profile.isCellLeader && profile.user.id === user.id,
    );

    if (
      !isIsiboLeader &&
      !isVillageLeader &&
      !isCellLeader &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        "You can only assign representatives to houses in your isibo, village, or cell",
      );
    }

    // Check if house already has a representative
    if (house.hasLeader) {
      throw new ConflictException("This house already has a representative");
    }

    // Find the user to be assigned as representative
    const representativeUser = await this.usersService.findUserById(userId);
    if (!representativeUser) {
      throw new NotFoundException("User not found");
    }

    // Update the user's role to HOUSE_REPRESENTATIVE
    representativeUser.role = UserRole.HOUSE_REPRESENTATIVE;
    await this.usersService.saveUser(representativeUser);

    // Set the house's representative
    house.representative = representativeUser.profile;
    house.hasLeader = true;
    house.leaderId = userId;

    return this.houseRepository.save(house);
  }

  async removeHouseRepresentative(id: string, user: User): Promise<House> {
    const house = await this.houseRepository.findOne({
      where: { id },
      relations: [
        "representative",
        "representative.user",
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

    // Check if user is the isibo leader, village leader, cell leader, or admin
    const isIsiboLeader =
      house.isibo.leader && house.isibo.leader.user.id === user.id;
    const isVillageLeader = house.isibo.village.profiles.some(
      (profile) => profile.isVillageLeader && profile.user.id === user.id,
    );
    const isCellLeader = house.isibo.village.cell.profiles.some(
      (profile) => profile.isCellLeader && profile.user.id === user.id,
    );
    const isRepresentative =
      house.representative && house.representative.user.id === user.id;

    if (
      !isIsiboLeader &&
      !isVillageLeader &&
      !isCellLeader &&
      !isRepresentative &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        "You can only remove representatives from houses in your isibo, village, or cell",
      );
    }

    // Check if house has a representative
    if (!house.hasLeader) {
      throw new NotFoundException("This house does not have a representative");
    }

    // Get the representative user
    const representativeUser = house.representative.user;

    // Update the user's role back to CITIZEN
    representativeUser.role = UserRole.CITIZEN;
    await this.usersService.saveUser(representativeUser);

    // Remove the representative from the house
    house.representative = null;
    house.hasLeader = false;
    house.leaderId = null;

    return this.houseRepository.save(house);
  }
}
