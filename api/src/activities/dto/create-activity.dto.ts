import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsDate,
  IsNumber,
  IsOptional,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateActivityDto {
  @ApiProperty({ description: "The title of the activity" })
  @IsString()
  title: string;

  @ApiProperty({ description: "The description of the activity" })
  @IsString()
  description: string;

  @ApiProperty({ description: "The start date of the activity" })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: "The end date of the activity" })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({ description: "The location of the activity" })
  @IsString()
  location: string;

  @ApiProperty({ description: "The maximum number of participants allowed" })
  @IsNumber()
  maxParticipants: number;

  @ApiProperty({
    description: "The current number of participants",
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  currentParticipants?: number = 0;

  @ApiProperty({
    description: "The status of the activity",
    enum: ["active", "completed", "cancelled"],
    default: "active",
  })
  @IsEnum(["active", "completed", "cancelled"])
  @IsOptional()
  status?: string = "active";
}
