import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Brackets } from "typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { Village } from "./entities/village.entity";
import { Cell } from "./entities/cell.entity";
import { House } from "./entities/house.entity";
import { Isibo } from "./entities/isibo.entity";
import { Province } from "./entities/province.entity";
import { District } from "./entities/district.entity";
import { Sector } from "./entities/sector.entity";
import { SearchLocationsDto, LocationType } from "./dto/search-locations.dto";

@Injectable()
export class SearchLocationsService {
  constructor(
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(Isibo)
    private readonly isiboRepository: Repository<Isibo>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
  ) {}

  async searchLocations(dto: SearchLocationsDto.Input): Promise<SearchLocationsDto.Output> {
    const results: SearchLocationsDto.LocationSearchResult[] = [];
    const typesToSearch = dto.types || (dto.type ? [dto.type] : Object.values(LocationType));

    // Search each location type
    for (const type of typesToSearch) {
      switch (type) {
        case LocationType.PROVINCE:
          results.push(...await this.searchProvinces(dto));
          break;
        case LocationType.DISTRICT:
          results.push(...await this.searchDistricts(dto));
          break;
        case LocationType.SECTOR:
          results.push(...await this.searchSectors(dto));
          break;
        case LocationType.CELL:
          results.push(...await this.searchCells(dto));
          break;
        case LocationType.VILLAGE:
          results.push(...await this.searchVillages(dto));
          break;
        case LocationType.HOUSE:
          results.push(...await this.searchHouses(dto));
          break;
        case LocationType.ISIBO:
          results.push(...await this.searchIsibos(dto));
          break;
      }
    }

    // Sort by relevance and apply pagination
    const sortedResults = results.sort((a, b) => {
      if (dto.q) {
        const aScore = this.calculateRelevanceScore(dto.q, a.name);
        const bScore = this.calculateRelevanceScore(dto.q, b.name);
        return bScore - aScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const startIndex = (dto.page - 1) * dto.size;
    const endIndex = startIndex + dto.size;
    const paginatedResults = sortedResults.slice(startIndex, endIndex);

    return {
      items: paginatedResults,
      meta: {
        totalItems: results.length,
        itemCount: paginatedResults.length,
        itemsPerPage: dto.size,
        totalPages: Math.ceil(results.length / dto.size),
        currentPage: dto.page,
      },
    };
  }

  private async searchProvinces(dto: SearchLocationsDto.Input): Promise<SearchLocationsDto.LocationSearchResult[]> {
    const queryBuilder = this.provinceRepository.createQueryBuilder("province");

    if (dto.q) {
      queryBuilder.where("province.name ILIKE :searchKey", {
        searchKey: `%${dto.q}%`,
      });
    }

    this.applyCommonFilters(queryBuilder, dto, "province");

    const provinces = await queryBuilder.limit(50).getMany();

    return provinces.map(province => ({
      id: province.id,
      name: province.name,
      type: LocationType.PROVINCE,
      description: `Province with ${province.districts?.length || 0} districts`,
      childrenCount: province.districts?.length || 0,
      createdAt: province.createdAt,
      updatedAt: province.updatedAt,
    }));
  }

  private async searchDistricts(dto: SearchLocationsDto.Input): Promise<SearchLocationsDto.LocationSearchResult[]> {
    const queryBuilder = this.districtRepository
      .createQueryBuilder("district")
      .leftJoinAndSelect("district.province", "province");

    if (dto.q) {
      queryBuilder.where("district.name ILIKE :searchKey", {
        searchKey: `%${dto.q}%`,
      });
    }

    this.applyCommonFilters(queryBuilder, dto, "district");

    const districts = await queryBuilder.limit(50).getMany();

    return districts.map(district => ({
      id: district.id,
      name: district.name,
      type: LocationType.DISTRICT,
      description: `District in ${district.province?.name}`,
      parentLocation: district.province ? {
        id: district.province.id,
        name: district.province.name,
        type: LocationType.PROVINCE,
      } : undefined,
      childrenCount: district.sectors?.length || 0,
      createdAt: district.createdAt,
      updatedAt: district.updatedAt,
    }));
  }

  private async searchSectors(dto: SearchLocationsDto.Input): Promise<SearchLocationsDto.LocationSearchResult[]> {
    const queryBuilder = this.sectorRepository
      .createQueryBuilder("sector")
      .leftJoinAndSelect("sector.district", "district")
      .leftJoinAndSelect("district.province", "province");

    if (dto.q) {
      queryBuilder.where("sector.name ILIKE :searchKey", {
        searchKey: `%${dto.q}%`,
      });
    }

    this.applyCommonFilters(queryBuilder, dto, "sector");

    const sectors = await queryBuilder.limit(50).getMany();

    return sectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      type: LocationType.SECTOR,
      description: `Sector in ${sector.district?.name}`,
      parentLocation: sector.district ? {
        id: sector.district.id,
        name: sector.district.name,
        type: LocationType.DISTRICT,
      } : undefined,
      childrenCount: sector.cells?.length || 0,
      createdAt: sector.createdAt,
      updatedAt: sector.updatedAt,
    }));
  }

