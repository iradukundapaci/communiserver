import { BadRequestException } from "@nestjs/common";

export enum UserRole {
  ADMIN = "ADMIN",
  CELL_LEADER = "CELL_LEADER",
  VILLAGE_LEADER = "VILLAGE_LEADER",
  CITIZEN = "CITIZEN",
  VOLUNTEER = "VOLUNTEER",
}

export function getUserRole(role: string): UserRole {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return UserRole.ADMIN;
    case "CELL_LEADER":
      return UserRole.CELL_LEADER;
    case "VILLAGE_LEADER":
      return UserRole.VILLAGE_LEADER;
    case "CITIZEN":
      return UserRole.CITIZEN;
    case "VOLUNTEER":
      return UserRole.VOLUNTEER;
    default:
      throw new BadRequestException("Invalid user role");
  }
}
