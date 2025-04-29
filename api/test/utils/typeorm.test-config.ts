import { join } from "path";
import { appConfig } from "src/__shared__/config/app.config";
import { DataSource, DataSourceOptions } from "typeorm";

const config = appConfig();
export const typeormOptions = {
  type: "postgres",
  ...config.database,
  logging: false,
  entities: [join(__dirname, "../../**/*.entity.{ts,js}")],
  autoLoadEntities: true,
  migrationsTableName: "sql_migrations",
  migrationsRun: true,
  dropSchema: true,
  synchronize: true,
};

export const AppDataSource = new DataSource(
  typeormOptions as DataSourceOptions,
);
