import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, forgotPasswordSchema } from '../../../shared/firebase-schema';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, resendEmailVerification, auth, checkEmailExists, db, getUserData } from '../lib/firebase';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useLocation, Link } from 'wouter';
import { FaGoogle, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { PendingApprovalMessage } from '../components/PendingApprovalMessage';
import { PasswordResetModal } from '../components/PasswordResetModal';

export const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning'; message: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [, setLocation] = useLocation();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      acceptTerms: false,
    },
  });

  const forgotPasswordForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const showAlert = (type: 'success' | 'danger' | 'warning', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmailVerified(currentUser.emailVerified);
        // Reset verification alert when auth state changes
        setShowResendVerification(false);
        setAlert(null);
      } else {
        setUser(null);
        setEmailVerified(false);
        setShowResendVerification(false);
        setAlert(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (data: any) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Check if user exists in Firestore
      const userData = await getUserData(result.user.uid);
      if (!userData) {
        showAlert('danger', 'Account not found. Please contact support.');
        return;
      }
      
      if (userData.status === 'pending') {
        showAlert('warning', 'Your account is pending approval. Please wait for an administrator to approve your access.');
        return;
      }
      
      if (userData.status === 'rejected') {
        const reason = userData.rejectionReason || 'No reason provided';
        showAlert('danger', `Your account has been rejected. Reason: ${reason}`);
        return;
      }
      
      if (userData.status === 'inactive') {
        showAlert('danger', 'Your account has been deactivated. Please contact support.');
        return;
      }

      // Show email verification alert only on login if not verified
      if (!result.user.emailVerified) {
        showAlert('warning', 'Please verify your email address to continue. Check your inbox for a verification link.');
        setShowResendVerification(true);
        return;
      }

      showAlert('success', 'Successfully signed in!');
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        showAlert('danger', 'Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        showAlert('danger', 'Too many failed attempts. Please try again later.');
      } else {
        showAlert('danger', error.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
    setLoading(true);
    try {
      // Check if email already exists
      const emailCheck = await checkEmailExists(data.email);
      
      if (emailCheck.exists) {
        if (emailCheck.hasPassword) {
          showAlert('danger', 'An account with this email already exists. Please sign in instead.');
          setActiveTab('login');
          loginForm.setValue('email', data.email);
          return;
        } else if (emailCheck.hasGoogle) {
          showAlert('danger', 'An account with this email exists via Google. Please sign in with Google instead.');
          return;
        }
      }

      // Create Firebase user first
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Update Firebase profile
      await updateProfile(result.user, {
        displayName: `${data.firstName} ${data.lastName}`,
      });

      // Send email verification via SendGrid (with Firebase fallback)
      try {
        const sendGridResponse = await fetch('/api/send-verification-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: result.user.email,
            userName: `${data.firstName} ${data.lastName}`,
            actionCode: btoa(`${result.user.uid}_${Date.now()}_verify`),
            baseUrl: window.location.origin
          })
        });

        if (sendGridResponse.ok) {
          console.log('Verification email sent via SendGrid');
        } else {
          // Fallback to Firebase if SendGrid fails
          await sendEmailVerification(result.user);
          console.log('Verification email sent via Firebase (SendGrid unavailable)');
        }
      } catch (error) {
        // Fallback to Firebase email verification
        await sendEmailVerification(result.user);
        console.log('Verification email sent via Firebase (fallback)');
      }

      // Create user record in Firestore with selected role
      await setDoc(doc(db, 'users', result.user.uid), {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`,
        role: data.role,
        status: 'pending', // All new users are pending approval
        emailVerified: false,
        isDefaultAdmin: false,
        permissions: data.role === 'instructor' 
          ? ['manage_students', 'manage_assignments', 'view_class_data']
          : ['view_courses', 'submit_assignments', 'view_grades'],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      showAlert('success', 'Account created successfully! Check your email to verify your account. Your account will be activated after admin approval.');
      setActiveTab('login');
      // Pre-fill login form
      loginForm.setValue('email', data.email);
      registerForm.reset();
    } catch (error: any) {
      console.error('Registration error:', error);
      showAlert('danger', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showAlert('success', 'Successfully signed in with Google!');
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle account linking scenarios
      if (error.code === 'auth/account-exists-with-different-credential') {
        showAlert('danger', 'An account with this email already exists. Please sign in with your password first, then link your Google account from your profile.');
      } else {
        showAlert('danger', error.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (data: any) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      showAlert('success', 'Password reset email sent! Check your inbox.');
      setShowResetModal(false);
      forgotPasswordForm.reset();
    } catch (error: any) {
      console.error('Password reset error:', error);
      showAlert('danger', error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = loginForm.getValues('email');
    if (!email) {
      showAlert('danger', 'Please enter your email address first');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        // Try SendGrid first, fallback to Firebase
        try {
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
            showAlert('success', 'Verification email sent via professional email service! Check your inbox.');
          } else {
            // Fallback to Firebase
            await sendEmailVerification(user);
            showAlert('success', 'Verification email sent! Check your inbox.');
          }
        } catch (error) {
          // Fallback to Firebase
          await sendEmailVerification(user);
          showAlert('success', 'Verification email sent! Check your inbox.');
        }
      } else {
        showAlert('success', 'If this email exists in our system and is unverified, a verification email will be sent.');
      }
      setShowResendVerification(false);
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      showAlert('danger', error.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4" style={{ fontSize: '14px' }}>
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h4 className="mb-0">{activeTab === 'login' ? 'Welcome Back' : 'Create Account'}</h4>
              <p className="mb-0 opacity-75 small">
                {activeTab === 'login' ? 'Sign in to your account' : 'Join us today'}
              </p>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Show alerts at the top */}
              {alert && (
                <Alert variant={alert.type} className="mb-4" dismissible onClose={() => setAlert(null)}>
                  {alert.message}
                  {showResendVerification && activeTab === 'login' && (
                    <div className="mt-2">
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={handleResendVerification}
                        disabled={loading}
                      >
                        {loading ? <Spinner size="sm" /> : 'Resend Verification Email'}
                      </Button>
                    </div>
                  )}
                </Alert>
              )}
              
              {/* Show email verification alert at top when needed */}
              {user && showResendVerification && !emailVerified && (
                <Alert variant="warning" className="mb-4">
                  <div className="d-flex align-items-start">
                    <FaEnvelope className="me-2 mt-1" />
                    <div className="flex-grow-1">
                      <Alert.Heading className="h6 mb-2">Email Verification Required</Alert.Heading>
                      <p className="mb-2">
                        Please verify your email address to continue. Check your inbox for a verification link.
                      </p>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={handleResendVerification}
                        disabled={loading}
                      >
                        {loading ? <Spinner size="sm" /> : 'Resend Verification Email'}
                      </Button>
                    </div>
                  </div>
                </Alert>
              )}

              {activeTab === 'login' ? (
                <div>
                  {/* Login Form */}
                  <Form onSubmit={loginForm.handleSubmit(handleLogin)} className="mt-2">
                    <Form.Group className="mb-3">
                      <Form.Label className="small">
                        <FaEnvelope className="me-2" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        {...loginForm.register('email')}
                        isInvalid={!!loginForm.formState.errors.email}
                        style={{ height: '38px', fontSize: '14px' }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {loginForm.formState.errors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small">
                        <FaLock className="me-2" />
                        Password
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          {...loginForm.register('password')}
                          isInvalid={!!loginForm.formState.errors.password}
                          style={{ height: '38px', fontSize: '14px' }}
                        />
                        <Button
                          variant="link"
                          className="position-absolute top-50 end-0 translate-middle-y text-muted border-0 p-2"
                          style={{ zIndex: 5 }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {loginForm.formState.errors.password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Remember me"
                        className="small"
                        {...loginForm.register('rememberMe')}
                      />
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none small"
                        onClick={() => setShowResetModal(true)}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 mb-3"
                      style={{ height: '38px', fontSize: '14px' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>

                    <hr className="my-3" />

                    <Button
                      variant="outline-secondary"
                      className="w-100 mb-3"
                      style={{ height: '38px', fontSize: '14px' }}
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <FaGoogle className="me-2" />
                      Continue with Google
                    </Button>



                    <div className="text-center">
                      <span className="text-muted small">Don't have an account? </span>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none fw-bold small"
                        onClick={() => setActiveTab('register')}
                      >
                        Create an account
                      </Button>
                    </div>
                    <hr />
                    <div className="text-center">
                      <small>
                        System Administrator? <Link href="/admin" className="text-danger fw-bold">
                          Admin Login
                        </Link>
                      </small>
                    </div>
                  </Form>
                </div>
              ) : (
                <div>
                  {/* Register Form */}
                  <Form onSubmit={registerForm.handleSubmit(handleRegister)} className="mt-2">
                    <Row>
                      <Col xs={12} sm={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="small">
                            <FaUser className="me-2" />
                            First Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="First name"
                            {...registerForm.register('firstName')}
                            isInvalid={!!registerForm.formState.errors.firstName}
                            style={{ height: '38px', fontSize: '14px' }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {registerForm.formState.errors.firstName?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="small">Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Last name"
                            {...registerForm.register('lastName')}
                            isInvalid={!!registerForm.formState.errors.lastName}
                            style={{ height: '38px', fontSize: '14px' }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {registerForm.formState.errors.lastName?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label className="small">
                        <FaEnvelope className="me-2" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        {...registerForm.register('email')}
                        isInvalid={!!registerForm.formState.errors.email}
                        style={{ height: '38px', fontSize: '14px' }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {registerForm.formState.errors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small">
                        <FaUser className="me-2" />
                        Select Your Role
                      </Form.Label>
                      <Form.Select
                        {...registerForm.register('role')}
                        isInvalid={!!registerForm.formState.errors.role}
                        style={{ height: '38px', fontSize: '14px' }}
                      >
                        <option value="student">Student - Access courses and submit assignments</option>
                        <option value="instructor">Instructor - Manage classes and students</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {registerForm.formState.errors.role?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small">
                        <FaLock className="me-2" />
                        Password
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          {...registerForm.register('password')}
                          isInvalid={!!registerForm.formState.errors.password}
                          style={{ height: '38px', fontSize: '14px' }}
                        />
                        <Button
                          variant="link"
                          className="position-absolute top-50 end-0 translate-middle-y text-muted border-0 p-2"
                          style={{ zIndex: 5 }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {registerForm.formState.errors.password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small">Confirm Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          {...registerForm.register('confirmPassword')}
                          isInvalid={!!registerForm.formState.errors.confirmPassword}
                          style={{ height: '38px', fontSize: '14px' }}
                        />
                        <Button
                          variant="link"
                          className="position-absolute top-50 end-0 translate-middle-y text-muted border-0 p-2"
                          style={{ zIndex: 5 }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {registerForm.formState.errors.confirmPassword?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="I accept the Terms of Service and Privacy Policy"
                        className="small"
                        {...registerForm.register('acceptTerms')}
                        isInvalid={!!registerForm.formState.errors.acceptTerms}
                      />
                      <Form.Control.Feedback type="invalid">
                        {registerForm.formState.errors.acceptTerms?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 mb-3"
                      style={{ height: '38px', fontSize: '14px' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>

                    <hr className="my-3" />

                    <Button
                      variant="outline-secondary"
                      className="w-100 mb-3"
                      style={{ height: '38px', fontSize: '14px' }}
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <FaGoogle className="me-2" />
                      Continue with Google
                    </Button>

                    <div className="text-center">
                      <span className="text-muted small">Already have an account? </span>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none fw-bold small"
                        onClick={() => setActiveTab('login')}
                      >
                        Sign in
                      </Button>
                    </div>
                  </Form>
                </div>
              )}

              {/* Show pending approval message only for non-verification issues */}
              {user && showResendVerification && emailVerified && (
                <PendingApprovalMessage user={user} emailVerified={emailVerified} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Password Reset Modal - Using new component */}
      <PasswordResetModal
        show={showResetModal}
        onHide={() => setShowResetModal(false)}
        user={user}
        mode="reset"
      />
    </Container>
  );
};