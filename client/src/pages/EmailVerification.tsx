import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Container, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { auth } from '../lib/firebase';
import { applyActionCode, checkActionCode, ActionCodeInfo } from 'firebase/auth';

interface EmailVerificationProps {
  // Component can be used for different verification scenarios
  mode?: 'verify' | 'standalone';
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ mode = 'standalone' }) => {
  const [location, setLocation] = useLocation();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [actionInfo, setActionInfo] = useState<ActionCodeInfo | null>(null);

  // Extract action code from URL parameters
  const getActionCodeFromUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('oobCode');
  };

  // Extract mode from URL parameters (for Firebase Auth URLs)
  const getModeFromUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('mode');
  };

  useEffect(() => {
    const verifyEmail = async () => {
      const actionCode = getActionCodeFromUrl();
      const urlMode = getModeFromUrl();

      if (!actionCode) {
        setVerificationState('invalid');
        setErrorMessage('Invalid verification link. No action code found.');
        return;
      }

      try {
        // First, check the action code to get information about it
        const info = await checkActionCode(auth, actionCode);
        setActionInfo(info);

        // Apply the action code to verify the email
        await applyActionCode(auth, actionCode);

        // Update verification state
        setVerificationState('success');

        // If user is logged in, we can update their profile
        if (auth.currentUser) {
          // Reload user to get updated email verification status
          await auth.currentUser.reload();
          
          // Update user data in Firestore if needed
          await updateUserVerificationStatus(auth.currentUser.uid);
        }

      } catch (error: any) {
        console.error('Email verification error:', error);
        setVerificationState('error');
        
        // Handle specific error types
        switch (error.code) {
          case 'auth/expired-action-code':
            setErrorMessage('This verification link has expired. Please request a new verification email.');
            break;
          case 'auth/invalid-action-code':
            setErrorMessage('This verification link is invalid or has already been used.');
            break;
          case 'auth/user-disabled':
            setErrorMessage('This user account has been disabled.');
            break;
          case 'auth/user-not-found':
            setErrorMessage('No user account found for this verification link.');
            break;
          default:
            setErrorMessage(`Verification failed: ${error.message}`);
        }
      }
    };

    verifyEmail();
  }, []);

  // Update user verification status in Firestore
  const updateUserVerificationStatus = async (uid: string) => {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        emailVerified: true,
        verifiedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user verification status:', error);
      // Don't show this error to user as email verification still succeeded
    }
  };

  const handleContinueToLogin = () => {
    setLocation('/auth');
  };

  const handleGoToDashboard = () => {
    setLocation('/dashboard');
  };

  const handleRequestNewVerification = async () => {
    try {
      const { sendEmailVerification } = await import('firebase/auth');
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setErrorMessage('A new verification email has been sent to your email address.');
      } else {
        setErrorMessage('Please log in first to request a new verification email.');
      }
    } catch (error: any) {
      setErrorMessage(`Failed to send verification email: ${error.message}`);
    }
  };

  const renderContent = () => {
    switch (verificationState) {
      case 'loading':
        return (
          <Card className="text-center shadow-lg border-0">
            <Card.Body className="py-5 px-4">
              <div className="mb-4">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-3">Verifying Your Email</h3>
              <p className="text-muted mb-0 lead">Please wait while we verify your email address...</p>
              <div className="mt-4">
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: '100%' }}></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        );

      case 'success':
        return (
          <Card className="text-center shadow-lg border-0">
            <Card.Body className="py-5 px-4">
              <div className="mb-4">
                <div className="bg-success rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                  <svg 
                    width="40" 
                    height="40" 
                    fill="white" 
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                </div>
              </div>
              <h2 className="fw-bold text-success mb-3">Email Verified Successfully!</h2>
              <p className="text-muted mb-4 lead">
                Your email address has been verified. You can now access all features of your account.
              </p>
              {actionInfo && (
                <div className="bg-light rounded p-3 mb-4">
                  <small className="text-muted">
                    Verified email: <strong className="text-primary">{actionInfo.data.email}</strong>
                  </small>
                </div>
              )}
              <div className="d-grid gap-3">
                {auth.currentUser ? (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={handleGoToDashboard}
                    className="fw-semibold py-3"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={handleContinueToLogin}
                    className="fw-semibold py-3"
                  >
                    Continue to Login
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        );

      case 'error':
        return (
          <Card className="text-center shadow-lg border-0">
            <Card.Body className="py-5 px-4">
              <div className="mb-4">
                <div className="bg-danger rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                  <svg 
                    width="40" 
                    height="40" 
                    fill="white" 
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                  </svg>
                </div>
              </div>
              <h2 className="fw-bold text-danger mb-3">Verification Failed</h2>
              <div className="bg-light border-start border-4 border-danger p-4 mb-4 text-start">
                <p className="mb-0 text-muted">{errorMessage}</p>
              </div>
              <div className="d-grid gap-3">
                {auth.currentUser && (
                  <Button 
                    variant="outline-primary" 
                    onClick={handleRequestNewVerification}
                    className="fw-semibold py-2"
                  >
                    Request New Verification Email
                  </Button>
                )}
                <Button 
                  variant="primary" 
                  onClick={handleContinueToLogin}
                  className="fw-semibold py-3"
                >
                  Go to Login
                </Button>
              </div>
            </Card.Body>
          </Card>
        );

      case 'invalid':
        return (
          <Card className="text-center shadow-lg border-0">
            <Card.Body className="py-5 px-4">
              <div className="mb-4">
                <div className="bg-warning rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                  <svg 
                    width="40" 
                    height="40" 
                    fill="white" 
                    viewBox="0 0 16 16"
                  >
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                  </svg>
                </div>
              </div>
              <h2 className="fw-bold text-warning mb-3">Invalid Verification Link</h2>
              <div className="bg-light border-start border-4 border-warning p-4 mb-4 text-start">
                <p className="mb-0 text-muted">{errorMessage}</p>
              </div>
              <div className="d-grid gap-3">
                <Button 
                  variant="primary" 
                  onClick={handleContinueToLogin}
                  className="fw-semibold py-3"
                >
                  Go to Login
                </Button>
              </div>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            {/* App Branding Header */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm mb-3" style={{ width: '60px', height: '60px' }}>
                <span className="fw-bold text-primary fs-4">A</span>
              </div>
              <h1 className="text-white fw-bold mb-1">AuthFlow</h1>
              <p className="text-white-50 mb-0">Email Verification</p>
            </div>
            
            {renderContent()}
            
            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-white-50 small mb-0">
                © 2025 AuthFlow. Secure email verification powered by Firebase.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default EmailVerification;