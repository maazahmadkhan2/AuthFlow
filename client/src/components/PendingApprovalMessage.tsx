import React from 'react';
import { Alert, Container } from 'react-bootstrap';
import { FaHourglassHalf } from 'react-icons/fa';

export const PendingApprovalMessage: React.FC = () => {
  return (
    <Container className="py-4">
      <Alert variant="warning" className="text-center" data-testid="alert-pending-approval">
        <FaHourglassHalf className="mb-3" size={48} />
        <Alert.Heading>Account Pending Approval</Alert.Heading>
        <p className="mb-3">
          Thank you for registering! Your account has been created successfully, but it needs to be approved by an administrator before you can access the system.
        </p>
        <hr />
        <p className="mb-0">
          You will receive an email notification once your account is approved. If you have any questions, please contact your system administrator.
        </p>
      </Alert>
    </Container>
  );
};