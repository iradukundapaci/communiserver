import {
  ClassSerializerInterceptor,
  Module,
  OnApplicationBootstrap,
  ValidationPipe,
} from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SeedModule } from './__shared__/seed/seed.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { GlobalExceptionFilter } from './__shared__/filters/global-exception.filter';
import { AuditInterceptor } from './__shared__/interceptors/audit.interceptor';
import { AdminSeedService } from './__shared__/seed/admin-seed.service';
import { AppDataSource } from './__shared__/config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './__shared__/config/app.config';
import { LocationsModule } from './locations/locations.module';
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    UsersModule,
    SeedModule,
    LocationsModule,
    ActivitiesModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private adminSeedService: AdminSeedService) {}

  async onApplicationBootstrap() {
    await this.adminSeedService.run();
  }
}
