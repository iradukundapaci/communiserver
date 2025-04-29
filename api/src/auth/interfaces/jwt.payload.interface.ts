import { UserRole } from "../../__shared__/enums/user-role.enum";

export interface IJwtPayload {
  id: string;
  sub: string;
  role: UserRole;
}
