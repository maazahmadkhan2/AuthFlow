// SendGrid integration for Firebase email verification
import { auth } from './firebase';
import { generateActionCodeSettings } from 'firebase/auth';

interface SendGridVerificationParams {
  userEmail: string;
  userName: string;
  userId: string;
}

/**
 * Generate Firebase action code and send verification email via SendGrid
 */
export const sendVerificationEmailViaSendGrid = async (params: SendGridVerificationParams): Promise<boolean> => {
  try {
    const { userEmail, userName, userId } = params;

    // Generate Firebase action code for email verification
    // Note: This is a custom implementation that works with Firebase Auth
    const actionCodeSettings = {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: true
    };

    // Create a temporary verification token/code
    // In practice, Firebase generates this internally when sendEmailVerification is called
    // We'll use a timestamp-based approach for the demo
    const actionCode = btoa(`${userId}_${Date.now()}_verify`);

    // Send verification email via SendGrid API
    const response = await fetch('/api/send-verification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        userName,
        actionCode,
        baseUrl: window.location.origin
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send verification email');
    }

    console.log('SendGrid verification email sent successfully');
    return result.success;

  } catch (error: any) {
    console.error('SendGrid email verification error:', error);
    return false;
  }
};

/**
 * Generate custom action code for email verification
 * This is a simplified version - in production, you'd use Firebase Admin SDK
 */
export const generateCustomActionCode = (userId: string, email: string): string => {
  const timestamp = Date.now();
  const data = {
    userId,
    email,
    action: 'verifyEmail',
    timestamp,
    // Add a simple hash for basic verification
    hash: btoa(`${userId}_${email}_${timestamp}_verify`)
  };
  
  return btoa(JSON.stringify(data));
};

/**
 * Verify custom action code
 */
export const verifyCustomActionCode = (actionCode: string): { userId: string; email: string; timestamp: number } | null => {
  try {
    const decoded = JSON.parse(atob(actionCode));
    
    // Check if code is expired (24 hours)
    const now = Date.now();
    const codeAge = now - decoded.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (codeAge > maxAge) {
      throw new Error('Verification link has expired');
    }
    
    // Verify hash
    const expectedHash = btoa(`${decoded.userId}_${decoded.email}_${decoded.timestamp}_verify`);
    if (decoded.hash !== expectedHash) {
      throw new Error('Invalid verification code');
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      timestamp: decoded.timestamp
    };
  } catch (error) {
    console.error('Action code verification error:', error);
    return null;
  }
};

/**
 * Check if SendGrid email service is available
 */
export const checkSendGridAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/email-service/status');
    if (response.ok) {
      const data = await response.json();
      return data.available;
    }
    return false;
  } catch (error) {
    console.error('Error checking SendGrid availability:', error);
    return false;
  }
};