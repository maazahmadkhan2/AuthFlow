import React, { useState } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { useEmailService } from '../hooks/useEmailService';

interface SendGridEmailServiceProps {
  userEmail?: string;
  userName?: string;
  userId?: string;
  variant?: 'resend' | 'send';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const SendGridEmailService: React.FC<SendGridEmailServiceProps> = ({
  userEmail,
  userName,
  userId,
  variant = 'send',
  onSuccess,
  onError
}) => {
  const { sendVerificationEmail, isLoading, error, clearError } = useEmailService();
  const [success, setSuccess] = useState(false);

  const handleSendEmail = async () => {
    if (!userEmail || !userName || !userId) {
      const errorMsg = 'Missing required information to send verification email';
      onError?.(errorMsg);
      return;
    }

    clearError();
    setSuccess(false);

    // Generate a custom action code
    const actionCode = btoa(`${userId}_${Date.now()}_verify`);

    const result = await sendVerificationEmail({
      userEmail,
      userName,
      actionCode
    });

    if (result) {
      setSuccess(true);
      onSuccess?.();
    } else if (error) {
      onError?.(error);
    }
  };

  const buttonText = variant === 'resend' ? 'Resend Verification Email' : 'Send Verification Email';
  const successMessage = variant === 'resend' 
    ? 'Verification email has been resent! Check your inbox.' 
    : 'Verification email sent! Check your inbox.';

  return (
    <div className="sendgrid-email-service">
      {success && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Button 
        variant={variant === 'resend' ? 'outline-primary' : 'primary'}
        onClick={handleSendEmail}
        disabled={isLoading || !userEmail}
        className="d-flex align-items-center gap-2"
      >
        {isLoading && <Spinner as="span" animation="border" size="sm" />}
        {buttonText}
      </Button>
    </div>
  );
};

// Utility component for easy integration into forms
export const ResendVerificationButton: React.FC<{
  userEmail: string;
  userName: string;
  userId: string;
  onSuccess?: () => void;
}> = ({ userEmail, userName, userId, onSuccess }) => {
  return (
    <SendGridEmailService
      userEmail={userEmail}
      userName={userName}
      userId={userId}
      variant="resend"
      onSuccess={onSuccess}
    />
  );
};