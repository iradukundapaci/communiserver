export interface IAppConfig {
  port?: number;
  database: IDatabaseConfig;
  env?: string;
  jwt?: JwtConfig;
  jwtRefresh?: JwtConfig;
  gatewayJwt?: JwtConfig;
  allowedOrigins?: string[];
  swaggerEnabled?: boolean;
  backdoor?: IBackdoorConfig;
  emails?: IEmailConfig;
  url?: UrlConfig;
}

interface IEmailConfig {
  from: string;
  sendGridApiKey: string;
  to: string;
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

interface UrlConfig {
  api?: string;
  client?: string;
}
