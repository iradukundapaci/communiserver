import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserRole } from "../../__shared__/enums/user-role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

/** Roles guard */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Checks if the user has one of the roles specified in the `@AllowRoles` decorator
   * If the user does not have any of the roles, the guard will return false.
   * If the user has one of the roles, the guard will return true.
   * @param context The execution context
   * @returns A boolean indicating if the user is allowed to access the route
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || !requiredRoles.length) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
