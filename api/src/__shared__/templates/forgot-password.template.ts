export const forgotPasswordEmailTemplate = (
  name: string,
  resetPasswordLink: string,
): string => {
  const template = `
  <!DOCTYPE html>
  <html>
   <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link rel="shortcut icon" href="${process.env.ADMIN_WEB_PORTAL_URL}/email_assets/communiserver-logo.png">
    <title>Welcome to Communiserver</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>
  <body style="margin: 0; padding: 32px;">
   <table align="center" border="1" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; max-width: 600px; border-color: #E3E9ED; ">
  
  
    <tr>
     <td align="left" style="padding: 24px 32px;  background-image: linear-gradient( rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7) ), url('${process.env.ADMIN_WEB_PORTAL_URL}/email_assets/bg.jpg'); background-size: 60%; background-position: center right; background-repeat: no-repeat;">
      <img src="${process.env.ADMIN_WEB_PORTAL_URL}/email_assets/communiserver-logo.png" height="72px">
     </td>
    </tr>
  
    <tr >
     <td bgcolor="#FFFFFF">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
     <tr>
      <td style="color: black; font-family: 'open sans', sans-serif; font-weight: 300; font-size: 32px; padding:96px 32px 0px 32px;">
         Reset Password<br><br>
      <b style="color:#D50057; font-weight: 700; font-size: 24px">${name},</b><br>
      <span style="font-size: 18px; font-weight: 400; line-height: 18px;">We noticed that you wanted to reset your password, kindly click the button below to initiate the password reset process.<br></span><br>
      </td>
     </tr>
     <tr>
      <td style=" padding:0px 32px 0px 32px;">
         <a href="${resetPasswordLink}" style="background-color: #D50057; border-radius: 32px;  color: #ffffff;  font-size: 14px; font-family: 'open sans', sans-serif; font-weight: 600; padding: 16px 48px; text-decoration: none;">Reset Password</a> 
      </td>
     </tr>
     <tr>
      <td style="color: black; font-family: 'open sans', sans-serif; font-weight: 300; font-size: 32px; padding:64px 32px 0px 32px;">
        <span style="font-size: 18px; color:#8C9091; line-height: 14px;">This link will remain active for the next 24 hours. If it expires, kindly reset again your password for a new link.<br><br></span><br>
      </td>
       </tr>
    </table>
     </td>
    </tr>
  
  
    <td bgcolor="#E3E9ED" style="padding: 32px;">
       <table border="0" cellpadding="0" cellspacing="0" width="100%" style="">
        <tbody>
          <tr>
            <td>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tbody>
                  <tr>
                    <td width="70%" valign="top" style="padding: 8px; font-family: 'open sans MS', sans-serif; color: #383838; font-weight: bold; font-size: 12px ">
                    Reach us:
                    </td>
                    <td width="10%" valign="top" style="text-align: right; padding: 8px; font-family: 'open sans MS', sans-serif; color: #80888d; font-size: 12px ">
                      <a href="https://communiserver.com/en/home-english/" style="color: #D50057">Website</a>
                    </td>
                    <td width="10%" valign="top" style="text-align: right; padding: 8px; font-family: 'open sans MS', sans-serif; color: #80888d; font-size: 12px ">
                      <a href="https://communiserver.com/en/home-english/" style="color: #D50057">LinkedIn</a>
                    </td>
                    <td width="10%" valign="top" style="text-align: right; padding: 8px; font-family: 'open sans MS', sans-serif; color: #80888d; font-size: 12px ">
                      <a href="https://twitter.com/communiserver" style="color: #D50057">Twitter</a>
                    </td>
                    <td width="10%" valign="top" style="text-align: right; padding: 8px; font-family: 'open sans MS', sans-serif; color: #80888d; font-size: 12px ">
                      <a href="https://www.facebook.com/communiserver" style="color: #D50057">Facebook</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  
  
   </table>
  </body>
  </html>
`;
  return template;
};
