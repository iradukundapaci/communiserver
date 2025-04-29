import { IsOptional } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";
import { UserRole } from "src/__shared__/enums/user-role.enum";

export namespace FetchUserDto {
  export class Input extends PaginationDto {
    @IsOptional()
    q?: string;
  }

  export class Output {
    id: string;
    names: string;
    email: string;
    role: UserRole;
    activated: boolean;
    profile: FetchUserProfile;
  }
  class FetchUserProfile {
    phone: string;
    address: string;
  }
}
