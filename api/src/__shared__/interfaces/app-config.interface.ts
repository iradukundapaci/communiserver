export interface IAppConfig {
  port?: number;
  database: IDatabaseConfig;
  env?: string;
  jwt?: JwtConfig;
  swaggerEnabled?: boolean;
  backdoor?: IBackdoorConfig;
}

interface JwtConfig {
  secret: string;
  expiresIn: string | number;
}

interface IDatabaseConfig {
  username: string;
  database: string;
  password: string;
  host: string;
  port?: number;
}

interface IBackdoorConfig {
  enabled: boolean;
  username: string;
  password: string;
}
