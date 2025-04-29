export const contactFormTemplate = (
  subject: string,
  name: string,
  email: string,
  phone: string,
  message: string,
): string => {
  const template = `
  <!DOCTYPE html>
  <html>
   <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link rel="shortcut icon" href="${process.env.ADMIN_WEB_PORTAL_URL}/email_assets/communiserver-logo.png">
    <title>New Contact Form Submission</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>
  <body style="margin: 0; padding: 32px;">
   <table align="center" border="1" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; max-width: 600px; border-color: #E3E9ED;">
  
    <tr>
     <td align="left" style="padding: 24px 32px; background-color: #f9f9f9;">
      <img src="${process.env.ADMIN_WEB_PORTAL_URL}/email_assets/communiserver-logo.png" height="72px">
     </td>
    </tr>
  
    <tr>
     <td bgcolor="#FFFFFF">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
     <tr>
      <td style="color: black; font-family: 'open sans', sans-serif; font-weight: 300; font-size: 24px; padding:32px;">
         New Contact Form Submission<br><br>
         <b style="color:#D50057; font-weight: 700; font-size: 20px">Subject: ${subject}</b><br><br>
         <span style="font-size: 16px; font-weight: 400; line-height: 20px;">
           <b>Sender's Name:</b> ${name}<br>
           <b>Email:</b> ${email}<br>
           <b>Phone:</b> ${phone}<br>
           <b>Message:</b><br> ${message}
         </span>
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
                    Contact us if needed:
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
