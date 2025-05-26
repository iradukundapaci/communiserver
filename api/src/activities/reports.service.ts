import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate } from "nestjs-typeorm-paginate";
import { Repository } from "typeorm";
import { CreateReportDTO } from "./dto/create-report.dto";
import { FetchReportDTO } from "./dto/fetch-report.dto";
import { UpdateReportDTO } from "./dto/update-report.dto";
import { Report } from "./entities/report.entity";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
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

    const report = this.reportRepository.create({
      task: { id: dto.taskId },
      activity: { id: dto.activityId },
      comment: dto.comment,
      attendance: dto.attendance,
      evidenceUrls: dto.evidenceUrls,
    });

    const saved = await this.reportRepository.save(report);
    return saved;
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
      relations: ["task", "task.isibo", "activity", "activity.village"],
    });

    if (!report) {
      throw new NotFoundException("Report not found.");
    }

    return report;
  }

  async update(id: string, dto: UpdateReportDTO.Input): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException("Report not found.");
    }

    if (dto.comment !== undefined) report.comment = dto.comment;
    if (dto.evidenceUrls !== undefined) report.evidenceUrls = dto.evidenceUrls;
    report.attendance = dto.attendance;

    const updated = await this.reportRepository.save(report);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const report = await this.reportRepository.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException("Report not found.");
    }

    await this.reportRepository.remove(report);
  }
}
