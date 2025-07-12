import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UserRole } from "../../__shared__/enums/user-role.enum";
import JwtGatewayGuard from "../guards/gate-way-jwt.guard";
import JwtRefreshGuard from "../guards/jwt-refresh.guard";
import { JwtGuard } from "../guards/jwt.guard";
import { RolesGuard } from "../guards/roles.guard";
import { AllowRoles } from "./roles.decorator";

function Authorize(guard, ...roles: UserRole[]) {
  return applyDecorators(
    ApiBearerAuth(),
    UseGuards(guard, RolesGuard),
    AllowRoles(...roles),
  );
}

export function IsAdmin() {
  return Authorize(JwtGuard, UserRole.ADMIN);
}

export function IsCellLeader() {
  return Authorize(JwtGuard, UserRole.CELL_LEADER);
}

export function IsCellLeaderOrVillageLeader() {
  return Authorize(JwtGuard, UserRole.CELL_LEADER, UserRole.VILLAGE_LEADER);
}

export function IsVillageLeader() {
  return Authorize(JwtGuard, UserRole.VILLAGE_LEADER);
}

export function IsIsiboLeader() {
  return Authorize(JwtGuard, UserRole.ISIBO_LEADER);
}

export function IsAuthorized() {
  return Authorize(JwtGuard);
}

export function GatewayToken() {
  return Authorize(JwtGatewayGuard);
}

export function IsAdminOrIsiboLeader() {
  return Authorize(JwtGuard, UserRole.ADMIN, UserRole.ISIBO_LEADER);
}

export function IsAdminOrVillageLeader() {
  return Authorize(JwtGuard, UserRole.ADMIN, UserRole.VILLAGE_LEADER);
}

export function IsAdminOrCellLeader() {
  return Authorize(JwtGuard, UserRole.ADMIN, UserRole.CELL_LEADER);
}

export function IsAdminOrVillageLeaderOrIsiboLeader() {
  return Authorize(
    JwtGuard,
    UserRole.ADMIN,
    UserRole.VILLAGE_LEADER,
    UserRole.ISIBO_LEADER,
  );
}
