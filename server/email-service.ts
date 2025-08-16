import { MailService } from '@sendgrid/mail';
import { createVerificationEmailData, EmailVerificationData, buildVerificationUrl } from '../client/src/lib/emailTemplates';

// Initialize SendGrid service
const initializeEmailService = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not found. Email sending will be disabled.');
    return null;
  }

  const mailService = new MailService();
  mailService.setApiKey(apiKey);
  return mailService;
};

const mailService = initializeEmailService();

export interface SendVerificationEmailParams {
  userEmail: string;
  userName: string;
  actionCode: string;
  baseUrl?: string;
  fromEmail?: string;
}

/**
 * Send email verification email via SendGrid
 */
export const sendVerificationEmail = async (params: SendVerificationEmailParams): Promise<boolean> => {
  if (!mailService) {
    console.error('SendGrid not configured. Cannot send verification email.');
    return false;
  }

  const {
    userEmail,
    userName,
    actionCode,
    baseUrl = process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000',
    fromEmail = 'noreply@authflow.app' // Update with your verified sender - must be verified in SendGrid
  } = params;

  try {
    // Build the verification URL that points to your verification page
    const verificationUrl = buildVerificationUrl(baseUrl, actionCode);

    // Create email template data
    const emailData: EmailVerificationData = {
      userName,
      userEmail,
      verificationUrl,
      appName: 'AuthFlow'
    };

    // Generate the email content
    const emailContent = createVerificationEmailData(emailData, fromEmail);

    // Send the email
    await mailService.send(emailContent);
    
    console.log(`Verification email sent successfully to ${userEmail}`);
    return true;

  } catch (error: any) {
    console.error('Failed to send verification email:', error);
    
    // Log specific SendGrid errors
    if (error.response?.body) {
      console.error('SendGrid error details:', error.response.body);
    }
    
    return false;
  }
};

/**
 * Send custom verification email (for manual verification flow)
 */
export const sendCustomVerificationEmail = async (params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}): Promise<boolean> => {
  if (!mailService) {
    console.error('SendGrid not configured. Cannot send email.');
    return false;
  }

  const { to, subject, html, text, from = 'noreply@authflow.app' } = params;

  try {
    await mailService.send({
      to,
      from,
      subject,
      html,
      text
    });

    console.log(`Custom email sent successfully to ${to}`);
    return true;

  } catch (error: any) {
    console.error('Failed to send custom email:', error);
    if (error.response?.body) {
      console.error('SendGrid error details:', error.response.body);
    }
    return false;
  }
};

/**
 * Check if email service is available
 */
export const isEmailServiceAvailable = (): boolean => {
  return mailService !== null;
};

/**
 * Get the verification URL template for SendGrid dynamic templates
 * Use this if you prefer to use SendGrid's dynamic templates instead of HTML emails
 */
export const getVerificationUrlTemplate = (baseUrl?: string): string => {
  const base = baseUrl || process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000';
  return `${base}/verify-email?mode=verifyEmail&oobCode={{actionCode}}`;
};