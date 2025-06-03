import { IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";

export namespace FetchActivityDTO {
  export class Input extends PaginationDto {
    @IsOptional()
    q?: string;

    @IsUUID()
    @IsOptional()
    cellId?: string;

    @IsUUID()
    @IsOptional()
    villageId?: string;

    @IsUUID()
    @IsOptional()
    organizerId?: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    date: Date;
    village?: {
      id: string;
      name: string;
    };
    tasks?: {
      id: string;
      title: string;
      description: string;
      status: string;
      estimatedCost: number;
      actualCost: number;
      expectedParticipants: number;
      actualParticipants: number;
      totalEstimatedCost: number;
      totalActualCost: number;
      expectedFinancialImpact: number;
      actualFinancialImpact: number;
      isibo?: {
        id: string;
        name: string;
      };
    }[];
  }
}
