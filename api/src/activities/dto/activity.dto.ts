import {
  IsDate,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
} from "class-validator";

export namespace ActivityDto {
  export class Create {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDate()
    @IsNotEmpty()
    date: Date;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsUUID()
    @IsNotEmpty()
    organizerId: string;

    @IsArray()
    @IsUUID("4", { each: true })
    @IsOptional()
    participantIds?: string[];
  }

  export class Update {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDate()
    @IsOptional()
    date?: Date;

    @IsString()
    @IsOptional()
    location?: string;

    @IsUUID()
    @IsOptional()
    organizerId?: string;

    @IsArray()
    @IsUUID("4", { each: true })
    @IsOptional()
    participantIds?: string[];
  }
}
