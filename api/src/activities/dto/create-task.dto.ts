import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export namespace CreateTaskDTO {
  export class Input {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUUID()
    @IsNotEmpty()
    activityId: string;

    @IsUUID()
    @IsNotEmpty()
    isiboId: string;

    @IsNumber()
    @IsOptional()
    estimatedCost?: number;

    @IsNumber()
    @IsOptional()
    expectedParticipants?: number;

    @IsNumber()
    @IsOptional()
    totalEstimatedCost?: number;

    @IsNumber()
    @IsOptional()
    expectedFinancialImpact?: number;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    status: string;
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
