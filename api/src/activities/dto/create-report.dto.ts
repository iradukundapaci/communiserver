import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";
import { Profile } from "src/users/entities/profile.entity";

export namespace CreateReportDTO {
  export class Input {
    @IsUUID()
    @IsNotEmpty()
    activityId: string;

    @IsUUID()
    @IsNotEmpty()
    taskId: string;

    @IsArray()
    @IsUUID("4", { each: true })
    @IsOptional()
    attendanceIds?: string[];

    // Task financial data (copied from task for easy access)
    @IsNumber()
    @Min(0)
    @IsOptional()
    estimatedCost?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    actualCost?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    expectedParticipants?: number;

    @IsNumber()
    @Min(0)
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
