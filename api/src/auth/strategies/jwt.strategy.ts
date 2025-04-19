import { Injectable } from "@nestjs/common";
import { IJwtPayload } from "../interfaces/jwt.payload.interface";
import { UsersService } from "src/users/users.service";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";

/** JWT strategy */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  /**
   * Constructor
   * @param configService The config service
   */
  constructor(
    private readonly configService: ConfigService<IAppConfig>,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("jwt").secret,
      algorithms: ["HS256"],
    });
  }

  /**
   * Validate user
   * @param payload Jwt payload
   * @returns user
   */
  async validate(payload: IJwtPayload) {
    const user = await this.usersService.findUserByEmail(payload.sub);
    return { id: user.id, email: user.email, role: user.role };
  }
}
