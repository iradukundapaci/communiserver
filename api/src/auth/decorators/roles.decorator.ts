import { UserRole } from "../../__shared__/enums/user-role.enum";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

/**
 * Sets the allowed roles for a route.
 * Can be used to override the global roles set in the RolesGuard.
 * @param roles The roles that are allowed to access the route
 * @returns A decorator that sets the allowed roles
 *
 */
export const AllowRoles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
