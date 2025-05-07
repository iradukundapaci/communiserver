import { IsNotEmpty, IsUUID } from "class-validator";
import { Village } from "../entities/village.entity";

export namespace AssignVillageLeaderDto {
  export class Input {
    @IsUUID()
    @IsNotEmpty()
    userId: string;
  }

  export class Output {
    village: Village;
  }
}
