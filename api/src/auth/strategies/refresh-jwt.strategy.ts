import { Injectable, UnauthorizedException } from "@nestjs/common";
import { IJwtPayload } from "../interfaces/jwt.payload.interface";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { Request } from "express";
import "dotenv/config";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<IAppConfig>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get("jwtRefresh").secret,
      passReqToCallback: true,
      ignoreExpiration: true,
    });
  }

  async validate(req: Request, payload: IJwtPayload) {
    const { id } = payload;
    const user = await this.usersService.findUserById(id);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
