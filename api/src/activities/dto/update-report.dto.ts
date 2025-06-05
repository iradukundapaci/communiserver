import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { Profile } from "src/users/entities/profile.entity";

export namespace UpdateReportDTO {
  export class Input {
    @IsUUID()
    @IsOptional()
    activityId?: string;

    @IsUUID()
    @IsOptional()
    taskId?: string;

    @IsArray()
    @IsUUID("4", { each: true })
    @IsOptional()
    attendanceIds?: string[];

    // Task financial data (copied from task for easy access)
    @IsNumber()
    @IsOptional()
    estimatedCost?: number;

    @IsNumber()
    @IsOptional()
    actualCost?: number;

    @IsNumber()
    @IsOptional()
    expectedParticipants?: number;

    @IsNumber()
    @IsOptional()
    actualParticipants?: number;

    @IsNumber()
    @IsOptional()
    expectedFinancialImpact?: number;

    @IsNumber()
    @IsOptional()
    actualFinancialImpact?: number;

    @IsString()
    @IsOptional()
    comment?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    materialsUsed?: string[];

    @IsString()
    @IsOptional()
    challengesFaced?: string;

    @IsString()
    @IsOptional()
    suggestions?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    evidenceUrls?: string[];
  }

  export class Output {
    id: string;
    activity: { id: string; title: string };
    task: { id: string; title: string };
    submittedAt: Date;
    attendance: Profile[];
    estimatedCost: number;
    actualCost: number;
    expectedParticipants: number;
    actualParticipants: number;
    expectedFinancialImpact: number;
    actualFinancialImpact: number;
    comment?: string;
    materialsUsed?: string[];
    challengesFaced?: string;
    suggestions?: string;
    evidenceUrls?: string[];
  }
}
