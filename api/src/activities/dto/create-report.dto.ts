import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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
    attendance: Profile[];
    comment?: string;
    evidenceUrls?: string[];
  }
}
