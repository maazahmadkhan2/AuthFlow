import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Modal, Alert, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaUsers, FaCog, FaShieldAlt, FaChartBar, FaUserEdit, FaToggleOn, FaToggleOff, FaHistory, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
// All data operations now handled with Firestore directly
import { getAllUsers, updateUserRole, toggleUserStatus, getPendingUsers, getUsersByRole, updateUserData, createAdminUser, deleteFirebaseUser } from '../lib/firebase';
import { Timestamp } from 'firebase/firestore';
// Types for Firestore user data
type UserRole = 'admin' | 'manager' | 'coordinator' | 'instructor' | 'student';
type UserStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  isDefaultAdmin?: boolean;
  permissions: string[];
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export const DatabaseAdminDashboard: React.FC = () => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState('users');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form data for create/edit user
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student' as UserRole
  });

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const allUsers = await getAllUsers() as User[];
      console.log('Fetched users:', allUsers.length, allUsers.map(u => ({ id: u.id, email: u.email, role: u.role, status: u.status, isDefaultAdmin: u.isDefaultAdmin })));
      const pending = allUsers.filter(user => user.status === 'pending');
      setUsers(allUsers);
      setPendingUsers(pending);
    } catch (error) {
      showAlert('danger', 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Approve user function
  const approveUser = async (userId: string) => {
    try {
      // Update user status in Firestore
      await updateUserData(userId, { 
        status: 'approved',
        approvedBy: 'system-admin-001',
        approvedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      showAlert('success', 'User approved successfully');
      fetchUsers();
    } catch (error) {
      showAlert('danger', 'Failed to approve user');
    }
  };

  // Reject user function
  const rejectUser = async (userId: string, reason?: string) => {
    try {
      await updateUserData(userId, { 
        status: 'rejected',
        rejectedBy: 'system-admin-001',
        rejectedAt: Timestamp.now(),
        reason: reason || 'No reason provided',
        updatedAt: Timestamp.now()
      });
      showAlert('success', 'User rejected');
      fetchUsers();
    } catch (error) {
      showAlert('danger', 'Failed to reject user');
    }
  };

  // Update role function
  const updateRole = async (userId: string, role: UserRole) => {
    try {
      await updateUserRole(userId, role, 'system-admin-001');
      showAlert('success', 'User role updated successfully');
      fetchUsers();
      setShowRoleModal(false);
    } catch (error) {
      showAlert('danger', 'Failed to update user role');
    }
  };

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  const handleApproveUser = (user: User) => {
    approveUser(user.id);
  };

  const handleRejectUser = (user: User) => {
    rejectUser(user.id, 'Account rejected by administrator');
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await updateRole(selectedUser.id, newRole);
    } finally {
      setLoading(false);
    }
  };

  // Create user function
  const handleCreateUser = async () => {
    setLoading(true);
    try {
      await createAdminUser(formData);
      showAlert('success', 'User created successfully and automatically approved');
      setShowCreateModal(false);
      setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'student' });
      fetchUsers();
    } catch (error: any) {
      showAlert('danger', error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Edit user function
  const handleEditUser = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await updateUserData(selectedUser.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        role: formData.role,
        updatedAt: Timestamp.now()
      });
      showAlert('success', 'User updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      showAlert('danger', 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Delete user function
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await deleteFirebaseUser(selectedUser.id);
      showAlert('success', 'User deleted successfully');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      showAlert('danger', 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Open modals with user data
  const openCreateModal = () => {
    setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'student' });
    setShowCreateModal(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Format date helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Firestore Timestamp-like object
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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

  // Filter out system admins and duplicates for accurate counts
  const realUsers = users.filter((u: User) => 
    u.email !== 'admin@system.local' && // Exclude all admin@system.local accounts
    !u.isDefaultAdmin // Exclude default admin flag
  );
  const approvedUsers = realUsers.filter((u: User) => u.status === 'approved');
  const totalUsers = realUsers.length;
  const activeUsers = realUsers.filter((u: User) => u.status === 'approved' && u.isActive).length;


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
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FaUsers className="mb-2" size={40} color="#007bff" />
              <Card.Title data-testid="text-total-users">{totalUsers}</Card.Title>
              <Card.Text>Total Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FaShieldAlt className="mb-2" size={40} color="#28a745" />
              <Card.Title data-testid="text-active-users">{activeUsers}</Card.Title>
              <Card.Text>Active Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
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
                Users ({users.filter(u => u.status === 'approved').length})
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
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>Active Users</h5>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Create new user (automatically approved)</Tooltip>}
                >
                  <Button variant="primary" size="sm" onClick={openCreateModal}>
                    <FaPlus className="me-1" />Create User
                  </Button>
                </OverlayTrigger>
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
                      {users.filter(u => u.status === 'approved').map((user: User) => (
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
                            {formatDate(user.createdAt)}
                          </td>
                          <td>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Change user role</Tooltip>}
                            >
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-1"
                                onClick={() => openRoleModal(user)}
                                data-testid={`button-edit-role-${user.id}`}
                                disabled={user.isDefaultAdmin}
                              >
                                <FaUserEdit />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Edit user details</Tooltip>}
                            >
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-1"
                                onClick={() => openEditModal(user)}
                                disabled={user.isDefaultAdmin}
                              >
                                <FaEdit />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Delete user</Tooltip>}
                            >
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => openDeleteModal(user)}
                                disabled={user.isDefaultAdmin}
                              >
                                <FaTrash />
                              </Button>
                            </OverlayTrigger>
                          </td>
                        </tr>
                      ))}
                      {users.filter(u => u.status === 'approved').length === 0 && (
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
                          {formatDate(user.createdAt)}
                        </td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleApproveUser(user)}
                            disabled={false}
                            data-testid={`button-approve-${user.id}`}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectUser(user)}
                            disabled={false}
                            data-testid={`button-reject-${user.id}`}
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
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Role'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email address"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter password"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Enter first name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Enter last name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="coordinator">Coordinator</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <div className="alert alert-info">
              <strong>Note:</strong> Admin-created users are automatically approved and do not require email verification.
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateUser} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={formData.email} disabled />
                <Form.Text className="text-muted">Email cannot be changed</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                >
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
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditUser} disabled={loading}>
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete User Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p>Are you sure you want to delete this user?</p>
              <div className="alert alert-warning">
                <strong>User:</strong> {selectedUser.displayName} ({selectedUser.email})<br />
                <strong>Role:</strong> {selectedUser.role}
              </div>
              <p className="text-danger">
                <strong>Warning:</strong> This action cannot be undone. The user will be permanently removed from the system.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};