import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export namespace AssignCitizenToHouseDTO {
  export class Input {
    @ApiProperty({
      description: "The ID of the user to assign to a house",
      example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @ApiProperty({
      description: "The ID of the house to assign the user to",
      example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsNotEmpty()
    @IsUUID()
    houseId: string;
  }
}
