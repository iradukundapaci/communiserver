import { UserRole } from "../../__shared__/enums/user-role.enum";
import { applyDecorators, UseGuards } from "@nestjs/common";
import { RolesGuard } from "../guards/roles.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AllowRoles } from "./roles.decorator";

/**
 * Applies the JWT guard and the roles guard to the route.
 * The route will require a valid JWT token and the user
 * must have one of the roles specified in the arguments.
 *
 * @param roles The roles allowed to access the route
 * @returns A decorator that applies the JWT and roles guards
 * @example
 *  @Authorize(UserRole.ADMIN)
 *  async getAdminData() {
 *    // Only admins can access this
 *  }
 */
export function Authorize(guard, ...roles: UserRole[]) {
  return applyDecorators(
    ApiBearerAuth(),
    UseGuards(guard, RolesGuard),
    AllowRoles(...roles),
  );
}
