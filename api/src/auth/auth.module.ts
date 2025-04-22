import { IAppConfig } from "../__shared__/interfaces/app-config.interface";
import { PasswordEncryption } from "./utils/password-encrytion.util";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UsersModule } from "src/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<IAppConfig>) => ({
        secret: configService.get<IAppConfig["jwt"]>("jwt")?.secret,
        signOptions: {
          expiresIn: configService.get<IAppConfig["jwt"]>("jwt")?.expiresIn,
          issuer: "communiserve-api",
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, ConfigService, PasswordEncryption, AuthService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
