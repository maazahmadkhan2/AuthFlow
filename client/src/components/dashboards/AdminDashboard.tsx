import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaCog, FaShieldAlt, FaChartBar, FaUserEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { getAllUsers, updateUserRole, toggleUserStatus, getPendingUsers, approveUser, rejectUser, createDefaultAdmin } from '../../lib/firebase';
import { UserRole, userRoles } from '../../../../shared/firebase-schema';

interface AdminDashboardProps {
  userData: any;
  user: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userData, user }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState('users');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  useEffect(() => {
    initializeAdmin();
    loadUsers();
    loadPendingUsers();
  }, []);

  const initializeAdmin = async () => {
    try {
      await createDefaultAdmin();
    } catch (error) {
      console.error('Error initializing admin:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      // Filter out pending users to show only approved/active users
      setUsers(allUsers.filter(u => u.isApproved === true || u.isApproved === undefined));
    } catch (error) {
      console.error('Error loading users:', error);
      showAlert('danger', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingUsers = async () => {
    try {
      const pending = await getPendingUsers();
      setPendingUsers(pending);
    } catch (error) {
      console.error('Error loading pending users:', error);
      showAlert('danger', 'Failed to load pending users');
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

  const handleApproveUser = async (userId: string, userName: string) => {
    try {
      await approveUser(userId, user.uid);
      showAlert('success', `User ${userName} approved successfully`);
      loadPendingUsers();
      loadUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      showAlert('danger', 'Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: string, userName: string) => {
    try {
      await rejectUser(userId, user.uid, 'Account rejected by administrator');
      showAlert('success', `User ${userName} rejected`);
      loadPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      showAlert('danger', 'Failed to reject user');
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
                Users ({users.length})
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
                      {users.length === 0 && (
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
                {loading ? (
                  <div className="text-center" data-testid="loading-pending">
                    <Spinner animation="border" />
                    <p>Loading pending users...</p>
                  </div>
                ) : (
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
                      {pendingUsers.map((u) => (
                        <tr key={u.id} data-testid={`pending-user-row-${u.id}`}>
                          <td>{u.displayName || `${u.firstName} ${u.lastName}`}</td>
                          <td>{u.email}</td>
                          <td>
                            <Badge bg="secondary" data-testid={`badge-requested-role-${u.id}`}>
                              {u.role}
                            </Badge>
                          </td>
                          <td>
                            {u.createdAt ? new Date(u.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                          </td>
                          <td>
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
                              onClick={() => handleApproveUser(u.id, u.displayName)}
                              data-testid={`button-approve-${u.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectUser(u.id, u.displayName)}
                              data-testid={`button-reject-${u.id}`}
                            >
                              Reject
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
                )}
              </Card.Body>
            </Card>
          )}
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