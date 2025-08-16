// Email verification template utilities for SendGrid integration

export interface EmailVerificationData {
  userName: string;
  userEmail: string;
  verificationUrl: string;
  appName: string;
}

export const generateVerificationEmailTemplate = (data: EmailVerificationData): {
  subject: string;
  html: string;
  text: string;
} => {
  const { userName, userEmail, verificationUrl, appName = 'AuthFlow' } = data;

  const subject = `Verify your email address for ${appName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - ${appName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #007bff;
          margin-top: 0;
          font-size: 24px;
        }
        .verify-button {
          display: inline-block;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 5px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .verify-button:hover {
          background-color: #0056b3;
        }
        .alternative-link {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          word-break: break-all;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 30px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .security-note {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${appName}</h1>
        </div>
        
        <div class="content">
          <h2>Verify Your Email Address</h2>
          
          <p>Hello ${userName || 'there'},</p>
          
          <p>Thank you for signing up for ${appName}! To complete your account setup and ensure the security of your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="verify-button" style="color: white; text-decoration: none;">
              Verify Email Address
            </a>
          </div>
          
          <div class="security-note">
            <strong>Security Note:</strong> This verification link will expire in 24 hours for your security. If you didn't create an account with us, you can safely ignore this email.
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          
          <div class="alternative-link">
            <a href="${verificationUrl}" style="color: #007bff;">${verificationUrl}</a>
          </div>
          
          <p>Once verified, you'll be able to:</p>
          <ul>
            <li>Access your personalized dashboard</li>
            <li>Use all ${appName} features</li>
            <li>Receive important account notifications</li>
            <li>Ensure your account security</li>
          </ul>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Welcome to ${appName}!</p>
          
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${userEmail}</p>
          <p>© 2025 ${appName}. All rights reserved.</p>
          <p><small>This is an automated message, please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${appName} - Email Verification
    
    Hello ${userName || 'there'},
    
    Thank you for signing up for ${appName}! To complete your account setup and ensure the security of your account, please verify your email address.
    
    Click or copy this link to verify your email:
    ${verificationUrl}
    
    Security Note: This verification link will expire in 24 hours for your security. If you didn't create an account with us, you can safely ignore this email.
    
    Once verified, you'll be able to:
    - Access your personalized dashboard
    - Use all ${appName} features  
    - Receive important account notifications
    - Ensure your account security
    
    If you have any questions or need assistance, please contact our support team.
    
    Welcome to ${appName}!
    
    Best regards,
    The ${appName} Team
    
    ---
    This email was sent to ${userEmail}
    © 2025 ${appName}. All rights reserved.
    This is an automated message, please do not reply to this email.
  `;

  return {
    subject,
    html,
    text
  };
};

// Helper function to construct verification URL
export const buildVerificationUrl = (baseUrl: string, actionCode: string): string => {
  // Use Firebase Auth URL format that your verification page expects
  return `${baseUrl}/verify-email?mode=verifyEmail&oobCode=${actionCode}`;
};

// SendGrid integration helper
export interface SendGridEmailData {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

export const createVerificationEmailData = (
  data: EmailVerificationData,
  fromEmail: string = 'khanmaaz22@gmail.com'
): SendGridEmailData => {
  const template = generateVerificationEmailTemplate(data);
  
  return {
    to: data.userEmail,
    from: fromEmail,
    subject: template.subject,
    text: template.text,
    html: template.html
  };
};