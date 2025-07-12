import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { Repository, Brackets } from "typeorm";
import { UsersService } from "../users/users.service";
import { CreateReportDTO } from "./dto/create-report.dto";
import { FetchReportDTO } from "./dto/fetch-report.dto";
import { UpdateReportDTO } from "./dto/update-report.dto";
import { Report } from "./entities/report.entity";
import { Task } from "./entities/task.entity";
import { ETaskStatus } from "./enum/ETaskStatus";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateReportDTO.Input): Promise<CreateReportDTO.Output> {
    const existing = await this.reportRepository.findOne({
      where: {
        task: { id: dto.taskId },
        activity: { id: dto.activityId },
      },
    });

    if (existing) {
      throw new ConflictException(
        "A report for this task and activity already exists.",
      );
    }

    // Get the task to copy financial data and update actuals
    const task = await this.taskRepository.findOne({
      where: { id: dto.taskId },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // Auto-calculate actual participants from attendance list
    const actualParticipants = dto.attendanceIds ? dto.attendanceIds.length : 0;

    const report = this.reportRepository.create({
      task: { id: dto.taskId },
      activity: { id: dto.activityId },
      comment: dto.comment,
      materialsUsed: dto.materialsUsed,
      challengesFaced: dto.challengesFaced,
      suggestions: dto.suggestions,
      evidenceUrls: dto.evidenceUrls,
    });

    const saved = await this.reportRepository.save(report);

    // Assign attendance if provided
    if (dto.attendanceIds && dto.attendanceIds.length > 0) {
      await this.assignAttendanceToReport(saved.id, dto.attendanceIds);
    }

    // Update task with actual financial data from the report
    await this.taskRepository.update(
      { id: dto.taskId },
      {
        status: ETaskStatus.COMPLETED,
        actualParticipants: actualParticipants,
        actualCost: dto.actualCost || 0,
        actualFinancialImpact: dto.actualFinancialImpact || 0,
      },
    );

    return this.findReportById(saved.id);
  }

  async findAll(dto: FetchReportDTO.Input): Promise<FetchReportDTO.Output> {
    const queryBuilder = this.reportRepository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.task", "task")
      .leftJoinAndSelect("task.isibo", "isibo")
      .leftJoinAndSelect("report.activity", "activity")
      .leftJoinAndSelect("activity.village", "village")
      .leftJoinAndSelect("village.cell", "cell")
      .leftJoinAndSelect("report.attendance", "attendance");

    // Apply search query
    if (dto.q) {
      queryBuilder.andWhere(
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
    }

    // Apply task filters
    if (dto.taskId) {
      queryBuilder.andWhere("task.id = :taskId", { taskId: dto.taskId });
    }

    if (dto.taskIds && dto.taskIds.length > 0) {
      queryBuilder.andWhere("task.id IN (:...taskIds)", {
        taskIds: dto.taskIds,
      });
    }

    // Apply activity filters
    if (dto.activityId) {
      queryBuilder.andWhere("activity.id = :activityId", {
        activityId: dto.activityId,
      });
    }

    if (dto.activityIds && dto.activityIds.length > 0) {
      queryBuilder.andWhere("activity.id IN (:...activityIds)", {
        activityIds: dto.activityIds,
      });
    }

    // Apply isibo filters
    if (dto.isiboId) {
      queryBuilder.andWhere("isibo.id = :isiboId", {
        isiboId: dto.isiboId,
      });
    }

    if (dto.isiboIds && dto.isiboIds.length > 0) {
      queryBuilder.andWhere("isibo.id IN (:...isiboIds)", {
        isiboIds: dto.isiboIds,
      });
    }

    // Apply cost filters
    if (dto.minActualCost !== undefined) {
      queryBuilder.andWhere("task.actualCost >= :minActualCost", {
        minActualCost: dto.minActualCost,
      });
    }

    if (dto.maxActualCost !== undefined) {
      queryBuilder.andWhere("task.actualCost <= :maxActualCost", {
        maxActualCost: dto.maxActualCost,
      });
    }

    // Apply participant filters
    if (dto.minActualParticipants !== undefined) {
      queryBuilder.andWhere("task.actualParticipants >= :minActualParticipants", {
        minActualParticipants: dto.minActualParticipants,
      });
    }

    if (dto.maxActualParticipants !== undefined) {
      queryBuilder.andWhere("task.actualParticipants <= :maxActualParticipants", {
        maxActualParticipants: dto.maxActualParticipants,
      });
    }

    // Apply date filters
    if (dto.createdFrom) {
      queryBuilder.andWhere("report.createdAt >= :createdFrom", {
        createdFrom: dto.createdFrom,
      });
    }

    if (dto.createdTo) {
      queryBuilder.andWhere("report.createdAt <= :createdTo", {
        createdTo: dto.createdTo,
      });
    }

    if (dto.startDate) {
      queryBuilder.andWhere("report.createdAt >= :startDate", {
        startDate: dto.startDate,
      });
    }

    if (dto.endDate) {
      queryBuilder.andWhere("report.createdAt <= :endDate", {
        endDate: dto.endDate,
      });
    }

    // Apply evidence filter
    if (dto.hasEvidence !== undefined) {
      if (dto.hasEvidence) {
        queryBuilder.andWhere("report.evidenceUrls IS NOT NULL AND array_length(report.evidenceUrls, 1) > 0");
      } else {
        queryBuilder.andWhere("(report.evidenceUrls IS NULL OR array_length(report.evidenceUrls, 1) = 0)");
      }
    }

    // Apply location name filters
    if (dto.villageName) {
      queryBuilder.andWhere("village.name ILIKE :villageName", {
        villageName: `%${dto.villageName}%`,
      });
    }

    if (dto.cellName) {
      queryBuilder.andWhere("cell.name ILIKE :cellName", {
        cellName: `%${dto.cellName}%`,
      });
    }

    // Apply materials filter
    if (dto.materialsUsed && dto.materialsUsed.length > 0) {
      queryBuilder.andWhere("report.materialsUsed && :materialsUsed", {
        materialsUsed: dto.materialsUsed,
      });
    }

    // Apply sorting
    const sortBy = dto.sortBy || 'createdAt';
    const sortOrder = dto.sortOrder || 'DESC';
    queryBuilder.orderBy(`report.${sortBy}`, sortOrder);

    return paginate(queryBuilder, {
      page: dto.page,
      limit: dto.size,
    });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: [
        "task",
        "task.isibo",
        "activity",
        "activity.village",
        "attendance",
      ],
    });

    if (!report) {
      throw new NotFoundException("Report not found.");
    }

    return report;
  }

  async findReportById(id: string): Promise<Report> {
    return this.findOne(id);
  }

  async assignAttendanceToReport(
    reportId: string,
    attendanceIds: string[],
  ): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ["attendance"],
    });

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    if (attendanceIds.length > 0) {
      // Validate that all attendance IDs exist
      const users = await this.usersService.findUsersByIds(attendanceIds);

      if (users.length !== attendanceIds.length) {
        throw new NotFoundException("One or more attendee users not found");
      }

      // Assign attendance to report
      report.attendance = users;
      await this.reportRepository.save(report);
    } else {
      // Clear attendance if empty array is provided
      report.attendance = [];
      await this.reportRepository.save(report);
    }
  }

  async update(id: string, dto: UpdateReportDTO.Input): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ["attendance"],
    });

    if (!report) {
      throw new NotFoundException("Report not found.");
    }

    // Auto-calculate actual participants from attendance list if attendance is being updated
    if (dto.attendanceIds !== undefined) {
      report.task.actualParticipants = dto.attendanceIds.length;
    }

    // Update report fields
    if (dto.comment !== undefined) report.comment = dto.comment;
    if (dto.materialsUsed !== undefined)
      report.materialsUsed = dto.materialsUsed;
    if (dto.challengesFaced !== undefined)
      report.challengesFaced = dto.challengesFaced;
    if (dto.suggestions !== undefined) report.suggestions = dto.suggestions;
    if (dto.evidenceUrls !== undefined) report.evidenceUrls = dto.evidenceUrls;

    const updated = await this.reportRepository.save(report);

    // Update attendance if provided
    if (dto.attendanceIds !== undefined) {
      await this.assignAttendanceToReport(updated.id, dto.attendanceIds);
    }

    return this.findReportById(updated.id);
  }

  async delete(id: string): Promise<void> {
    const report = await this.reportRepository.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException("Report not found.");
    }

    await this.reportRepository.remove(report);
  }
}
