import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { ETaskStatus } from "../enum/ETaskStatus";

export namespace UpdateTaskDTO {
  export class Input {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(ETaskStatus)
    @IsOptional()
    status?: ETaskStatus;

    @IsUUID()
    @IsOptional()
    activityId?: string;

    @IsUUID()
    @IsOptional()
    isiboId?: string;

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
    totalEstimatedCost?: number;

    @IsNumber()
    @IsOptional()
    totalActualCost?: number;

    @IsNumber()
    @IsOptional()
    expectedFinancialImpact?: number;

    @IsNumber()
    @IsOptional()
    actualFinancialImpact?: number;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    status: ETaskStatus;
    estimatedCost: number;
    actualCost: number;
    expectedParticipants: number;
    actualParticipants: number;
    totalEstimatedCost: number;
    totalActualCost: number;
    expectedFinancialImpact: number;
    actualFinancialImpact: number;
    activity: {
      id: string;
      title: string;
    };
    isibo: {
      id: string;
      name: string;
    };
  }
}
