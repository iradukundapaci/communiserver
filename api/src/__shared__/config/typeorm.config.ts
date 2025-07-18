import "dotenv/config";
import { join } from "path";
import { DataSource, DataSourceOptions } from "typeorm";
import { appConfig } from "./app.config";

const config = appConfig();
export const typeormOptions = {
  type: "postgres",
  ...config.database,
  logging: false,
  entities: [join(__dirname, "../../**/*.entity.{ts,js}")],
  autoLoadEntities: true,
  migrationsTableName: "sql_migrations",
  migrations: ["dist/__migrations__/*{.ts,.js}"],
  migrationsRun: true,
};
export const AppDataSource = new DataSource(
  typeormOptions as DataSourceOptions,
);
