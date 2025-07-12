import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { User } from "src/users/entities/user.entity";

export namespace CreateReportDTO {
  export class Input {
    @ApiProperty({
      description: "The ID of the task this report is for",
    })
    @IsString()
    taskId: string;

    @ApiProperty({
      description: "The ID of the activity this report is for",
    })
    @IsString()
    activityId: string;

    @ApiProperty({
      description: "General comment about the task execution",
      required: false,
    })
    @IsString()
    @IsOptional()
    comment?: string;

    @ApiProperty({
      description: "List of materials used during task execution",
      type: [String],
      required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    materialsUsed?: string[];

    @ApiProperty({
      description: "Challenges faced during task execution",
      required: false,
    })
    @IsString()
    @IsOptional()
    challengesFaced?: string;

    @ApiProperty({
      description: "Suggestions for improvement",
      required: false,
    })
    @IsString()
    @IsOptional()
    suggestions?: string;

    @ApiProperty({
      description: "URLs to evidence (photos, documents, etc.)",
      type: [String],
      required: false,
    })
    @IsArray()
    @IsOptional()
    evidenceUrls?: string[];

    @ApiProperty({
      description: "IDs of users who attended/participated",
      type: [String],
      required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    attendanceIds?: string[];

    @ApiProperty({
      description: "Estimated cost for the task (from task)",
      required: false,
    })
    @IsNumber()
    @IsOptional()
    estimatedCost?: number;

    @ApiProperty({
      description: "Actual cost incurred during task execution",
      required: false,
    })
    @IsNumber()
    @IsOptional()
    actualCost?: number;

    @ApiProperty({
      description: "Expected number of participants (from task)",
      required: false,
    })
    @IsNumber()
    @IsOptional()
    expectedParticipants?: number;

    @ApiProperty({
      description: "Expected financial impact (from task)",
      required: false,
    })
    @IsNumber()
    @IsOptional()
    expectedFinancialImpact?: number;

    @ApiProperty({
      description: "Actual financial impact achieved",
      required: false,
    })
    @IsNumber()
    @IsOptional()
    actualFinancialImpact?: number;
  }

  export class Output {
    id: string;
    task: {
      id: string;
      title: string;
      description: string;
      status: string;
      estimatedCost: number;
      actualCost: number;
      expectedParticipants: number;
      actualParticipants: number;
      expectedFinancialImpact: number;
      actualFinancialImpact: number;
      isibo: {
        id: string;
        name: string;
      };
    };
    activity: {
      id: string;
      title: string;
      description: string;
      date: Date;
      village: {
        id: string;
        name: string;
      };
    };
    comment?: string;
    materialsUsed?: string[];
    challengesFaced?: string;
    suggestions?: string;
    evidenceUrls?: string[];
    attendance: User[];
  }
}
