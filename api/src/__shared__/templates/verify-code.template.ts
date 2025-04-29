export const verificationCodeTemplate = (
  name: string,
  verificationCode: string,
): string => {
  const adminUrl = process.env.ADMIN_WEB_PORTAL_URL;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="shortcut icon" href="${adminUrl}/email_assets/communiserver-logo.png">
      <title>Verification Code</title>
    </head>
    <body style="margin: 0; padding: 32px; font-family: 'Open Sans', sans-serif; background-color: #F4F4F9;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #FFFFFF; border: 1px solid #E3E9ED;">
        <!-- Header -->
        <tr>
          <td style="padding: 24px 32px; background: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7)), url('${adminUrl}/email_assets/bg.jpg') center right / 60% no-repeat;">
            <img src="${adminUrl}/email_assets/communiserver-logo.png" alt="Communiserver Logo" height="72">
          </td>
        </tr>
        
        <!-- Email Content -->
        <tr>
          <td style="padding: 32px;">
            <h1 style="color: #000000; font-weight: 300; font-size: 24px; margin-bottom: 16px;">Your Verification Code</h1>
            <p style="color: #000000; font-size: 16px; margin-bottom: 24px;">
              <strong style="color: #D50057; font-size: 18px;">${name},</strong><br>
              Please use the verification code below to verify your email address. The code is valid for the next 30 minutes.
            </p>
            <p style="text-align: center; margin-bottom: 32px;">
              <span style="display: inline-block; background-color: #F4F4F9; color: #D50057; padding: 16px 32px; font-size: 24px; font-weight: bold; border: 1px solid #D50057; border-radius: 8px;">${verificationCode}</span>
            </p>
            <p style="color: #8C9091; font-size: 14px;">
              If you did not request this verification code, please ignore this email or contact support.
            </p>
          </td>
        </tr>
  
        <!-- Footer -->
        <tr>
          <td style="background-color: #E3E9ED; padding: 16px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size: 12px; color: #383838; font-weight: bold;">Reach us:</td>
                <td style="font-size: 12px; text-align: right;"><a href="https://communiserver.com/en/home-english/" style="color: #D50057;">Website</a></td>
                <td style="font-size: 12px; text-align: right;"><a href="https://www.linkedin.com/communiserver" style="color: #D50057;">LinkedIn</a></td>
                <td style="font-size: 12px; text-align: right;"><a href="https://twitter.com/communiserver" style="color: #D50057;">Twitter</a></td>
                <td style="font-size: 12px; text-align: right;"><a href="https://www.facebook.com/communiserver" style="color: #D50057;">Facebook</a></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
};
