import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from 'src/__shared__/interfaces/app-config.interface';

export interface AccountCreationEmailData {
  name: string;
  email: string;
  role: string;
  temporaryPassword: string;
  loginUrl: string;
  location?: string;
}

export interface PasswordResetEmailData {
  name: string;
  email: string;
  resetToken: string;
  resetUrl: string;
  expiresIn: string;
}

export interface LeaderAssignmentEmailData {
  name: string;
  email: string;
  role: string;
  location: string;
  assignedBy: string;
  loginUrl: string;
}

@Injectable()
export class EmailTemplatesService {
  constructor(private config: ConfigService<IAppConfig>) {}

  generateAccountCreationEmail(data: AccountCreationEmailData): { subject: string; html: string; text: string } {
    const subject = `Welcome to Community Management System - Account Created`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Created</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .credentials-box { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to Community Management System</h1>
          <p>Your account has been successfully created</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.name}!</h2>
          
          <p>Congratulations! Your account has been created for the Community Management System. You have been assigned the role of <strong>${data.role.replace('_', ' ')}</strong>${data.location ? ` for ${data.location}` : ''}.</p>
          
          <div class="credentials-box">
            <h3>🔐 Your Login Credentials</h3>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.temporaryPassword}</code></p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong>
            <ul>
              <li>This is a temporary password that expires in 24 hours</li>
              <li>You must change your password on first login</li>
              <li>Keep your credentials secure and do not share them</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.loginUrl}" class="button">🚀 Login to Your Account</a>
          </div>
          
          <h3>📋 Your Role & Responsibilities</h3>
          <p>As a <strong>${data.role.replace('_', ' ')}</strong>, you will have access to:</p>
          <ul>
            ${this.getRoleResponsibilities(data.role)}
          </ul>
          
          <h3>🆘 Need Help?</h3>
          <p>If you have any questions or need assistance:</p>
          <ul>
            <li>Contact your system administrator</li>
            <li>Refer to the user guide (available after login)</li>
            <li>Use the help section in the application</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This email was sent automatically by the Community Management System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to Community Management System!

Hello ${data.name},

Your account has been created with the role of ${data.role.replace('_', ' ')}${data.location ? ` for ${data.location}` : ''}.

Login Credentials:
- Email: ${data.email}
- Temporary Password: ${data.temporaryPassword}

IMPORTANT: This is a temporary password that expires in 24 hours. You must change your password on first login.

Login URL: ${data.loginUrl}

If you have any questions, please contact your system administrator.

