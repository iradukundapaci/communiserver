import {
  ClassSerializerInterceptor,
  Module,
  OnApplicationBootstrap,
  ValidationPipe,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminSeedService } from "src/__shared__/seed/admin-seed.service";
import { LocationSeedService } from "src/__shared__/seed/location-seed.service";
import { SeedModule } from "src/__shared__/seed/seed.module";
import { appConfig } from "./__shared__/config/app.config";
import { AppDataSource } from "./__shared__/config/typeorm.config";
import { GlobalExceptionFilter } from "./__shared__/filters/global-exception.filter";
import { AuditInterceptor } from "./__shared__/interceptors/audit.interceptor";
import { ActivitiesModule } from "./activities/activities.module";
import { AuthModule } from "./auth/auth.module";
import { LocationsModule } from "./locations/locations.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { UsersModule } from "./users/users.module";
import { VerificationModule } from "./verification/verification.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    UsersModule,
    NotificationsModule,
    SeedModule,
    ActivitiesModule,
    LocationsModule,
    VerificationModule,
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
  constructor(
    private adminSeedService: AdminSeedService,
    private locationSeedService: LocationSeedService,
  ) {}

  async onApplicationBootstrap() {
    /**
     * Seed admin user and locations
     */
    await this.adminSeedService.run();
    await this.locationSeedService.run();
  }
}
