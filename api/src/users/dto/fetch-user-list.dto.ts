import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";
import { UserRole } from "src/__shared__/enums/user-role.enum";

export namespace FetchUserListDto {
  export class Input extends PaginationDto {
    @ApiProperty({
      description: "Search query for name, email, or phone",
      required: false,
    })
    @IsString()
    @IsOptional()
    q?: string;

    @ApiProperty({
      description: "Filter by user role",
      required: false,
      enum: UserRole,
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
  }

  export class UserItem {
    id: string;
    names: string;
    email: string;
    phone: string;
    role: UserRole;
  }

  export class Output {
    @ApiProperty({ type: [UserItem] })
    items: UserItem[];

    @ApiProperty()
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }
}
