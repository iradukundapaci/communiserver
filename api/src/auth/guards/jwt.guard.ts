import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

/** JWT guard */
@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  /**
   * Constructor
   *
   * Calls the parent constructor with the "jwt" strategy
   */
  constructor() {
    super();
  }
}
