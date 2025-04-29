import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class JwtRefreshGuard extends AuthGuard("jwt-refresh") {
  constructor() {
    super();
  }
}
