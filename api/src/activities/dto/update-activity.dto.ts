import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsDate,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";

export class UpdateActivityDto {
  @ApiProperty({ description: "The title of the activity", required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: "The description of the activity",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "The start date of the activity",
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: "The end date of the activity", required: false })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: "The location of the activity", required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: "The maximum number of participants allowed",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxParticipants?: number;

  @ApiProperty({
    description: "The current number of participants",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  currentParticipants?: number;

  @ApiProperty({
    description: "The status of the activity",
    enum: ["active", "completed", "cancelled"],
    required: false,
  })
  @IsEnum(["active", "completed", "cancelled"])
  @IsOptional()
  status?: string;

  @ApiProperty({ description: "The ID of the organizer", required: false })
  @IsUUID()
  @IsOptional()
  organizerId?: string;

  @ApiProperty({ description: "Array of participant IDs", required: false })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  participantIds?: string[];
}
