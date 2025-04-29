import { UserRole } from "../../__shared__/enums/user-role.enum";
import { applyDecorators, UseGuards } from "@nestjs/common";
import { RolesGuard } from "../guards/roles.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AllowRoles } from "./roles.decorator";
import { JwtGuard } from "../guards/jwt.guard";
import JwtRefreshGuard from "../guards/jwt-refresh.guard";
import JwtGatewayGuard from "../guards/gate-way-jwt.guard";

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

export function IsAuthorized() {
  return Authorize(JwtGuard);
}

export function RefreshToken() {
  return Authorize(JwtRefreshGuard);
}

export function GatewayToken() {
  return Authorize(JwtGatewayGuard);
}
