import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class JwtGatewayGuard extends AuthGuard("jwt-gateway") {
  constructor() {
    super();
  }

  getRequest(context: any) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    if (authHeader && authHeader.startsWith("Bearer_")) {
      request.headers["authorization"] = authHeader.replace(
        "Bearer_",
        "Bearer ",
      );
    }

    return request;
  }
}
