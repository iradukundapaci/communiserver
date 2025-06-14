import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export namespace AssignCellLeaderDto {
  export class Input {
    @ApiProperty({
      description: "The ID of the user to assign as cell leader",
      example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsNotEmpty()
    @IsUUID()
    userId: string;
  }
}