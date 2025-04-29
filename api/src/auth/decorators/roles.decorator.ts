import { UserRole } from "../../__shared__/enums/user-role.enum";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

export const AllowRoles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
