import { INestApplication, UnauthorizedException } from "@nestjs/common";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { ConfigService } from "@nestjs/config";
import { RuntimeException } from "@nestjs/core/errors/exceptions";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { IAppConfig } from "../interfaces/app-config.interface";

/**
 * Defines the application config variables
 * @returns the Application config variables
 */
export function appConfig(): IAppConfig {
  validateEnvVariables();

  return {
    port: +process.env.PORT,
    database: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
    },
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(","),
    swaggerEnabled: process.env.SWAGGER_ENABLED === "true",
    env: process.env.NODE_ENV,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    jwtRefresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    },
    gatewayJwt: {
      secret: process.env.JWT_GATEWAY_SECRET,
      expiresIn: process.env.JWT_GATEWAY_EXPIRES_IN,
    },
    backdoor: {
      enabled: process.env.BACKDOOR_ENABLED === "true",
      username: process.env.BACKDOOR_USERNAME,
      password: process.env.BACKDOOR_PASSWORD,
    },
    emails: {
      from: process.env.EMAIL_FROM,
      sendGridApiKey: process.env.SENDGRID_API_KEY,
      to: process.env.EMAIL_TO,
    },
    url: {
      client: process.env.CLIENT_URL,
    },
  };
}

function validateEnvVariables(): void {
  const requiredEnvVars = [
    "PORT",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES_IN",
    "EMAIL_FROM",
    "SENDGRID_API_KEY",
    "REDIRECTION_URL",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingEnvVars.length > 0) {
    throw new RuntimeException(
      `Missing environment variables: ${missingEnvVars.join(", ")}`,
    );
  }
}

/**
 * Configures and binds Swagger with the project's application
 * @param app The NestJS Application instance
 */
export function configureSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService<IAppConfig>);
  if (configService.get("swaggerEnabled")) {
    {
      const API_TITLE = "Communiserver API";
      const API_DESCRIPTION = "API Doc. for Communiserver API";
      const API_VERSION = "1.0";
      const SWAGGER_URL = "";
      const options = new DocumentBuilder()
        .setTitle(API_TITLE)
        .setDescription(API_DESCRIPTION)
        .setVersion(API_VERSION)
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, options);
      SwaggerModule.setup(SWAGGER_URL, app, document, {
        customSiteTitle: "Communiserver API",
        swaggerOptions: {
          docExpansion: "none",
          persistAuthorization: true,
          apisSorter: "alpha",
          operationsSorter: "method",
          tagsSorter: "alpha",
        },
      });
    }
  }
}

/**
 * Generates obj for the app's CORS configurations
 * @returns CORS configurations
 */
export function corsConfig(): CorsOptions {
  return {
    allowedHeaders:
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Set-Cookie, Cookies",
    credentials: true,
    origin: (origin, callback) => {
      const appConfiguration = appConfig();
      const { allowedOrigins = [] } = appConfiguration;
      const canAllowUndefinedOrigin =
        origin === undefined && appConfiguration.env !== "production";

      if (allowedOrigins.indexOf(origin) !== -1 || canAllowUndefinedOrigin) {
        callback(null, true);
      } else {
        callback(
          new UnauthorizedException(
            `Not allowed by CORS for origin:${origin} on ${appConfiguration.env}`,
          ),
        );
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  };
}

/**
 * Configure app instance
 * @param {INestApplication} app - Application instance
 */
export function configure(app: INestApplication): void {
  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix("api/v1");
  app.enableCors(corsConfig());
  configureSwagger(app);
}