This email was sent automatically by the Community Management System.
    `;

    return { subject, html, text };
  }

  generatePasswordResetEmail(data: PasswordResetEmailData): { subject: string; html: string; text: string } {
    const subject = `Password Reset Request - Community Management System`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
          <p>Reset your account password</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.name}!</h2>
          
          <p>We received a request to reset your password for the Community Management System. If you made this request, click the button below to reset your password.</p>
          
          <div style="text-align: center;">
            <a href="${data.resetUrl}" class="button">🔑 Reset Password</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Information:</strong>
            <ul>
              <li>This reset link expires in ${data.expiresIn}</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password will remain unchanged until you create a new one</li>
            </ul>
          </div>
          
          <p><strong>Reset Token:</strong> If the button doesn't work, you can use this token: <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.resetToken}</code></p>
          
          <h3>🛡️ Security Tips</h3>
          <ul>
            <li>Choose a strong password with at least 8 characters</li>
            <li>Include uppercase, lowercase, numbers, and special characters</li>
            <li>Don't reuse passwords from other accounts</li>
            <li>Keep your password secure and don't share it</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This email was sent automatically by the Community Management System.</p>
          <p>If you didn't request this password reset, please contact your administrator.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Password Reset Request - Community Management System

Hello ${data.name},

We received a request to reset your password. If you made this request, use the following link to reset your password:

${data.resetUrl}

Reset Token: ${data.resetToken}

This link expires in ${data.expiresIn}.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

This email was sent automatically by the Community Management System.
    `;

    return { subject, html, text };
  }

  generateLeaderAssignmentEmail(data: LeaderAssignmentEmailData): { subject: string; html: string; text: string } {
    const subject = `Leadership Assignment - ${data.location}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Leadership Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .highlight { background: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎖️ Leadership Assignment</h1>
          <p>You have been assigned as a community leader</p>
        </div>
        
        <div class="content">
          <h2>Congratulations ${data.name}!</h2>
          
          <p>You have been assigned as <strong>${data.role.replace('_', ' ')}</strong> for <strong>${data.location}</strong> by ${data.assignedBy}.</p>
          
          <div class="highlight">
            <h3>📍 Your Assignment Details</h3>
            <p><strong>Role:</strong> ${data.role.replace('_', ' ')}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Assigned By:</strong> ${data.assignedBy}</p>
            <p><strong>Assignment Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.loginUrl}" class="button">🚀 Access Your Dashboard</a>
          </div>
          
          <h3>📋 Your New Responsibilities</h3>
          <p>As a <strong>${data.role.replace('_', ' ')}</strong>, you will be responsible for:</p>
          <ul>
            ${this.getRoleResponsibilities(data.role)}
          </ul>
          
          <h3>🎯 Next Steps</h3>
          <ol>
            <li>Log in to your account using the button above</li>
            <li>Review your location's current status and activities</li>
            <li>Familiarize yourself with the management tools</li>
            <li>Connect with your community members</li>
            <li>Start planning and organizing activities</li>
          </ol>
          
          <h3>🆘 Support & Resources</h3>
          <p>To help you succeed in your new role:</p>
          <ul>
            <li>Access the leadership guide in your dashboard</li>
            <li>Contact your supervisor for guidance</li>
            <li>Join the leaders' communication channels</li>
            <li>Attend leadership training sessions</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Welcome to the leadership team! We're excited to have you on board.</p>
          <p>This email was sent automatically by the Community Management System.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Leadership Assignment - Community Management System

Congratulations ${data.name}!

You have been assigned as ${data.role.replace('_', ' ')} for ${data.location} by ${data.assignedBy}.

Assignment Details:
- Role: ${data.role.replace('_', ' ')}
- Location: ${data.location}
- Assigned By: ${data.assignedBy}
- Assignment Date: ${new Date().toLocaleDateString()}

Access your dashboard: ${data.loginUrl}

Welcome to the leadership team!

This email was sent automatically by the Community Management System.
    `;

    return { subject, html, text };
  }

  private getRoleResponsibilities(role: string): string {
    const responsibilities = {
      'ADMIN': `
        <li>System administration and user management</li>
        <li>Overall system monitoring and maintenance</li>
        <li>Policy implementation and enforcement</li>
        <li>Data analytics and reporting</li>
      `,
      'CELL_LEADER': `
        <li>Managing multiple villages within your cell</li>
        <li>Coordinating with village leaders</li>
        <li>Overseeing cell-wide activities and initiatives</li>
        <li>Reporting to regional administrators</li>
      `,
      'VILLAGE_LEADER': `
        <li>Managing your assigned village</li>
        <li>Coordinating with isibo leaders</li>
        <li>Organizing village-wide activities</li>
        <li>Reporting to your cell leader</li>
      `,
      'ISIBO_LEADER': `
        <li>Managing your assigned isibo group</li>
        <li>Organizing isibo meetings and activities</li>
        <li>Maintaining member records and attendance</li>
        <li>Reporting to your village leader</li>
      `,
      'CITIZEN': `
        <li>Participating in community activities</li>
        <li>Attending meetings and events</li>
        <li>Contributing to community development</li>
        <li>Following community guidelines</li>
      `
    };

    return responsibilities[role] || '<li>General community participation</li>';
  }
}
