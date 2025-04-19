import { IAppConfig } from '../__shared__/interfaces/app-config.interface';
import { PasswordEncryption } from './utils/password-encrytion.util';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<IAppConfig>) => ({
        secret: configService.get<IAppConfig['jwt']>('jwt')?.secret,
        signOptions: {
          expiresIn: configService.get<IAppConfig['jwt']>('jwt')?.expiresIn,
          issuer: 'crew-api',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [JwtStrategy, ConfigService, PasswordEncryption],
  exports: [JwtModule],
})
export class AuthModule {}
