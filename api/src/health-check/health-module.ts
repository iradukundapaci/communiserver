import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health-controller";
import { EmailHealthIndicator } from "./email-health";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [EmailHealthIndicator],
})
export class HealthModule {}
