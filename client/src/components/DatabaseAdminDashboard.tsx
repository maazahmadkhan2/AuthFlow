import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaCog, FaShieldAlt, FaChartBar, FaUserEdit, FaToggleOn, FaToggleOff, FaHistory } from 'react-icons/fa';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import type { User, UserRole, UserStatus } from '../../../shared/schema';

export const DatabaseAdminDashboard: React.FC = () => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState('users');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Fetch all users
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch pending users
  const { data: pendingUsers = [], refetch: refetchPending } = useQuery({
    queryKey: ['/api/users/pending'],
  });

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async ({ userId, approvedBy }: { userId: string; approvedBy: string }) => {
      return apiRequest(`/api/users/${userId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approvedBy }),
      });
    },
    onSuccess: () => {
      showAlert('success', 'User approved successfully');
      refetchUsers();
      refetchPending();
    },
    onError: (error: any) => {
      showAlert('danger', error.message || 'Failed to approve user');
    },
  });

  // Reject user mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ userId, rejectedBy, reason }: { userId: string; rejectedBy: string; reason?: string }) => {
      return apiRequest(`/api/users/${userId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectedBy, reason }),
      });
    },
    onSuccess: () => {
      showAlert('success', 'User rejected');
      refetchPending();
    },
    onError: (error: any) => {
      showAlert('danger', error.message || 'Failed to reject user');
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, changedBy, reason }: { userId: string; role: UserRole; changedBy: string; reason?: string }) => {
      return apiRequest(`/api/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role, changedBy, reason }),
      });
    },
    onSuccess: () => {
      showAlert('success', 'User role updated successfully');
      refetchUsers();
      setShowRoleModal(false);
    },
    onError: (error: any) => {
      showAlert('danger', error.message || 'Failed to update user role');
    },
  });

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  const handleApproveUser = (user: User) => {
    approveMutation.mutate({
      userId: user.id,
      approvedBy: 'default-admin', // Using default admin ID
    });
  };

  const handleRejectUser = (user: User) => {
    rejectMutation.mutate({
      userId: user.id,
      rejectedBy: 'default-admin',
      reason: 'Account rejected by administrator',
    });
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleRoleUpdate = () => {
    if (!selectedUser) return;
    
    updateRoleMutation.mutate({
      userId: selectedUser.id,
      role: newRole,
      changedBy: 'default-admin',
      reason: 'Role updated by administrator',
    });
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    const variants = {
      admin: 'danger',
      manager: 'warning',
      coordinator: 'info',
      instructor: 'primary',
      student: 'secondary',
    };
    return variants[role] || 'secondary';
  };

  const getStatusBadgeVariant = (status: UserStatus) => {
    const variants = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
      inactive: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const approvedUsers = users.filter((u: User) => u.status === 'approved');
  const totalUsers = users.length;
  const activeUsers = approvedUsers.filter((u: User) => u.status === 'approved').length;
  const admins = approvedUsers.filter((u: User) => u.role === 'admin').length;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Manage users, roles, and system access</p>
        </Col>
      </Row>

      {alert && (
        <Alert variant={alert.type} className="mb-4" dismissible onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaUsers className="mb-2" size={40} color="#007bff" />
              <Card.Title data-testid="text-total-users">{totalUsers}</Card.Title>
              <Card.Text>Total Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaShieldAlt className="mb-2" size={40} color="#28a745" />
              <Card.Title data-testid="text-active-users">{activeUsers}</Card.Title>
              <Card.Text>Active Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaChartBar className="mb-2" size={40} color="#ffc107" />
              <Card.Title data-testid="text-admin-count">{admins}</Card.Title>
              <Card.Text>Administrators</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaCog className="mb-2" size={40} color={pendingUsers.length > 0 ? '#dc3545' : '#6c757d'} />
              <Card.Title data-testid="text-pending-users">{pendingUsers.length}</Card.Title>
              <Card.Text>Pending Approval</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
                data-testid="tab-users"
              >
                Users ({approvedUsers.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'pending' ? 'active' : ''} ${pendingUsers.length > 0 ? 'text-danger' : ''}`}
                onClick={() => setActiveTab('pending')}
                data-testid="tab-pending"
              >
                Pending Approval ({pendingUsers.length})
              </button>
            </li>
          </ul>
        </Col>
      </Row>

      <Row>
        <Col>
          {activeTab === 'users' && (
            <Card>
              <Card.Header>
                <h5>Active Users</h5>
              </Card.Header>
              <Card.Body>
                {usersLoading ? (
                  <div className="text-center" data-testid="loading-users">
                    <Spinner animation="border" />
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <Table responsive hover data-testid="table-users">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedUsers.map((user: User) => (
                        <tr key={user.id} data-testid={`user-row-${user.id}`}>
                          <td>{user.displayName}</td>
                          <td>{user.email}</td>
                          <td>
                            <Badge bg={getRoleBadgeVariant(user.role)} data-testid={`badge-role-${user.id}`}>
                              {user.role}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={getStatusBadgeVariant(user.status)} data-testid={`badge-status-${user.id}`}>
                              {user.status}
                            </Badge>
                          </td>
                          <td>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => openRoleModal(user)}
                              data-testid={`button-edit-role-${user.id}`}
                              disabled={user.isDefaultAdmin}
                            >
                              <FaUserEdit /> Role
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {approvedUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted">
                            No active users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          )}

          {activeTab === 'pending' && (
            <Card>
              <Card.Header>
                <h5>Pending User Approvals</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover data-testid="table-pending-users">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Requested Role</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user: User) => (
                      <tr key={user.id} data-testid={`pending-user-row-${user.id}`}>
                        <td>{user.displayName}</td>
                        <td>{user.email}</td>
                        <td>
                          <Badge bg="secondary" data-testid={`badge-requested-role-${user.id}`}>
                            {user.role}
                          </Badge>
                        </td>
                        <td>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleApproveUser(user)}
                            disabled={approveMutation.isPending}
                            data-testid={`button-approve-${user.id}`}
                          >
                            {approveMutation.isPending ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectUser(user)}
                            disabled={rejectMutation.isPending}
                            data-testid={`button-reject-${user.id}`}
                          >
                            {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {pendingUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">
                          No pending approvals
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Role Update Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>User</Form.Label>
                <Form.Control type="text" value={selectedUser.displayName} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Current Role</Form.Label>
                <Form.Control type="text" value={selectedUser.role} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Role</Form.Label>
                <Form.Select value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)}>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRoleUpdate}
            disabled={updateRoleMutation.isPending}
          >
            {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};