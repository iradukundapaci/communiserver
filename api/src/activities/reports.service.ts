import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { Repository } from "typeorm";
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

    // Auto-calculate actual participants from attendance list
    const actualParticipants = dto.attendanceIds ? dto.attendanceIds.length : 0;

    const report = this.reportRepository.create({
      task: { id: dto.taskId },
      activity: { id: dto.activityId },
      // Copy task financial data for easy access
      estimatedCost: dto.estimatedCost || 0,
      actualCost: dto.actualCost || 0,
      expectedParticipants: dto.expectedParticipants || 0,
      actualParticipants: actualParticipants,
      expectedFinancialImpact: dto.expectedFinancialImpact || 0,
      actualFinancialImpact: dto.actualFinancialImpact || 0,
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

    // Mark the task as complete when report is submitted
    await this.taskRepository.update(
      { id: dto.taskId },
      { status: ETaskStatus.COMPLETED }
    );

    return this.findReportById(saved.id);
  }

  async findAll(dto: FetchReportDTO.Input): Promise<FetchReportDTO.Output> {
    const queryBuilder = this.reportRepository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.task", "task")
      .leftJoinAndSelect("task.isibo", "isibo")
      .leftJoinAndSelect("report.activity", "activity")
      .leftJoinAndSelect("activity.village", "village");

    if (dto.taskId) {
      queryBuilder.andWhere("task.id = :taskId", { taskId: dto.taskId });
    }

    if (dto.activityId) {
      queryBuilder.andWhere("activity.id = :activityId", {
        activityId: dto.activityId,
      });
    }

    if (dto.isiboId) {
      queryBuilder.andWhere("isibo.id = :isiboId", {
        isiboId: dto.isiboId,
      });
    }

    return paginate(queryBuilder, {
      page: dto.page,
      limit: dto.size,
    });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ["task", "task.isibo", "activity", "activity.village", "attendance", "attendance.user"],
    });

    if (!report) {
      throw new NotFoundException("Report not found.");
    }

    return report;
  }

  async findReportById(id: string): Promise<Report> {
    return this.findOne(id);
  }

  async assignAttendanceToReport(reportId: string, attendanceIds: string[]): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ["attendance"],
    });

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    if (attendanceIds.length > 0) {
      // Validate that all attendance IDs exist
      const profiles = await this.usersService.findProfilesByIds(attendanceIds);

      if (profiles.length !== attendanceIds.length) {
        throw new NotFoundException("One or more attendee profiles not found");
      }

      // Assign attendance to report
      report.attendance = profiles;
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
      report.actualParticipants = dto.attendanceIds.length;
    }

    // Update task financial data
    if (dto.estimatedCost !== undefined) report.estimatedCost = dto.estimatedCost;
    if (dto.actualCost !== undefined) report.actualCost = dto.actualCost;
    if (dto.expectedParticipants !== undefined) report.expectedParticipants = dto.expectedParticipants;
    // Don't allow manual override of actualParticipants - it's calculated from attendance
    if (dto.expectedFinancialImpact !== undefined) report.expectedFinancialImpact = dto.expectedFinancialImpact;
    if (dto.actualFinancialImpact !== undefined) report.actualFinancialImpact = dto.actualFinancialImpact;
    if (dto.comment !== undefined) report.comment = dto.comment;
    if (dto.materialsUsed !== undefined) report.materialsUsed = dto.materialsUsed;
    if (dto.challengesFaced !== undefined) report.challengesFaced = dto.challengesFaced;
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
