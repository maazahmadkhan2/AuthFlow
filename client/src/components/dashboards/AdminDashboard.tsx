import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaCog, FaShieldAlt, FaChartBar, FaUserEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { getAllUsers, updateUserRole, toggleUserStatus } from '../../lib/firebase';
import { UserRole, userRoles } from '../../../../shared/firebase-schema';

interface AdminDashboardProps {
  userData: any;
  user: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userData, user }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      showAlert('danger', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    try {
      await updateUserRole(selectedUser.id, newRole, user.uid);
      showAlert('success', `Role updated successfully for ${selectedUser.displayName}`);
      setShowRoleModal(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      showAlert('danger', 'Failed to update user role');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, !currentStatus, user.uid);
      showAlert('success', `User status updated successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      showAlert('danger', 'Failed to update user status');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, string> = {
      admin: 'danger',
      manager: 'warning',
      coordinator: 'info',
      instructor: 'primary',
      student: 'secondary'
    };
    return variants[role] || 'secondary';
  };

  const openRoleModal = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  return (
    <Container fluid data-testid="admin-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 data-testid="text-welcome">Welcome, {userData?.displayName || 'Admin'}</h2>
          <p className="text-muted">System Administration Dashboard</p>
        </Col>
      </Row>

      {alert && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert(null)} data-testid={`alert-${alert.type}`}>
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaUsers className="mb-2" size={40} color="#007bff" />
              <Card.Title data-testid="text-total-users">{users.length}</Card.Title>
              <Card.Text>Total Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaShieldAlt className="mb-2" size={40} color="#28a745" />
              <Card.Title data-testid="text-active-users">{users.filter(u => u.isActive !== false).length}</Card.Title>
              <Card.Text>Active Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaChartBar className="mb-2" size={40} color="#ffc107" />
              <Card.Title data-testid="text-admin-count">{users.filter(u => u.role === 'admin').length}</Card.Title>
              <Card.Text>Administrators</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaCog className="mb-2" size={40} color="#6c757d" />
              <Card.Title>System</Card.Title>
              <Card.Text>Management</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>User Management</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
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
                    {users.map((u) => (
                      <tr key={u.id} data-testid={`user-row-${u.id}`}>
                        <td>{u.displayName || `${u.firstName} ${u.lastName}`}</td>
                        <td>{u.email}</td>
                        <td>
                          <Badge bg={getRoleBadgeVariant(u.role)} data-testid={`badge-role-${u.id}`}>
                            {u.role}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={u.isActive !== false ? 'success' : 'danger'} data-testid={`badge-status-${u.id}`}>
                            {u.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          {u.createdAt ? new Date(u.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => openRoleModal(u)}
                            data-testid={`button-edit-role-${u.id}`}
                          >
                            <FaUserEdit /> Role
                          </Button>
                          <Button
                            variant={u.isActive !== false ? 'outline-danger' : 'outline-success'}
                            size="sm"
                            onClick={() => handleToggleStatus(u.id, u.isActive !== false)}
                            data-testid={`button-toggle-status-${u.id}`}
                          >
                            {u.isActive !== false ? <FaToggleOff /> : <FaToggleOn />}
                            {u.isActive !== false ? ' Deactivate' : ' Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role Change Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} data-testid="modal-change-role">
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>Change role for <strong>{selectedUser.displayName}</strong>?</p>
              <Form>
                <Form.Group>
                  <Form.Label>New Role</Form.Label>
                  <Form.Select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    data-testid="select-new-role"
                  >
                    {userRoles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)} data-testid="button-cancel-role-change">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRoleChange} data-testid="button-confirm-role-change">
            Update Role
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};