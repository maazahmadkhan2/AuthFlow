import React, { useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { FaExclamationTriangle, FaEnvelope, FaClock, FaInfoCircle } from 'react-icons/fa';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface PendingApprovalMessageProps {
  user: any;
  emailVerified: boolean;
}

export const PendingApprovalMessage: React.FC<PendingApprovalMessageProps> = ({ user, emailVerified }) => {
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Check user status in database
  const { data: dbUser, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.uid}`],
    enabled: !!user?.uid,
    retry: false,
  });

  const handleResendVerification = async () => {
    if (!user) return;
    
    setResendingVerification(true);
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 10000);
    } catch (error: any) {
      console.error('Error sending verification email:', error);
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
              <div className="text-success">
                <FaInfoCircle className="me-1" />
                Verification email sent! Check your inbox.
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

  if (dbUser.status === 'pending') {
    return (
      <Alert variant="info" className="mb-4">
        <div className="d-flex align-items-start">
          <FaClock className="me-2 mt-1" />
          <div>
            <Alert.Heading className="h6 mb-2">Account Pending Approval</Alert.Heading>
            <p className="mb-2">
              Your account has been created and is awaiting administrator approval.
              You'll receive an email notification once your account is approved.
            </p>
            <div className="bg-light p-2 rounded">
              <small>
                <strong>Account Details:</strong><br />
                Name: {dbUser.displayName}<br />
                Role: {dbUser.role}<br />
                Status: {dbUser.status}<br />
                Registration: {new Date(dbUser.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>
        </div>
      </Alert>
    );
  }

  if (dbUser.status === 'rejected') {
    return (
      <Alert variant="danger">
        <FaExclamationTriangle className="me-2" />
        <strong>Account Rejected</strong>
        <br />
        Your account application was not approved. 
        {dbUser.rejectionReason && (
          <div className="mt-2">
            <strong>Reason:</strong> {dbUser.rejectionReason}
          </div>
        )}
        Please contact support for more information.
      </Alert>
    );
  }

  if (dbUser.status === 'inactive') {
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