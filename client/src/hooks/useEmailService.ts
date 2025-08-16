import { useState } from 'react';
import { auth } from '../lib/firebase';

interface SendVerificationEmailParams {
  userEmail: string;
  userName: string;
  actionCode: string;
}

export const useEmailService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVerificationEmail = async (params: SendVerificationEmailParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          baseUrl: window.location.origin
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }

      return data.success;
    } catch (err: any) {
      setError(err.message);
      console.error('Email service error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailServiceStatus = async (): Promise<{ available: boolean; verificationUrlTemplate: string } | null> => {
    try {
      const response = await fetch('/api/email-service/status');
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('Failed to check email service status:', err);
    }
    return null;
  };

  const sendCustomEmail = async (params: {
    to: string;
    subject: string;
    html: string;
    text: string;
    from?: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/send-custom-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      return data.success;
    } catch (err: any) {
      setError(err.message);
      console.error('Custom email service error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendVerificationEmail,
    sendCustomEmail,
    checkEmailServiceStatus,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};