import React, { useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { FaExclamationTriangle, FaEnvelope, FaClock, FaInfoCircle } from 'react-icons/fa';
import { auth } from '../lib/firebase';
import { useQuery } from '@tanstack/react-query';

interface PendingApprovalMessageProps {
  user: any;
  emailVerified: boolean;
}

export const PendingApprovalMessage: React.FC<PendingApprovalMessageProps> = ({ user, emailVerified }) => {
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Check user status in database
  const { data: dbUser, isLoading } = useQuery<any>({
    queryKey: [`/api/users/${user?.uid}`],
    enabled: !!user?.uid,
    retry: false,
  });

  const handleResendVerification = async () => {
    if (!user) return;
    
    setResendingVerification(true);
    try {
      // Send verification email via SendGrid exclusively
      const sendGridResponse = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.displayName || 'User',
          actionCode: btoa(`${user.uid}_${Date.now()}_verify`),
          baseUrl: window.location.origin
        })
      });

      if (sendGridResponse.ok) {
        setVerificationSent(true);
        setTimeout(() => setVerificationSent(false), 10000);
        console.log('Verification email sent via SendGrid');
      } else {
        const errorText = await sendGridResponse.text();
        throw new Error(`SendGrid email failed: ${errorText}`);
      }
    } catch (error: any) {
      console.error('Error sending verification email via SendGrid:', error);
      alert('Failed to send verification email. Please try again.');
    } finally {
      setResendingVerification(false);
    }
  };

  if (isLoading) {
    return (
      <Alert variant="info" className="text-center">
        <Spinner animation="border" size="sm" className="me-2" />
        Checking account status...
      </Alert>
    );
  }

  // Email not verified
  if (!emailVerified) {
    return (
      <Alert variant="warning" className="mb-4">
        <div className="d-flex align-items-start">
          <FaEnvelope className="me-2 mt-1" />
          <div className="flex-grow-1">
            <Alert.Heading className="h6 mb-2">Email Verification Required</Alert.Heading>
            <p className="mb-2">
              Please verify your email address to continue. Check your inbox for a verification link.
            </p>
            {verificationSent ? (
              <div className="text-success mb-2">
                <FaInfoCircle className="me-1" />
                Verification email sent! Check your inbox and click the verification link.
              </div>
            ) : (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                data-testid="button-resend-verification"
              >
                {resendingVerification ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaEnvelope className="me-1" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Alert>
    );
  }

  // Account status checks
  if (!dbUser) {
    return (
      <Alert variant="danger">
        <FaExclamationTriangle className="me-2" />
        <strong>Account Not Found</strong>
        <br />
        Your account was not found in our system. Please contact support.
      </Alert>
    );
  }

  if (dbUser?.status === 'pending') {
    return (
      <Alert variant="info" className="mb-4">
        <div className="d-flex align-items-start">
          <FaClock className="me-2 mt-1" />
          <div>
            <Alert.Heading className="h6 mb-2">Account Pending Approval</Alert.Heading>
            <p className="mb-2">
              Your account has been created and is awaiting administrator approval.
              Please also verify your email address if you haven't already.
            </p>
            
            {!emailVerified && (
              <div className="bg-light p-3 rounded mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaEnvelope className="text-warning me-2" />
                  <small className="fw-bold text-warning">Email Verification Required</small>
                </div>
                <small className="text-muted d-block mb-2">
                  Please verify your email address to complete your registration process.
                </small>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="d-flex align-items-center gap-1"
                >
                  {resendingVerification ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaEnvelope />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </Button>
                {verificationSent && (
                  <div className="text-success mt-2 small">
                    <FaInfoCircle className="me-1" />
                    Verification email sent! Check your inbox and click the link to verify via your app.
                  </div>
                )}
              </div>
            )}
            <div className="bg-light p-2 rounded">
              <small>
                <strong>Account Details:</strong><br />
                Name: {dbUser?.displayName}<br />
                Role: {dbUser?.role}<br />
                Status: {dbUser?.status}<br />
                Registration: {dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString() : 'N/A'}
              </small>
            </div>
          </div>
        </div>
      </Alert>
    );
  }

  if (dbUser?.status === 'rejected') {
    return (
      <Alert variant="danger">
        <FaExclamationTriangle className="me-2" />
        <strong>Account Rejected</strong>
        <br />
        Your account application was not approved. 
        {dbUser?.rejectionReason && (
          <div className="mt-2">
            <strong>Reason:</strong> {dbUser.rejectionReason}
          </div>
        )}
        Please contact support for more information.
      </Alert>
    );
  }

  if (dbUser?.status === 'inactive') {
    return (
      <Alert variant="warning">
        <FaExclamationTriangle className="me-2" />
        <strong>Account Inactive</strong>
        <br />
        Your account has been deactivated. Please contact support to reactivate your account.
      </Alert>
    );
  }

  // Account is approved - should redirect to dashboard
  return null;
};