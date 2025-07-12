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
import { FetchReportDTO, GenerateReportSummaryDTO, EmailReportSummaryDTO } from "./dto/fetch-report.dto";
import { UpdateReportDTO } from "./dto/update-report.dto";
import { Report } from "./entities/report.entity";
import { Task } from "./entities/task.entity";
import { ETaskStatus } from "./enum/ETaskStatus";
import { PdfReportService, ReportSummaryData } from "./pdf-report.service";
import { SesService } from "../notifications/ses.service";
import { User } from "../users/entities/user.entity";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly usersService: UsersService,
    private readonly pdfReportService: PdfReportService,
    private readonly sesService: SesService,
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

  async generateReportSummary(dto: GenerateReportSummaryDTO.Input, user: User): Promise<GenerateReportSummaryDTO.Output> {
    // Get filtered reports using the same logic as findAll but without pagination
    const queryBuilder = this.reportRepository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.task", "task")
      .leftJoinAndSelect("task.isibo", "isibo")
      .leftJoinAndSelect("report.activity", "activity")
      .leftJoinAndSelect("activity.village", "village")
      .leftJoinAndSelect("village.cell", "cell")
      .leftJoinAndSelect("report.attendance", "attendance");

    // Apply the same filters as in findAll method
    this.applyFiltersToQuery(queryBuilder, dto);

    const reports = await queryBuilder.getMany();

    // Calculate summary statistics
    const summary = this.calculateSummaryStats(reports);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `report-summary-${timestamp}.pdf`;

    // Prepare data for PDF generation
    const reportData: ReportSummaryData = {
      title: dto.title,
      subtitle: dto.subtitle,
      generatedAt: new Date(),
      generatedBy: user.names || user.email,
      filters: this.extractFilters(dto),
      summary,
      reports: dto.includeReportDetails !== false ? reports : [],
      includeStats: dto.includeStats !== false,
      includeReportDetails: dto.includeReportDetails !== false,
    };

    // Generate PDF
    const pdfBuffer = await this.pdfReportService.generateReportSummaryPDF(reportData);

    return {
      pdfBuffer,
      filename,
      summary,
    };
  }

  async emailReportSummary(dto: EmailReportSummaryDTO.Input, user: User): Promise<EmailReportSummaryDTO.Output> {
    try {
      // Generate the report summary
      const reportResult = await this.generateReportSummary(dto, user);

      // Prepare email content
      const subject = `Report Summary: ${dto.title}`;
      const htmlContent = this.generateEmailHTML(dto, reportResult.summary, user);
      const textContent = this.generateEmailText(dto, reportResult.summary, user);

      // Send email with PDF attachment
      await this.sesService.sendEmail({
        to: dto.recipientEmail,
        subject,
        html: htmlContent,
        text: textContent,
        attachments: [
          {
            filename: reportResult.filename,
            content: reportResult.pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      return {
        success: true,
        message: `Report summary sent successfully to ${dto.recipientEmail}`,
        emailSent: true,
        reportGenerated: true,
      };
    } catch (error) {
      console.error('Error sending report summary email:', error);
      return {
        success: false,
        message: `Failed to send report summary: ${error.message}`,
        emailSent: false,
        reportGenerated: false,
      };
    }
  }

  private applyFiltersToQuery(queryBuilder: any, dto: FetchReportDTO.Input): void {
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

    // Apply activity filter
    if (dto.activityId) {
      queryBuilder.andWhere("report.activity.id = :activityId", {
        activityId: dto.activityId,
      });
    }

    if (dto.activityIds && dto.activityIds.length > 0) {
      queryBuilder.andWhere("report.activity.id IN (:...activityIds)", {
        activityIds: dto.activityIds,
      });
    }

    // Apply task filter
    if (dto.taskId) {
      queryBuilder.andWhere("report.task.id = :taskId", {
        taskId: dto.taskId,
      });
    }

    if (dto.taskIds && dto.taskIds.length > 0) {
      queryBuilder.andWhere("report.task.id IN (:...taskIds)", {
        taskIds: dto.taskIds,
      });
    }

    // Apply isibo filter
    if (dto.isiboId) {
      queryBuilder.andWhere("task.isibo.id = :isiboId", {
        isiboId: dto.isiboId,
      });
    }

    if (dto.isiboIds && dto.isiboIds.length > 0) {
      queryBuilder.andWhere("task.isibo.id IN (:...isiboIds)", {
        isiboIds: dto.isiboIds,
      });
    }

    // Apply date filters
    if (dto.dateFrom) {
      queryBuilder.andWhere("activity.date >= :dateFrom", {
        dateFrom: dto.dateFrom,
      });
    }

    if (dto.dateTo) {
      queryBuilder.andWhere("activity.date <= :dateTo", {
        dateTo: dto.dateTo,
      });
    }

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

    // Apply cost filters
    if (dto.minCost !== undefined) {
      queryBuilder.andWhere("task.actualCost >= :minCost", {
        minCost: dto.minCost,
      });
    }

    if (dto.maxCost !== undefined) {
      queryBuilder.andWhere("task.actualCost <= :maxCost", {
        maxCost: dto.maxCost,
      });
    }

    // Apply participant filters
    if (dto.minParticipants !== undefined) {
      queryBuilder.andWhere("task.actualParticipants >= :minParticipants", {
        minParticipants: dto.minParticipants,
      });
    }

    if (dto.maxParticipants !== undefined) {
      queryBuilder.andWhere("task.actualParticipants <= :maxParticipants", {
        maxParticipants: dto.maxParticipants,
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
  }

  private calculateSummaryStats(reports: Report[]): any {
    const uniqueActivities = new Set(reports.map(r => r.activity?.id)).size;
    const uniqueIsibos = new Set(reports.map(r => r.task?.isibo?.id)).size;

    const totalCost = reports.reduce((sum, r) => sum + (r.task?.actualCost || 0), 0);
    const totalParticipants = reports.reduce((sum, r) => sum + (r.task?.actualParticipants || 0), 0);
    const totalExpectedParticipants = reports.reduce((sum, r) => sum + (r.task?.expectedParticipants || 0), 0);

    const averageAttendance = totalExpectedParticipants > 0
      ? (totalParticipants / totalExpectedParticipants) * 100
      : 0;

    const reportsWithEvidence = reports.filter(r => r.evidenceUrls && r.evidenceUrls.length > 0).length;
    const reportsWithChallenges = reports.filter(r => r.challengesFaced && r.challengesFaced.trim().length > 0).length;
    const reportsWithSuggestions = reports.filter(r => r.suggestions && r.suggestions.trim().length > 0).length;

    return {
      totalReports: reports.length,
      totalActivities: uniqueActivities,
      totalIsibos: uniqueIsibos,
      totalCost,
      totalParticipants,
      averageAttendance,
      reportsWithEvidence,
      reportsWithChallenges,
      reportsWithSuggestions,
    };
  }

  private extractFilters(dto: FetchReportDTO.Input): any {
    return {
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      activityId: dto.activityId,
      isiboId: dto.isiboId,
      hasEvidence: dto.hasEvidence,
      searchQuery: dto.q,
      minCost: dto.minCost,
      maxCost: dto.maxCost,
      minParticipants: dto.minParticipants,
      maxParticipants: dto.maxParticipants,
      villageName: dto.villageName,
      cellName: dto.cellName,
    };
  }

  private generateEmailHTML(dto: EmailReportSummaryDTO.Input, summary: any, user: User): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF'
      }).format(amount);
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1e293b; }
          .stat-label { color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${dto.title}</h1>
          ${dto.subtitle ? `<p>${dto.subtitle}</p>` : ''}
        </div>

        <div class="content">
          <p>Dear Recipient,</p>

          <p>Please find attached the requested report summary generated from the Community Management System.</p>

          ${dto.message ? `<p><strong>Message:</strong> ${dto.message}</p>` : ''}

          <h3>Summary Statistics</h3>
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${summary.totalReports}</div>
              <div class="stat-label">Total Reports</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${summary.totalActivities}</div>
              <div class="stat-label">Activities</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${summary.totalIsibos}</div>
              <div class="stat-label">Isibos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${formatCurrency(summary.totalCost)}</div>
              <div class="stat-label">Total Cost</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${summary.totalParticipants}</div>
              <div class="stat-label">Participants</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${summary.averageAttendance.toFixed(1)}%</div>
              <div class="stat-label">Avg. Attendance</div>
            </div>
          </div>

          <p>The detailed report is attached as a PDF file.</p>

          <p>Best regards,<br>
          ${user.names || user.email}<br>
          Community Management System</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateEmailText(dto: EmailReportSummaryDTO.Input, summary: any, user: User): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF'
      }).format(amount);
    };

    return `
${dto.title}
${dto.subtitle ? dto.subtitle : ''}

Dear Recipient,

Please find attached the requested report summary generated from the Community Management System.

${dto.message ? `Message: ${dto.message}` : ''}

Summary Statistics:
- Total Reports: ${summary.totalReports}
- Activities: ${summary.totalActivities}
- Isibos: ${summary.totalIsibos}
- Total Cost: ${formatCurrency(summary.totalCost)}
- Participants: ${summary.totalParticipants}
- Average Attendance: ${summary.averageAttendance.toFixed(1)}%

The detailed report is attached as a PDF file.

Best regards,
${user.names || user.email}
Community Management System
    `;
  }
}
