import React from 'react';
import { UserRole } from '../../../shared/firebase-schema';
import { AdminDashboard, ManagerDashboard, CoordinatorDashboard, InstructorDashboard, StudentDashboard } from './dashboards';
import { Alert } from 'react-bootstrap';

interface RoleBasedDashboardProps {
  role: UserRole;
  userData: any;
  user: any;
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ role, userData, user }) => {
  // Check if user is active
  if (userData?.isActive === false) {
    return (
      <Alert variant="warning" data-testid="alert-account-inactive">
        <Alert.Heading>Account Inactive</Alert.Heading>
        <p>Your account has been deactivated. Please contact your administrator for assistance.</p>
      </Alert>
    );
  }

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard userData={userData} user={user} />;
      case 'manager':
        return <ManagerDashboard userData={userData} user={user} />;
      case 'coordinator':
        return <CoordinatorDashboard userData={userData} user={user} />;
      case 'instructor':
        return <InstructorDashboard userData={userData} user={user} />;
      case 'student':
        return <StudentDashboard userData={userData} user={user} />;
      default:
        return (
          <Alert variant="danger" data-testid="alert-unknown-role">
            <Alert.Heading>Unknown Role</Alert.Heading>
            <p>Your account role is not recognized. Please contact your administrator.</p>
          </Alert>
        );
    }
  };

  return (
    <div data-testid={`dashboard-${role}`}>
      {renderDashboard()}
    </div>
  );
};