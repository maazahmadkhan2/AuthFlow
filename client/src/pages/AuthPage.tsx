import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, forgotPasswordSchema } from '../../../shared/firebase-schema';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } from '../lib/firebase';
import { useLocation } from 'wouter';
import { FaGoogle, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

export const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
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
    setTimeout(() => setAlert(null), 5000);
  };

  const handleLogin = async (data: any) => {
    setLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      showAlert('success', 'Successfully signed in!');
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      showAlert('danger', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
    setLoading(true);
    try {
      await signUpWithEmail(data.email, data.password, data.firstName, data.lastName);
      showAlert('success', 'Account created! Please check your email for verification.');
      setActiveTab('login');
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
      showAlert('danger', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (data: any) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      showAlert('success', 'Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      showAlert('danger', error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h2 className="mb-0">Welcome</h2>
              <p className="mb-0 opacity-75">Sign in to your account or create a new one</p>
            </Card.Header>
            <Card.Body className="p-4">
              {alert && (
                <Alert variant={alert.type} className="mb-4" dismissible onClose={() => setAlert(null)}>
                  {alert.message}
                </Alert>
              )}

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => k && setActiveTab(k)}
                className="mb-4"
                justify
              >
                {/* Login Tab */}
                <Tab eventKey="login" title="Sign In">
                  <Form onSubmit={loginForm.handleSubmit(handleLogin)} className="mt-3">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaEnvelope className="me-2" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        {...loginForm.register('email')}
                        isInvalid={!!loginForm.formState.errors.email}
                        size="lg"
                      />
                      <Form.Control.Feedback type="invalid">
                        {loginForm.formState.errors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaLock className="me-2" />
                        Password
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          {...loginForm.register('password')}
                          isInvalid={!!loginForm.formState.errors.password}
                          size="lg"
                        />
                        <Button
                          variant="link"
                          className="position-absolute top-50 end-0 translate-middle-y text-muted border-0"
                          style={{ zIndex: 5 }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {loginForm.formState.errors.password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check
                        type="checkbox"
                        label="Remember me"
                        {...loginForm.register('rememberMe')}
                      />
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none"
                        onClick={() => setActiveTab('forgot')}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 mb-3"
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
                  </Form>
                </Tab>

                {/* Register Tab */}
                <Tab eventKey="register" title="Sign Up">
                  <Form onSubmit={registerForm.handleSubmit(handleRegister)} className="mt-3">
                    <Row>
                      <Col xs={12} sm={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <FaUser className="me-2" />
                            First Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="First name"
                            {...registerForm.register('firstName')}
                            isInvalid={!!registerForm.formState.errors.firstName}
                            size="lg"
                          />
                          <Form.Control.Feedback type="invalid">
                            {registerForm.formState.errors.firstName?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Last name"
                            {...registerForm.register('lastName')}
                            isInvalid={!!registerForm.formState.errors.lastName}
                            size="lg"
                          />
                          <Form.Control.Feedback type="invalid">
                            {registerForm.formState.errors.lastName?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaEnvelope className="me-2" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        {...registerForm.register('email')}
                        isInvalid={!!registerForm.formState.errors.email}
                        size="lg"
                      />
                      <Form.Control.Feedback type="invalid">
                        {registerForm.formState.errors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaLock className="me-2" />
                        Password
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          {...registerForm.register('password')}
                          isInvalid={!!registerForm.formState.errors.password}
                          size="lg"
                        />
                        <Button
                          variant="link"
                          className="position-absolute top-50 end-0 translate-middle-y text-muted border-0"
                          style={{ zIndex: 5 }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {registerForm.formState.errors.password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          {...registerForm.register('confirmPassword')}
                          isInvalid={!!registerForm.formState.errors.confirmPassword}
                          size="lg"
                        />
                        <Button
                          variant="link"
                          className="position-absolute top-50 end-0 translate-middle-y text-muted border-0"
                          style={{ zIndex: 5 }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {registerForm.formState.errors.confirmPassword?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        label="I accept the Terms of Service and Privacy Policy"
                        {...registerForm.register('acceptTerms')}
                        isInvalid={!!registerForm.formState.errors.acceptTerms}
                      />
                      <Form.Control.Feedback type="invalid">
                        {registerForm.formState.errors.acceptTerms?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="success"
                      size="lg"
                      className="w-100 mb-3"
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
                  </Form>
                </Tab>

                {/* Forgot Password Tab */}
                <Tab eventKey="forgot" title="Reset Password">
                  <Form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="mt-3">
                    <div className="text-center mb-4">
                      <h5>Reset Your Password</h5>
                      <p className="text-muted">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>

                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FaEnvelope className="me-2" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        {...forgotPasswordForm.register('email')}
                        isInvalid={!!forgotPasswordForm.formState.errors.email}
                        size="lg"
                      />
                      <Form.Control.Feedback type="invalid">
                        {forgotPasswordForm.formState.errors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="warning"
                      size="lg"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="link"
                        className="text-decoration-none"
                        onClick={() => setActiveTab('login')}
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </Form>
                </Tab>
              </Tabs>

              <div className="text-center">
                <div className="my-4">
                  <div className="position-relative">
                    <hr />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                      OR
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline-danger"
                  size="lg"
                  className="w-100"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <FaGoogle className="me-2" />
                  Continue with Google
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};