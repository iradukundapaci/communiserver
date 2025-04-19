import { IJwtPayload } from "../interfaces/jwt.payload.interface";
import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import { appConfig } from "src/__shared__/config/app.config";

/**
 * Handles JWT token logic
 */
@Injectable()
export class TokenService {
  private readonly configService = appConfig();
  private readonly jwtConfig = this.configService.jwt;
  private readonly jwtService = new JwtService();

  generateJwtToken(payload: IJwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig?.expiresIn,
      secret: this.jwtConfig?.secret,
    });
  }

  getTokenPayload<T>(token: string): T {
    const payload = this.jwtService.verify(token, {
      secret: this.jwtConfig?.secret,
    });
    return payload;
  }
}
