import "dotenv/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { appConfig } from "./app.config";
import { join } from "path";

const config = appConfig();
export const typeormOptions = {
  type: "postgres",
  ...config.database,
  logging: false,
  entities: [join(__dirname, "../../**/*.entity.{ts,js}")],
  migrationsTableName: "sql_migrations",
  migrations: ["dist/__migrations__/*{.ts,.js}"],
  migrationsRun: true,
};
export const AppDataSource = new DataSource(
  typeormOptions as DataSourceOptions,
);
