import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useFirebaseAuth';
import { useUserRole } from '../hooks/useRoles';
import { RoleBasedDashboard } from '../components/RoleBasedDashboard';
import { useLocation } from 'wouter';

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: roleLoading } = useUserRole(user);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
      return;
    }

    if (user && !user.emailVerified) {
      setLocation('/auth');
      return;
    }
  }, [user, authLoading, setLocation]);

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  if (authLoading || roleLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" data-testid="loading-dashboard" />
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (!userData) {
    return (
      <Container className="py-4">
        <Alert variant="danger" data-testid="alert-no-user-data">
          <Alert.Heading>Error Loading User Data</Alert.Heading>
          <p>Unable to load your user information. Please try refreshing the page or contact support if the problem persists.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ fontSize: '14px' }}>
      {alert && (
        <Alert variant={alert.type} className="mb-4" dismissible onClose={() => setAlert(null)} data-testid={`alert-${alert.type}`}>
          {alert.message}
        </Alert>
      )}

      <RoleBasedDashboard 
        role={userData.role} 
        userData={userData} 
        user={user} 
      />
    </Container>
  );
};