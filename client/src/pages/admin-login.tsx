import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaLock, FaShieldAlt, FaCog } from 'react-icons/fa';
import { useLocation } from 'wouter';
import { DatabaseAdminDashboard } from '../components/DatabaseAdminDashboard';
import { signInAsFirebaseAdmin, createFirebaseAdmin } from '../lib/firebase-admin-setup';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { signOutUser } from '../lib/firebase';

export const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState({
    email: 'admin@system.local',
    password: 'AdminPass123!',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);
  const { user, userData } = useFirebaseAuth();

  const showAlert = (type: 'success' | 'danger' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 8000);
  };

  // Check if user is already signed in as admin
  useEffect(() => {
    if (user && userData && userData.role === 'admin') {
      setIsLoggedIn(true);
    }
  }, [user, userData]);

  const handleInputChange = (e: any) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First try to create admin if it doesn't exist, then sign in
      await createFirebaseAdmin();
      const result = await signInAsFirebaseAdmin(credentials.email, credentials.password);
      
      if (result.success) {
        setIsLoggedIn(true);
        showAlert('success', 'Welcome, Administrator!');
      } else {
        showAlert('danger', result.error || 'Failed to sign in as admin');
      }
    } catch (error) {
      showAlert('danger', 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };



  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsLoggedIn(false);
      showAlert('info', 'Signed out successfully.');
    } catch (error) {
      showAlert('danger', 'Error signing out.');
    }
  };

  // If logged in, show admin dashboard
  if (isLoggedIn && user && userData && userData.role === 'admin') {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
          <h5 className="mb-0">Admin Dashboard - Signed in as: {userData.displayName}</h5>
          <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
        <DatabaseAdminDashboard />
      </div>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-lg">
            <Card.Header className="bg-danger text-white text-center">
              <FaShieldAlt className="mb-2" size={40} />
              <h4 className="mb-0">System Administrator</h4>
              <small>Secure Access Portal</small>
            </Card.Header>
            <Card.Body className="p-4">
              {alert && (
                <Alert variant={alert.type} className="mb-4" data-testid={`alert-${alert.type}`}>
                  {alert.message}
                </Alert>
              )}

              <div className="mb-4 text-center">
                <h6 className="text-muted">Default Admin Credentials</h6>
                <div className="bg-light p-3 rounded">
                  <strong>Email:</strong> admin@system.local<br />
                  <strong>Password:</strong> AdminPass123!
                </div>
              </div>

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-2" />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    required
                    data-testid="input-email"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <FaLock className="me-2" />
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    required
                    data-testid="input-password"
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    type="submit"
                    variant="danger"
                    disabled={loading}
                    data-testid="button-login"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <FaShieldAlt className="me-2" />
                        Access Admin Panel
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <small className="text-muted">
                Authorized personnel only. All access is logged and monitored.
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};