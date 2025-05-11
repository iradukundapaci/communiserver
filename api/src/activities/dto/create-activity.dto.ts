import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { EActivityStatus } from "../enum/EActivityStatus";

export namespace CreateActivityDTO {
  export class Input {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    startDate: string;

    @IsString()
    endDate: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsEnum(EActivityStatus)
    @IsOptional()
    status?: EActivityStatus;

    @IsUUID()
    organizerId: string;

    @IsUUID()
    @IsOptional()
    cellId?: string;

    @IsUUID()
    @IsOptional()
    villageId?: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    status: EActivityStatus;
    organizer: {
      id: string;
      names: string;
    };
    cell?: {
      id: string;
      name: string;
    };
    village?: {
      id: string;
      name: string;
    };
  }
}
