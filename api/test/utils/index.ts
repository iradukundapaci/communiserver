import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppDataSource } from "./typeorm.test-config";
import { ConfigModule } from "@nestjs/config";
import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { appConfig } from "src/__shared__/config/app.config";
import { GlobalExceptionFilter } from "src/__shared__/filters/global-exception.filter";
import { AuditInterceptor } from "src/__shared__/interceptors/audit.interceptor";
import { AuthModule } from "src/auth/auth.module";
import { NotificationsModule } from "src/notifications/notifications.module";
import { SupplierModule } from "src/supplier/supplier.module";
import { UsersModule } from "src/users/users.module";
import { CategoryModule } from "src/categories/category.module";
import { ProductsModule } from "src/products/products.module";
import { DonationsModule } from "src/donations/donations.module";

export const initializeTestApp = async (): Promise<INestApplication> => {
  const moduleFixture = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [appConfig],
      }),
      TypeOrmModule.forRoot(AppDataSource.options),
      AuthModule,
      UsersModule,
      CategoryModule,
      ProductsModule,
      NotificationsModule,
      SupplierModule,
      DonationsModule,
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
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix("api/v1");
  await app.init();
  return app;
};
