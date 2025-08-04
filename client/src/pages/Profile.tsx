import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../hooks/useFirebaseAuth';
import { getUserData, updateUserData, updatePassword, resendEmailVerification } from '../lib/firebase';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaUser, FaEnvelope, FaLock, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [, setLocation] = useLocation();

  const profileForm = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
      return;
    }

    if (user) {
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
      
      // Update form with current data
      profileForm.reset({
        firstName: data?.firstName || '',
        lastName: data?.lastName || '',
        email: user.email || '',
      });
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

  const handleProfileUpdate = async (data: any) => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateUserData(user.uid, {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`,
      });
      
      showAlert('success', 'Profile updated successfully!');
      loadUserData(); // Reload data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showAlert('danger', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (data: any) => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updatePassword(user, data.currentPassword, data.newPassword);
      showAlert('success', 'Password changed successfully!');
      setShowPasswordModal(false);
      passwordForm.reset();
    } catch (error: any) {
      console.error('Error changing password:', error);
      showAlert('danger', error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
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
    return null;
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-2">Profile Settings</h1>
              <p className="text-muted mb-0">Manage your account information and security settings</p>
            </div>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => setLocation('/dashboard')}
              style={{ fontSize: '14px', height: '32px' }}
            >
              Back to Dashboard
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Profile Information */}
        <Col xs={12} lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Profile Information
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold text-muted small">
                        <FaUser className="me-2" />
                        First Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your first name"
                        {...profileForm.register('firstName')}
                        isInvalid={!!profileForm.formState.errors.firstName}
                        style={{ height: '38px', fontSize: '14px' }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {profileForm.formState.errors.firstName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold text-muted small">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your last name"
                        {...profileForm.register('lastName')}
                        isInvalid={!!profileForm.formState.errors.lastName}
                        style={{ height: '38px', fontSize: '14px' }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {profileForm.formState.errors.lastName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-muted small">
                    <FaEnvelope className="me-2" />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={user.email || ''}
                    disabled
                    style={{ height: '38px', fontSize: '14px', backgroundColor: '#f8f9fa' }}
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed. Contact support if you need to update your email address.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    style={{ height: '38px', fontSize: '14px' }}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Security Settings */}
        <Col xs={12} lg={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-warning text-dark">
              <h6 className="mb-0">
                <FaLock className="me-2" />
                Security Settings
              </h6>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="mb-3">
                <label className="fw-bold text-muted small">Change Password</label>
                <p className="text-muted mb-2 small">
                  Update your password to keep your account secure.
                </p>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                  className="w-100"
                  style={{ fontSize: '14px', height: '32px' }}
                  disabled={user.providerData?.[0]?.providerId === 'google.com'}
                >
                  <FaLock className="me-2" />
                  Change Password
                </Button>
                {user.providerData?.[0]?.providerId === 'google.com' && (
                  <Form.Text className="text-muted">
                    Password change is not available for Google accounts.
                  </Form.Text>
                )}
              </div>

              {!user.emailVerified && (
                <div className="mb-0">
                  <label className="fw-bold text-muted small">Email Verification</label>
                  <p className="text-muted mb-2 small">
                    Please verify your email address for account security.
                  </p>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleResendVerification}
                    className="w-100"
                    style={{ fontSize: '14px', height: '32px' }}
                  >
                    <FaEnvelope className="me-2" />
                    Resend Verification
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="small">Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
            <Form.Group className="mb-3">
              <Form.Label className="small">Current Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your current password"
                {...passwordForm.register('currentPassword')}
                isInvalid={!!passwordForm.formState.errors.currentPassword}
                style={{ height: '38px', fontSize: '14px' }}
              />
              <Form.Control.Feedback type="invalid">
                {passwordForm.formState.errors.currentPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small">New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your new password"
                {...passwordForm.register('newPassword')}
                isInvalid={!!passwordForm.formState.errors.newPassword}
                style={{ height: '38px', fontSize: '14px' }}
              />
              <Form.Control.Feedback type="invalid">
                {passwordForm.formState.errors.newPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small">Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm your new password"
                {...passwordForm.register('confirmPassword')}
                isInvalid={!!passwordForm.formState.errors.confirmPassword}
                style={{ height: '38px', fontSize: '14px' }}
              />
              <Form.Control.Feedback type="invalid">
                {passwordForm.formState.errors.confirmPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="flex-fill"
                style={{ height: '38px', fontSize: '14px' }}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Changing...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Change Password
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                style={{ height: '38px', fontSize: '14px' }}
                onClick={() => {
                  setShowPasswordModal(false);
                  passwordForm.reset();
                }}
              >
                <FaTimes className="me-2" />
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};