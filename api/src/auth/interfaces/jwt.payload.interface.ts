import { UserRole } from "../../__shared__/enums/user-role.enum";

/** IJwt payload */
export interface IJwtPayload {
  id: number;
  sub: string;
  role: UserRole;
}
