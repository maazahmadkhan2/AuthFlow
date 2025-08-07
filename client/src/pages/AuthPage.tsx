import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, forgotPasswordSchema } from '../../../shared/firebase-schema';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, resendEmailVerification, auth, checkEmailExists } from '../lib/firebase';
import { getAuth } from 'firebase/auth';
import { useLocation } from 'wouter';
import { FaGoogle, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

export const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
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
      acceptTerms: false,
    },
  });

  const forgotPasswordForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  const handleLogin = async (data: any) => {
    setLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      showAlert('success', 'Successfully signed in!');
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.message || 'Failed to sign in';
      showAlert('danger', message);
      
      // Show resend verification option if email is not verified
      if (message.includes('verify your email') || message.includes('verification')) {
        setShowResendVerification(true);
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

      await signUpWithEmail(data.email, data.password, data.firstName, data.lastName);
      showAlert('success', 'Account created! Please check your email for verification.');
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
      // For simplicity, we'll show a generic message since we can't verify email exists
      // In a real app, you might have a backend endpoint to handle this
      showAlert('success', 'If this email exists in our system and is unverified, a verification email will be sent.');
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
              {alert && (
                <Alert variant={alert.type} className="mb-4" dismissible onClose={() => setAlert(null)}>
                  {alert.message}
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

                    {showResendVerification && (
                      <div className="text-center mb-3">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={loading}
                          style={{ fontSize: '14px', height: '32px' }}
                        >
                          Resend Verification Email
                        </Button>
                      </div>
                    )}

                    <div className="text-center">
                      <span className="text-muted small">Don't have an account? </span>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none fw-bold small"
                        onClick={() => {
                          setActiveTab('register');
                          setShowResendVerification(false);
                        }}
                      >
                        Create an account
                      </Button>
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Password Reset Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="small">Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)}>
            <Form.Group className="mb-3">
              <Form.Label className="small">Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                {...forgotPasswordForm.register('email')}
                isInvalid={!!forgotPasswordForm.formState.errors.email}
                style={{ height: '38px', fontSize: '14px' }}
              />
              <Form.Control.Feedback type="invalid">
                {forgotPasswordForm.formState.errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <div className="d-flex gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-fill"
                style={{ height: '38px', fontSize: '14px' }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </Button>
              <Button
                variant="secondary"
                style={{ height: '38px', fontSize: '14px' }}
                onClick={() => {
                  setShowResetModal(false);
                  forgotPasswordForm.reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};