  private async searchCells(dto: SearchLocationsDto.Input): Promise<SearchLocationsDto.LocationSearchResult[]> {
    const queryBuilder = this.cellRepository
      .createQueryBuilder("cell")
      .leftJoinAndSelect("cell.sector", "sector");

    if (dto.q) {
      queryBuilder.where("cell.name ILIKE :searchKey", {
        searchKey: `%${dto.q}%`,
      });
    }

    this.applyCommonFilters(queryBuilder, dto, "cell");

    const cells = await queryBuilder.limit(50).getMany();

    return cells.map(cell => ({
      id: cell.id,
      name: cell.name,
      type: LocationType.CELL,
      description: `Cell in ${cell.sector?.name}`,
      parentLocation: cell.sector ? {
        id: cell.sector.id,
        name: cell.sector.name,
        type: LocationType.SECTOR,
      } : undefined,
      childrenCount: cell.villages?.length || 0,
      createdAt: cell.createdAt,
      updatedAt: cell.updatedAt,
    }));
  }

  private async searchVillages(dto: SearchLocationsDto.Input): Promise<SearchLocationsDto.LocationSearchResult[]> {
    const queryBuilder = this.villageRepository
      .createQueryBuilder("village")
      .leftJoinAndSelect("village.cell", "cell");

    if (dto.q) {
      queryBuilder.where("village.name ILIKE :searchKey", {
        searchKey: `%${dto.q}%`,
      });
    }

    this.applyCommonFilters(queryBuilder, dto, "village");

    const villages = await queryBuilder.limit(50).getMany();

    return villages.map(village => ({
      id: village.id,
      name: village.name,
      type: LocationType.VILLAGE,
      description: `Village in ${village.cell?.name}`,
      parentLocation: village.cell ? {
        id: village.cell.id,
        name: village.cell.name,
        type: LocationType.CELL,
      } : undefined,
      childrenCount: 0, // We'll calculate this differently if needed
      createdAt: village.createdAt,
      updatedAt: village.updatedAt,
    }));
  }

