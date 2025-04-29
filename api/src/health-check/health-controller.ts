import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus";
import { GetOperation } from "src/__shared__/decorators";
import { EmailHealthIndicator } from "./email-health";
import { IsAdmin } from "src/auth/decorators/authorize.decorator";

@ApiTags("Health-checker")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private emailHealthIndicator: EmailHealthIndicator,
  ) {}

  @GetOperation("", "To check if sever and database running")
  async check() {
    const result = await this.health.check([
      () => this.db.pingCheck("database"),
      () => this.emailHealthIndicator.isHealthy("emailChecker"),
    ]);
    const isUp =
      result.status === "ok" &&
      Object.values(result.details).every((detail) => detail.status === "up");

    return { status: isUp ? "UP" : "DOWN" };
  }

  @GetOperation(
    "/details",
    "Admin checking if database and server is up or down",
  )
  @IsAdmin()
  async checkAdmin() {
    const result = await this.health.check([
      () => this.db.pingCheck("database"),
      () => this.emailHealthIndicator.isHealthy("emailChecker"),
    ]);

    return result;
  }
}
