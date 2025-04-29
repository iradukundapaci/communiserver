import { Injectable } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import * as sgMail from "@sendgrid/mail";

@Injectable()
export class EmailHealthIndicator extends HealthIndicator {
  private lastCheckDateTime: Date | null = null;
  private lastHealthStatus: "UP" | "DOWN" | null = null;
  constructor() {
    super();
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  private shouldResendEmail(): boolean {
    const now = new Date();
    if (!this.lastCheckDateTime || this.lastHealthStatus === "DOWN") {
      return true;
    }

    const diffInMs = now.getTime() - this.lastCheckDateTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours >= 1;
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.shouldResendEmail()) {
      return this.getStatus(key, this.lastHealthStatus === "UP");
    }
    const testEmail = {
      to: process.env.EMAIL_TO,
      from: process.env.EMAIL_FROM,
      subject: "Health Check Email",
      text: "This is a health check email.",
    };

    await sgMail.send(testEmail);

    return this.getStatus(key, true);
  }
}
