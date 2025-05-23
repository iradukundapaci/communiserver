import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Citizen } from "src/locations/entities/citizen.entity";

export namespace CreateReportDTO {
  export class Input {
    @IsUUID()
    @IsNotEmpty()
    activityId: string;

    @IsUUID()
    @IsNotEmpty()
    taskId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Citizen)
    @IsOptional()
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
    attendance: Citizen[];
    comment?: string;
    evidenceUrls?: string[];
  }
}
