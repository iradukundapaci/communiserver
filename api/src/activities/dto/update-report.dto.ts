import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { User } from "src/users/entities/user.entity";

export namespace UpdateReportDTO {
  export class Input {
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
    @IsUrl({}, { each: true })
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
  }

  export class Output {
    id: string;
    task: {
      id: string;
      title: string;
      description: string;
      status: string;
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
