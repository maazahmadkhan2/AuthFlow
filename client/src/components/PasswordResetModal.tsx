import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface PasswordResetModalProps {
  show: boolean;
  onHide: () => void;
  user: any;
  mode: 'reset' | 'change';
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ 
  show, 
  onHide, 
  user, 
  mode 
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordReset = async () => {
    if (mode === 'reset') {
      // Send password reset email (this will use Firebase's built-in flow)
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, formData.email);
        showAlert('success', 'Password reset email sent! Check your inbox and follow the instructions.');
        // Clear form and close modal after 3 seconds
        setTimeout(() => {
          onHide();
          setFormData({ currentPassword: '', newPassword: '', confirmPassword: '', email: '' });
        }, 3000);
      } catch (error: any) {
        showAlert('danger', error.message || 'Failed to send password reset email');
      } finally {
        setLoading(false);
      }
    } else {
      // Change password with re-authentication
      if (formData.newPassword !== formData.confirmPassword) {
        showAlert('danger', 'New passwords do not match');
        return;
      }

      if (formData.newPassword.length < 6) {
        showAlert('danger', 'Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      try {
        // Re-authenticate user with current password
        const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, formData.newPassword);
        
        showAlert('success', 'Password updated successfully!');
        
        // Clear form and close modal after 2 seconds
        setTimeout(() => {
          onHide();
          setFormData({ currentPassword: '', newPassword: '', confirmPassword: '', email: '' });
        }, 2000);
      } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
          showAlert('danger', 'Current password is incorrect');
        } else if (error.code === 'auth/weak-password') {
          showAlert('danger', 'New password is too weak');
        } else {
          showAlert('danger', error.message || 'Failed to update password');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePasswordReset();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaLock className="me-2" />
          {mode === 'reset' ? 'Reset Password' : 'Change Password'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alert && (
          <Alert variant={alert.type} className="mb-3">
            {alert.message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {mode === 'reset' ? (
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                data-testid="input-reset-email"
              />
              <Form.Text className="text-muted">
                We'll send you an email with instructions to reset your password.
              </Form.Text>
            </Form.Group>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                    data-testid="input-current-password"
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="position-absolute end-0 top-0 border-0"
                    style={{ zIndex: 10 }}
                    onClick={() => togglePasswordVisibility('current')}
                    type="button"
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    data-testid="input-new-password"
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="position-absolute end-0 top-0 border-0"
                    style={{ zIndex: 10 }}
                    onClick={() => togglePasswordVisibility('new')}
                    type="button"
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    data-testid="input-confirm-password"
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="position-absolute end-0 top-0 border-0"
                    style={{ zIndex: 10 }}
                    onClick={() => togglePasswordVisibility('confirm')}
                    type="button"
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handlePasswordReset}
          disabled={loading}
          data-testid="button-submit-password"
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {mode === 'reset' ? 'Sending...' : 'Updating...'}
            </>
          ) : (
            mode === 'reset' ? 'Send Reset Email' : 'Update Password'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};