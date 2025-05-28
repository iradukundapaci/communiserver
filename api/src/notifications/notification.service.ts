import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SesService } from './ses.service';
import {
  EmailTemplatesService,
  AccountCreationEmailData,
  PasswordResetEmailData,
  LeaderAssignmentEmailData
} from './email-templates.service';
import { IAppConfig } from 'src/__shared__/interfaces/app-config.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly sesService: SesService,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly config: ConfigService<IAppConfig>
  ) {}

  /**
   * Send account creation email with temporary password
   */
  async sendAccountCreationEmail(data: AccountCreationEmailData): Promise<void> {
    try {
      const { subject, html, text } = this.emailTemplatesService.generateAccountCreationEmail(data);

      await this.sesService.sendEmail({
        to: data.email,
        subject,
        html,
        text,
      });

      this.logger.log(`Account creation email sent to ${data.email} for role ${data.role}`);
    } catch (error) {
      this.logger.error(`Failed to send account creation email to ${data.email}:`, error);
      throw new Error(`Failed to send account creation email: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    try {
      const { subject, html, text } = this.emailTemplatesService.generatePasswordResetEmail(data);

      await this.sesService.sendEmail({
        to: data.email,
        subject,
        html,
        text,
      });

      this.logger.log(`Password reset email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${data.email}:`, error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * Send leader assignment notification email
   */
  async sendLeaderAssignmentEmail(data: LeaderAssignmentEmailData): Promise<void> {
    try {
      const { subject, html, text } = this.emailTemplatesService.generateLeaderAssignmentEmail(data);

      await this.sesService.sendEmail({
        to: data.email,
        subject,
        html,
        text,
      });

      this.logger.log(`Leader assignment email sent to ${data.email} for ${data.role} at ${data.location}`);
    } catch (error) {
      this.logger.error(`Failed to send leader assignment email to ${data.email}:`, error);
      throw new Error(`Failed to send leader assignment email: ${error.message}`);
    }
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(userEmail: string, userName: string, verificationLink: string): Promise<void> {
    try {
      await this.sesService.sendEmail({
        to: userEmail,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification Required</h2>
            <p>Hello ${userName},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="${verificationLink}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a></p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        `,
        text: `Hello ${userName}, please verify your email address by visiting: ${verificationLink}`,
      });

      this.logger.log(`Email verification sent to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send email verification to ${userEmail}:`, error);
      throw new Error(`Failed to send email verification: ${error.message}`);
    }
  }

  /**
   * Send welcome email for new user registration
   */
  async sendWelcomeEmail(userEmail: string, userName: string, role: string): Promise<void> {
    try {
      const frontendUrl = this.config.get('url')?.client || 'http://localhost:3000';

      await this.sesService.sendEmail({
        to: userEmail,
        subject: 'Welcome to Community Management System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome ${userName}!</h2>
            <p>Your account has been successfully created with the role of <strong>${role}</strong>.</p>
            <p>You can now access the Community Management System:</p>
            <p><a href="${frontendUrl}/login" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a></p>
            <p>If you have any questions, please contact your administrator.</p>
          </div>
        `,
        text: `Welcome ${userName}! Your account has been created with the role of ${role}. Login at: ${frontendUrl}/login`,
      });

      this.logger.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${userEmail}:`, error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  /**
   * Send notification when user role is updated
   */
  async sendRoleUpdateEmail(userEmail: string, userName: string, oldRole: string, newRole: string, updatedBy: string): Promise<void> {
    try {
      const frontendUrl = this.config.get('url')?.client || 'http://localhost:3000';

      await this.sesService.sendEmail({
        to: userEmail,
        subject: 'Role Update - Community Management System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Role Update Notification</h2>
            <p>Hello ${userName},</p>
            <p>Your role has been updated in the Community Management System:</p>
            <ul>
              <li><strong>Previous Role:</strong> ${oldRole}</li>
              <li><strong>New Role:</strong> ${newRole}</li>
              <li><strong>Updated By:</strong> ${updatedBy}</li>
              <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            <p>Please log in to access your updated permissions and responsibilities:</p>
            <p><a href="${frontendUrl}/login" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access Your Account</a></p>
          </div>
        `,
        text: `Hello ${userName}, your role has been updated from ${oldRole} to ${newRole} by ${updatedBy}. Login at: ${frontendUrl}/login`,
      });

      this.logger.log(`Role update email sent to ${userEmail} (${oldRole} -> ${newRole})`);
    } catch (error) {
      this.logger.error(`Failed to send role update email to ${userEmail}:`, error);
      throw new Error(`Failed to send role update email: ${error.message}`);
    }
  }

  /**
   * Generate a temporary password
   */
  generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one character from each category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special character

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate a password reset token
   */
  generateResetToken(): string {
    const length = 32;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';

    for (let i = 0; i < length; i++) {
      token += charset[Math.floor(Math.random() * charset.length)];
    }

    return token;
  }

  /**
   * Send bulk notification to multiple users
   */
  async sendBulkNotification(
    recipients: string[],
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<void> {
    const promises = recipients.map(email =>
      this.sesService.sendEmail({
        to: email,
        subject,
        html: htmlContent,
        text: textContent,
      })
    );

    try {
      await Promise.all(promises);
      this.logger.log(`Bulk notification sent to ${recipients.length} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send bulk notification:`, error);
      throw new Error(`Failed to send bulk notification: ${error.message}`);
    }
  }
}
