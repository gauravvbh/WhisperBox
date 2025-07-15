// src/emails/verificationEmailTemplate.ts

export function verificationEmailTemplate(username: string, otp: string): string {
    return `
  <html lang="en">
    <head>
      <title>Verification Code</title>
      <style>
        body { font-family: Roboto, Verdana, sans-serif; }
        .code { font-size: 24px; color: #333; }
        .button { background: #61dafb; padding: 10px; text-decoration: none; }
      </style>
    </head>
    <body>
      <h2>Hello ${username},</h2>
      <p>Thank you for registering. Please use the following verification code to complete your registration process:</p>
      <p class="code">${otp}</p>
      <p>If you did not request this code, please ignore this email.</p>
      <a class="button" href="http://localhost:3000/verify/${username}">Verify here</a>
    </body>
  </html>
  `;
}