  private async searchHouses(dto: SearchLocationsDto.Input): Promise<SearchLocationsDto.LocationSearchResult[]> {
    const queryBuilder = this.houseRepository
      .createQueryBuilder("house")
      .leftJoinAndSelect("house.isibo", "isibo")
      .leftJoinAndSelect("isibo.village", "village")
      .leftJoinAndSelect("house.members", "members");

    if (dto.q) {
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("house.code ILIKE :searchKey", {
            searchKey: `%${dto.q}%`,
          }).orWhere("house.address ILIKE :searchKey", {
            searchKey: `%${dto.q}%`,
          });
        }),
      );
    }

    this.applyCommonFilters(queryBuilder, dto, "house");

    const houses = await queryBuilder.limit(50).getMany();

    return houses.map(house => ({
      id: house.id,
      name: house.code,
      type: LocationType.HOUSE,
      description: `House at ${house.address} in ${house.isibo?.village?.name}`,
      population: house.members?.length || 0,
      parentLocation: house.isibo?.village ? {
        id: house.isibo.village.id,
        name: house.isibo.village.name,
        type: LocationType.VILLAGE,
      } : undefined,
      childrenCount: house.members?.length || 0,
      createdAt: house.createdAt,
      updatedAt: house.updatedAt,
    }));
  }

  private async searchIsibos(dto: SearchLocationsDto.Input): Promise<SearchLocationsDto.LocationSearchResult[]> {
    const queryBuilder = this.isiboRepository
      .createQueryBuilder("isibo")
      .leftJoinAndSelect("isibo.village", "village")
      .leftJoinAndSelect("isibo.leader", "leader")
      .leftJoinAndSelect("isibo.houses", "houses");

    if (dto.q) {
      queryBuilder.where("isibo.name ILIKE :searchKey", {
        searchKey: `%${dto.q}%`,
      });
    }

    this.applyCommonFilters(queryBuilder, dto, "isibo");

    const isibos = await queryBuilder.limit(50).getMany();

    return isibos.map(isibo => ({
      id: isibo.id,
      name: isibo.name,
      type: LocationType.ISIBO,
      description: `Isibo in ${isibo.village?.name}`,
      population: isibo.houses?.reduce((sum, house) => sum + (house.members?.length || 0), 0) || 0,
      parentLocation: isibo.village ? {
        id: isibo.village.id,
        name: isibo.village.name,
        type: LocationType.VILLAGE,
      } : undefined,
      leader: isibo.leader ? {
        id: isibo.leader.id,
        names: isibo.leader.names,
        role: isibo.leader.role,
      } : undefined,
      childrenCount: isibo.houses?.length || 0,
      createdAt: isibo.createdAt,
      updatedAt: isibo.updatedAt,
    }));
  }

  private applyCommonFilters(queryBuilder: any, dto: SearchLocationsDto.Input, entityAlias: string): void {
    // Apply date filters
    if (dto.createdFrom) {
      queryBuilder.andWhere(`${entityAlias}.createdAt >= :createdFrom`, {
        createdFrom: dto.createdFrom,
      });
    }

    if (dto.createdTo) {
      queryBuilder.andWhere(`${entityAlias}.createdAt <= :createdTo`, {
        createdTo: dto.createdTo,
      });
    }

    if (dto.startDate) {
      queryBuilder.andWhere(`${entityAlias}.createdAt >= :startDate`, {
        startDate: dto.startDate,
      });
    }

    if (dto.endDate) {
      queryBuilder.andWhere(`${entityAlias}.createdAt <= :endDate`, {
        endDate: dto.endDate,
      });
    }

    // Apply population filters
    if (dto.minPopulation !== undefined) {
      queryBuilder.andWhere(`${entityAlias}.population >= :minPopulation`, {
        minPopulation: dto.minPopulation,
      });
    }

    if (dto.maxPopulation !== undefined) {
      queryBuilder.andWhere(`${entityAlias}.population <= :maxPopulation`, {
        maxPopulation: dto.maxPopulation,
      });
    }
  }

  private calculateRelevanceScore(query: string, name: string): number {
    const queryLower = query.toLowerCase();
    const nameLower = name.toLowerCase();

    if (nameLower === queryLower) return 100;
    if (nameLower.startsWith(queryLower)) return 80;
    if (nameLower.includes(queryLower)) return 60;
    
    // Check for partial word matches
    const queryWords = queryLower.split(' ');
    const nameWords = nameLower.split(' ');
    
    let score = 0;
    queryWords.forEach(queryWord => {
      nameWords.forEach(nameWord => {
        if (nameWord.includes(queryWord)) {
          score += 20;
        }
      });
    });

    return score;
  }
}
