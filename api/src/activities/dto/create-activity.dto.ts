import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export namespace CreateActivityDTO {
  export class Input {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    date: string;

    @IsUUID()
    @IsNotEmpty()
    villageId: string;

    @IsOptional()
    tasks?: Task[];
  }

  class Task {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    isiboId: string;

    @IsNumber()
    @IsOptional()
    estimatedCost?: number;

    @IsNumber()
    @IsOptional()
    expectedFinancialImpact?: number;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    date: Date;
    tasks: Task[];
  }
}
