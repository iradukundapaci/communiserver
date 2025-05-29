import {
  IsArray,
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
    attendance: Profile[];
    comment?: string;
    evidenceUrls?: string[];
  }
}
