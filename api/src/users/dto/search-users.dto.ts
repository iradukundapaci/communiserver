import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString, IsArray, IsUUID, IsDateString, IsBoolean } from "class-validator";
import { AdvancedSearchDto } from "src/__shared__/dto/pagination.dto";
import { UserRole } from "src/__shared__/enums/user-role.enum";

export namespace SearchUsersDto {
  export class Input extends AdvancedSearchDto {
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

    @IsOptional()
    @IsArray()
    @IsEnum(UserRole, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple user roles", enum: UserRole, isArray: true, required: false })
    roles?: UserRole[];

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by village IDs", type: [String], required: false })
    villageIds?: string[];

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by cell IDs", type: [String], required: false })
    cellIds?: string[];

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by house IDs", type: [String], required: false })
    houseIds?: string[];

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: "Filter users created from this date", required: false })
    createdFrom?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: "Filter users created until this date", required: false })
    createdTo?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    @ApiProperty({ description: "Filter active users only", required: false })
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by village name", required: false })
    villageName?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by cell name", required: false })
    cellName?: string;
  }

  export class UserItem {
    @Expose()
    @ApiProperty()
    id: string;

    @Expose()
    @ApiProperty()
    names: string;

    @Expose()
    @ApiProperty()
    email: string;

    @Expose()
    @ApiProperty()
    phone: string;

    @Expose()
    @ApiProperty({ enum: UserRole })
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
