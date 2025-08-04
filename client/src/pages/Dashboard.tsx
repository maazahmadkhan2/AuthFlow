import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../hooks/useFirebaseAuth';
import { getUserData, resendEmailVerification } from '../lib/firebase';
import { FaUser, FaEnvelope, FaCalendar, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useLocation } from 'wouter';

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
      return;
    }

    if (user) {
      // Check if email is verified
      if (!user.emailVerified) {
        setLocation('/auth');
        return;
      }
      loadUserData();
    }
  }, [user, authLoading, setLocation]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getUserData(user.uid);
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
      showAlert('danger', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  const handleResendVerification = async () => {
    if (!user) return;
    
    try {
      await resendEmailVerification(user);
      showAlert('success', 'Verification email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      showAlert('danger', error.message || 'Failed to send verification email');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <Container className="py-4" style={{ fontSize: '14px' }}>
      {alert && (
        <Alert variant={alert.type} className="mb-4" dismissible onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
            <div>
              <h1 className="mb-2">Dashboard</h1>
              <p className="text-muted mb-0">Welcome back, {user.displayName || userData?.firstName || 'User'}!</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* User Information Section */}
      <Row>
        <Col xs={12} lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaUser className="me-2" />
                User Information
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col xs={12} md={6}>
                  <div className="mb-3">
                    <label className="fw-bold text-muted small">Full Name</label>
                    <div className="d-flex align-items-center mt-1">
                      <FaUser className="text-muted me-2" size={14} />
                      <span>{user.displayName || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Not provided'}</span>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="mb-3">
                    <label className="fw-bold text-muted small">Email Address</label>
                    <div className="d-flex align-items-center mt-1">
                      <FaEnvelope className="text-muted me-2" size={14} />
                      <span className="me-2">{user.email}</span>
                      {user.emailVerified ? (
                        <Badge bg="success" className="d-flex align-items-center">
                          <FaCheckCircle className="me-1" size={12} />
                          Verified
                        </Badge>
                      ) : (
                        <div className="d-flex align-items-center">
                          <Badge bg="warning" className="d-flex align-items-center me-2">
                            <FaExclamationTriangle className="me-1" size={12} />
                            Unverified
                          </Badge>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={handleResendVerification}
                            style={{ fontSize: '12px', padding: '2px 8px' }}
                          >
                            Resend Verification
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row>
                <Col xs={12} md={6}>
                  <div className="mb-3">
                    <label className="fw-bold text-muted small">Account Created</label>
                    <div className="d-flex align-items-center mt-1">
                      <FaCalendar className="text-muted me-2" size={14} />
                      <span>{formatDate(userData?.createdAt || user.metadata?.creationTime)}</span>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="mb-3">
                    <label className="fw-bold text-muted small">Last Updated</label>
                    <div className="d-flex align-items-center mt-1">
                      <FaCalendar className="text-muted me-2" size={14} />
                      <span>{formatDate(userData?.updatedAt || userData?.createdAt)}</span>
                    </div>
                  </div>
                </Col>
              </Row>

              {userData?.profileImageUrl && (
                <Row>
                  <Col xs={12}>
                    <div className="mb-3">
                      <label className="fw-bold text-muted small">Profile Image</label>
                      <div className="mt-2">
                        <img
                          src={userData.profileImageUrl}
                          alt="Profile"
                          className="rounded-circle"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Account Status Section */}
        <Col xs={12} lg={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-info text-white">
              <h6 className="mb-0">Account Status</h6>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Email Verification</span>
                  {user.emailVerified ? (
                    <Badge bg="success" className="d-flex align-items-center">
                      <FaCheckCircle className="me-1" size={12} />
                      Verified
                    </Badge>
                  ) : (
                    <Badge bg="warning" className="d-flex align-items-center">
                      <FaExclamationTriangle className="me-1" size={12} />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Authentication Method</span>
                  <Badge bg="primary">
                    {user.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email'}
                  </Badge>
                </div>
              </div>

              <div className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Account Status</span>
                  <Badge bg="success" className="d-flex align-items-center">
                    <FaCheckCircle className="me-1" size={12} />
                    Active
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};