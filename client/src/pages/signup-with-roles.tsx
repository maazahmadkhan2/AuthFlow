import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Link, useLocation } from 'wouter';
import { apiRequest, queryClient } from '../lib/queryClient';
import { UserRole } from '../../../shared/schema';

export const SignupWithRoles: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student' as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [, setLocation] = useLocation();

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showAlert('danger', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      showAlert('danger', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // Create Firebase auth user
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Update Firebase profile
      await updateProfile(result.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      // Send email verification
      await sendEmailVerification(result.user);

      // Create user record in database (pending approval)
      await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          id: result.user.uid,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: `${formData.firstName} ${formData.lastName}`,
          role: formData.role,
          status: 'pending',
          emailVerified: false,
        }),
      });

      showAlert('success', 'Registration successful! Please verify your email and wait for admin approval.');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation('/auth');
      }, 3000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        showAlert('danger', 'An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        showAlert('danger', 'Password is too weak. Please use a stronger password.');
      } else {
        showAlert('danger', error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">Create Account</h4>
              <small>Choose your role and get started</small>
            </Card.Header>
            <Card.Body className="p-4">
              {alert && (
                <Alert variant={alert.type} className="mb-4" data-testid={`alert-${alert.type}`}>
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        data-testid="input-firstName"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        data-testid="input-lastName"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    data-testid="input-email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Select Your Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    data-testid="select-role"
                  >
                    <option value="student">Student - Access courses and submit assignments</option>
                    <option value="instructor">Instructor - Manage classes and students</option>
                    <option value="coordinator">Coordinator - Coordinate activities and schedules</option>
                    <option value="manager">Manager - Manage teams and projects</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Admin roles are assigned by existing administrators only.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    data-testid="input-password"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    data-testid="input-confirmPassword"
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    data-testid="button-register"
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
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <small>
                Already have an account? <Link href="/auth">Sign In</Link>
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};