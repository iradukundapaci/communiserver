import { Type } from "class-transformer";
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Citizen } from "src/locations/entities/citizen.entity";

export namespace UpdateReportDTO {
  export class Input {
    @IsUUID()
    @IsOptional()
    activityId?: string;

    @IsUUID()
    @IsOptional()
    taskId?: string;

    @IsArray()
    attendance?: Citizen[];

    @IsString()
    @IsOptional()
    comment?: string;

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
    attendance: Citizen[];
    comment?: string;
    evidenceUrls?: string[];
  }
}
