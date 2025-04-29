import { GlobalExceptionFilter } from "./__shared__/filters/global-exception.filter";
import { AuditInterceptor } from "./__shared__/interceptors/audit.interceptor";
import { NotificationsModule } from "./notifications/notifications.module";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { AppDataSource } from "./__shared__/config/typeorm.config";
import { appConfig } from "./__shared__/config/app.config";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import {
  ClassSerializerInterceptor,
  Module,
  OnApplicationBootstrap,
  ValidationPipe,
} from "@nestjs/common";
import { SeedModule } from "src/__shared__/seed/seed.module";
import { AdminSeedService } from "src/__shared__/seed/admin-seed.service";
import { ContactUsModule } from "./contact-us/contact-us.module";
import { VerificationModule } from "./verification/verification.module";
import { HealthModule } from "./health-check/health-module";
import { SettingsModule } from "./settings/settings.module";
import { SettingsSeedService } from "./__shared__/seed/setting-seed.service";
import { ActivitiesModule } from "./activities/activities.module";
import { LocationsModule } from "./locations/locations.module";

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
    ContactUsModule,
    ActivitiesModule,
    LocationsModule,
    VerificationModule,
    HealthModule,
    SettingsModule,
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
    private settingsSeedService: SettingsSeedService,
  ) {}

  async onApplicationBootstrap() {
    /**
     * Seed admin user
     */
    await this.adminSeedService.run();
    await this.settingsSeedService.run();
  }
}
