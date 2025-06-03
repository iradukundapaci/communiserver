import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { ETaskStatus } from "../enum/ETaskStatus";

export namespace UpdateActivityDTO {
  export class Input {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    date?: string;

    @IsUUID()
    @IsOptional()
    villageId?: string;

    @IsOptional()
    tasks?: Task[];
  }

  class Task {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(ETaskStatus)
    @IsOptional()
    status?: ETaskStatus;

    @IsString()
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
    date: Date;
    tasks: Task[];
    village?: {
      id: string;
      name: string;
    };
  }
}
