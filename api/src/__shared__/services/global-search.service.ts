import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Brackets } from "typeorm";
import { Activity } from "../../activities/entities/activity.entity";
import { Task } from "../../activities/entities/task.entity";
import { Report } from "../../activities/entities/report.entity";
import { User } from "../../users/entities/user.entity";
import { Village } from "../../locations/entities/village.entity";
import { Cell } from "../../locations/entities/cell.entity";
import { House } from "../../locations/entities/house.entity";
import { Isibo } from "../../locations/entities/isibo.entity";
import { 
  GlobalSearchDto, 
  GlobalSearchEntity, 
  GlobalSearchResult, 
  GlobalSearchResponseDto 
} from "../dto/global-search.dto";

@Injectable()
export class GlobalSearchService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(Isibo)
    private readonly isiboRepository: Repository<Isibo>,
  ) {}

  async globalSearch(dto: GlobalSearchDto): Promise<GlobalSearchResponseDto> {
    const startTime = Date.now();
    const searchPromises: Promise<GlobalSearchResult[]>[] = [];
    const entitiesToSearch = dto.entities.includes(GlobalSearchEntity.ALL) 
      ? [GlobalSearchEntity.ACTIVITIES, GlobalSearchEntity.TASKS, GlobalSearchEntity.REPORTS, GlobalSearchEntity.USERS, GlobalSearchEntity.LOCATIONS]
      : dto.entities;

    // Search in each entity type
    if (entitiesToSearch.includes(GlobalSearchEntity.ACTIVITIES)) {
      searchPromises.push(this.searchActivities(dto));
    }
    if (entitiesToSearch.includes(GlobalSearchEntity.TASKS)) {
      searchPromises.push(this.searchTasks(dto));
    }
    if (entitiesToSearch.includes(GlobalSearchEntity.REPORTS)) {
      searchPromises.push(this.searchReports(dto));
    }
    if (entitiesToSearch.includes(GlobalSearchEntity.USERS)) {
      searchPromises.push(this.searchUsers(dto));
    }
    if (entitiesToSearch.includes(GlobalSearchEntity.LOCATIONS)) {
      searchPromises.push(this.searchLocations(dto));
    }

    const searchResults = await Promise.all(searchPromises);
    
    // Combine and organize results
    const results = {
      activities: entitiesToSearch.includes(GlobalSearchEntity.ACTIVITIES) ? searchResults[entitiesToSearch.indexOf(GlobalSearchEntity.ACTIVITIES)] || [] : [],
      tasks: entitiesToSearch.includes(GlobalSearchEntity.TASKS) ? searchResults[entitiesToSearch.indexOf(GlobalSearchEntity.TASKS)] || [] : [],
      reports: entitiesToSearch.includes(GlobalSearchEntity.REPORTS) ? searchResults[entitiesToSearch.indexOf(GlobalSearchEntity.REPORTS)] || [] : [],
      users: entitiesToSearch.includes(GlobalSearchEntity.USERS) ? searchResults[entitiesToSearch.indexOf(GlobalSearchEntity.USERS)] || [] : [],
      locations: entitiesToSearch.includes(GlobalSearchEntity.LOCATIONS) ? searchResults[entitiesToSearch.indexOf(GlobalSearchEntity.LOCATIONS)] || [] : [],
    };

    const totalResults = Object.values(results).reduce((sum, entityResults) => sum + entityResults.length, 0);
    const searchTime = Date.now() - startTime;

    // Apply pagination to combined results
    const allResults = Object.values(results).flat();
    const sortedResults = allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const startIndex = (dto.page - 1) * dto.size;
    const endIndex = startIndex + dto.size;
    const paginatedResults = sortedResults.slice(startIndex, endIndex);

    // Reorganize paginated results by entity
    const paginatedByEntity = {
      activities: paginatedResults.filter(r => r.entity === GlobalSearchEntity.ACTIVITIES),
      tasks: paginatedResults.filter(r => r.entity === GlobalSearchEntity.TASKS),
      reports: paginatedResults.filter(r => r.entity === GlobalSearchEntity.REPORTS),
      users: paginatedResults.filter(r => r.entity === GlobalSearchEntity.USERS),
      locations: paginatedResults.filter(r => r.entity === GlobalSearchEntity.LOCATIONS),
    };

    return {
      results: paginatedByEntity,
      totalResults,
      meta: {
        query: dto.q,
        searchTime,
        entitiesSearched: entitiesToSearch,
        totalItems: totalResults,
        itemCount: paginatedResults.length,
        itemsPerPage: dto.size,
        totalPages: Math.ceil(totalResults / dto.size),
        currentPage: dto.page,
      },
    };
  }

  private async searchActivities(dto: GlobalSearchDto): Promise<GlobalSearchResult[]> {
    const queryBuilder = this.activityRepository
      .createQueryBuilder("activity")
      .leftJoinAndSelect("activity.village", "village")
      .leftJoinAndSelect("village.cell", "cell");

    // Apply search query
    queryBuilder.where(
      new Brackets((qb) => {
        qb.where("activity.title ILIKE :searchKey", {
          searchKey: `%${dto.q}%`,
        }).orWhere("activity.description ILIKE :searchKey", {
          searchKey: `%${dto.q}%`,
        });
      }),
    );

    // Apply filters
    this.applyCommonFilters(queryBuilder, dto, 'activity');

    const activities = await queryBuilder.limit(50).getMany();

    return activities.map(activity => ({
      entity: GlobalSearchEntity.ACTIVITIES,
      id: activity.id,
      title: activity.title,
      description: activity.description,
      relevanceScore: this.calculateRelevanceScore(dto.q, activity.title, activity.description),
      metadata: {
        village: activity.village?.name,
        cell: activity.village?.cell?.name,
        date: activity.date,
      },
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    }));
  }

  private async searchTasks(dto: GlobalSearchDto): Promise<GlobalSearchResult[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.activity", "activity")
      .leftJoinAndSelect("task.isibo", "isibo")
      .leftJoinAndSelect("activity.village", "village");

    // Apply search query
    queryBuilder.where(
      new Brackets((qb) => {
        qb.where("task.title ILIKE :searchKey", {
          searchKey: `%${dto.q}%`,
        }).orWhere("task.description ILIKE :searchKey", {
          searchKey: `%${dto.q}%`,
        });
      }),
    );

    // Apply filters
    this.applyCommonFilters(queryBuilder, dto, 'task');

    const tasks = await queryBuilder.limit(50).getMany();

    return tasks.map(task => ({
      entity: GlobalSearchEntity.TASKS,
      id: task.id,
      title: task.title,
      description: task.description,
      relevanceScore: this.calculateRelevanceScore(dto.q, task.title, task.description),
      metadata: {
        activity: task.activity?.title,
        isibo: task.isibo?.name,
        village: task.activity?.village?.name,
        status: task.status,
        estimatedCost: task.estimatedCost,
        actualCost: task.actualCost,
      },
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
  }

  private async searchReports(dto: GlobalSearchDto): Promise<GlobalSearchResult[]> {
    const queryBuilder = this.reportRepository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.task", "task")
      .leftJoinAndSelect("report.activity", "activity")
      .leftJoinAndSelect("task.isibo", "isibo");

    // Apply search query
    queryBuilder.where(
      new Brackets((qb) => {
        qb.where("report.comment ILIKE :searchKey", {
          searchKey: `%${dto.q}%`,
        }).orWhere("report.suggestions ILIKE :searchKey", {
          searchKey: `%${dto.q}%`,
        }).orWhere("report.challengesFaced ILIKE :searchKey", {
          searchKey: `%${dto.q}%`,
        });
      }),
    );

    // Apply filters
    this.applyCommonFilters(queryBuilder, dto, 'report');

    const reports = await queryBuilder.limit(50).getMany();

    return reports.map(report => ({
      entity: GlobalSearchEntity.REPORTS,
      id: report.id,
      title: `Report for ${report.task?.title || report.activity?.title}`,
      description: report.comment,
      relevanceScore: this.calculateRelevanceScore(dto.q, report.comment, report.suggestions),
      metadata: {
        task: report.task?.title,
        activity: report.activity?.title,
        isibo: report.task?.isibo?.name,
        hasEvidence: report.evidenceUrls && report.evidenceUrls.length > 0,
      },
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }));
  }

  private async searchUsers(dto: GlobalSearchDto): Promise<GlobalSearchResult[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.village", "village")
      .leftJoinAndSelect("user.cell", "cell");

    // Apply search query
    queryBuilder.where(
      new Brackets((qb) => {
        qb.where("user.names ILIKE :searchKey", {
          searchKey: `%${dto.q}%`,
        }).orWhere("user.email ILIKE :searchKey", {
          searchKey: `%${dto.q}%`,
        }).orWhere("user.phone ILIKE :searchKey", {
          searchKey: `%${dto.q}%`,
        });
      }),
    );

    // Apply filters
    this.applyCommonFilters(queryBuilder, dto, 'user');

    const users = await queryBuilder.limit(50).getMany();

    return users.map(user => ({
      entity: GlobalSearchEntity.USERS,
      id: user.id,
      title: user.names,
      description: `${user.role} - ${user.email}`,
      relevanceScore: this.calculateRelevanceScore(dto.q, user.names, user.email),
      metadata: {
        role: user.role,
        email: user.email,
        phone: user.phone,
        village: user.village?.name,
        cell: user.cell?.name,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  private async searchLocations(dto: GlobalSearchDto): Promise<GlobalSearchResult[]> {
    const results: GlobalSearchResult[] = [];

    // Search villages
    const villages = await this.villageRepository
      .createQueryBuilder("village")
      .leftJoinAndSelect("village.cell", "cell")
      .where("village.name ILIKE :searchKey", { searchKey: `%${dto.q}%` })
      .limit(20)
      .getMany();

    results.push(...villages.map(village => ({
      entity: GlobalSearchEntity.LOCATIONS,
      id: village.id,
      title: village.name,
      description: `Village in ${village.cell?.name}`,
      relevanceScore: this.calculateRelevanceScore(dto.q, village.name, ''),
      metadata: {
        type: 'village',
        cell: village.cell?.name,
      },
      createdAt: village.createdAt,
      updatedAt: village.updatedAt,
    })));

    // Search cells
    const cells = await this.cellRepository
      .createQueryBuilder("cell")
      .where("cell.name ILIKE :searchKey", { searchKey: `%${dto.q}%` })
      .limit(20)
      .getMany();

    results.push(...cells.map(cell => ({
      entity: GlobalSearchEntity.LOCATIONS,
      id: cell.id,
      title: cell.name,
      description: 'Cell',
      relevanceScore: this.calculateRelevanceScore(dto.q, cell.name, ''),
      metadata: {
        type: 'cell',
      },
      createdAt: cell.createdAt,
      updatedAt: cell.updatedAt,
    })));

    return results;
  }

  private applyCommonFilters(queryBuilder: any, dto: GlobalSearchDto, entityAlias: string): void {
    // Apply date filters
    if (dto.dateFrom) {
      queryBuilder.andWhere(`${entityAlias}.createdAt >= :dateFrom`, {
        dateFrom: dto.dateFrom,
      });
    }

    if (dto.dateTo) {
      queryBuilder.andWhere(`${entityAlias}.createdAt <= :dateTo`, {
        dateTo: dto.dateTo,
      });
    }

    // Apply location filters (implementation depends on entity structure)
    if (dto.locationIds && dto.locationIds.length > 0) {
      // This would need to be customized per entity based on their location relationships
    }
  }

  private calculateRelevanceScore(query: string, title: string, description?: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const descriptionLower = description?.toLowerCase() || '';

    let score = 0;

    // Exact match in title gets highest score
    if (titleLower === queryLower) {
      score += 100;
    } else if (titleLower.includes(queryLower)) {
      score += 50;
    }

    // Partial matches in title
    const titleWords = titleLower.split(' ');
    const queryWords = queryLower.split(' ');
    
    queryWords.forEach(queryWord => {
      titleWords.forEach(titleWord => {
        if (titleWord.includes(queryWord)) {
          score += 10;
        }
      });
    });

    // Matches in description
    if (descriptionLower.includes(queryLower)) {
      score += 20;
    }

    return score;
  }
}
