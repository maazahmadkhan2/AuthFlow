import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (for server-side operations)
let adminApp;
try {
  if (getApps().length === 0) {
    // For Replit, we'll use the client config since we don't have service account
    // This is a simplified approach for development
    adminApp = initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  } else {
    adminApp = getApps()[0];
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export const adminAuth = adminApp ? getAuth(adminApp) : null;

/**
 * Generate a custom email verification link using Firebase Admin
 */
export async function generateEmailVerificationLink(email: string): Promise<string | null> {
  if (!adminAuth) {
    console.error('Firebase Admin not initialized');
    return null;
  }

  try {
    // Generate email verification link
    const link = await adminAuth.generateEmailVerificationLink(email, {
      url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/auth`,
      handleCodeInApp: true,
    });
    
    return link;
  } catch (error) {
    console.error('Error generating email verification link:', error);
    return null;
  }
}

/**
 * Generate password reset link using Firebase Admin
 */
export async function generatePasswordResetLink(email: string): Promise<string | null> {
  if (!adminAuth) {
    console.error('Firebase Admin not initialized');
    return null;
  }

  try {
    const link = await adminAuth.generatePasswordResetLink(email, {
      url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/auth`,
      handleCodeInApp: true,
    });
    
    return link;
  } catch (error) {
    console.error('Error generating password reset link:', error);
    return null;
  }
}