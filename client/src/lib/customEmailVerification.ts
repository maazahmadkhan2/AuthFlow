import { auth } from './firebase';
import { sendEmailVerification } from 'firebase/auth';

/**
 * Send custom email verification that uses our app's verification page
 */
export const sendCustomVerificationEmail = async (user: any): Promise<boolean> => {
  if (!user) {
    throw new Error('User is required');
  }

  try {
    // Create a temporary verification link to get the action code
    // We'll intercept this and send our own email
    const originalFetch = window.fetch;
    let capturedLink = '';
    
    // Mock the fetch to capture the verification link
    window.fetch = async (url, options) => {
      if (typeof url === 'string' && url.includes('verifyEmail')) {
        // Capture the Firebase verification link
        capturedLink = url;
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return originalFetch(url, options);
    };

    // Send Firebase verification email (this will be intercepted)
    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth`,
      handleCodeInApp: false,
    });

    // Restore original fetch
    window.fetch = originalFetch;

    // If we captured a link, extract action code and send custom email
    if (capturedLink) {
      const urlParams = new URLSearchParams(capturedLink.split('?')[1]);
      const actionCode = urlParams.get('oobCode');
      
      if (actionCode) {
        // Send our custom email with the Firebase action code
        const response = await fetch('/api/send-verification-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: user.email,
            userName: user.displayName || 'User',
            verificationLink: `${window.location.origin}/email-verification?mode=verifyEmail&oobCode=${actionCode}&continueUrl=${encodeURIComponent(window.location.origin + '/auth')}`
          })
        });

        return response.ok;
      }
    }

    // Fallback: try alternative approach with direct Firebase link generation
    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth`,
      handleCodeInApp: true,
    });

    // Send custom email using the verification approach
    const response = await fetch('/api/send-verification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: user.email,
        userName: user.displayName || 'User',
        verificationLink: `firebase-link-${Date.now()}` // This will trigger fallback in server
      })
    });

    return response.ok;

  } catch (error) {
    console.error('Custom email verification error:', error);
    
    // Ultimate fallback: just use Firebase's default system
    try {
      await sendEmailVerification(user);
      return true;
    } catch (fallbackError) {
      console.error('Fallback verification error:', fallbackError);
      return false;
    }
  }
};