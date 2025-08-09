import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaGraduationCap, FaChalkboardTeacher, FaChartLine } from 'react-icons/fa';
import { getUsersByRole } from '../../lib/firebase';

interface ManagerDashboardProps {
  userData: any;
  user: any;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ userData, user }) => {
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coordData, instrData, studData] = await Promise.all([
        getUsersByRole('coordinator'),
        getUsersByRole('instructor'),
        getUsersByRole('student')
      ]);
      
      setCoordinators(coordData);
      setInstructors(instrData);
      setStudents(studData);
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('danger', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'danger' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  return (
    <Container fluid data-testid="manager-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 data-testid="text-welcome">Welcome, {userData?.displayName || 'Manager'}</h2>
          <p className="text-muted">Management Dashboard</p>
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
              <FaUsers className="mb-2" size={40} color="#17a2b8" />
              <Card.Title data-testid="text-coordinators-count">{coordinators.length}</Card.Title>
              <Card.Text>Coordinators</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaChalkboardTeacher className="mb-2" size={40} color="#007bff" />
              <Card.Title data-testid="text-instructors-count">{instructors.length}</Card.Title>
              <Card.Text>Instructors</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaGraduationCap className="mb-2" size={40} color="#28a745" />
              <Card.Title data-testid="text-students-count">{students.length}</Card.Title>
              <Card.Text>Students</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaChartLine className="mb-2" size={40} color="#ffc107" />
              <Card.Title>25</Card.Title>
              <Card.Text>Monthly Reports</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center" data-testid="loading-dashboard">
          <Spinner animation="border" />
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h5>Coordinators</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover data-testid="table-coordinators">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordinators.map((coordinator) => (
                      <tr key={coordinator.id} data-testid={`coordinator-row-${coordinator.id}`}>
                        <td>{coordinator.displayName}</td>
                        <td>{coordinator.email}</td>
                        <td>
                          <Badge bg={coordinator.isActive !== false ? 'success' : 'danger'}>
                            {coordinator.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {coordinators.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted">
                          No coordinators found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h5>Instructors</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover data-testid="table-instructors">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map((instructor) => (
                      <tr key={instructor.id} data-testid={`instructor-row-${instructor.id}`}>
                        <td>{instructor.displayName}</td>
                        <td>{instructor.email}</td>
                        <td>
                          <Badge bg={instructor.isActive !== false ? 'success' : 'danger'}>
                            {instructor.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {instructors.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted">
                          No instructors found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Button variant="primary" className="me-3" data-testid="button-manage-courses" onClick={() => showAlert('info', 'Course management feature coming soon!')}>
                Manage Courses
              </Button>
              <Button variant="outline-primary" className="me-3" data-testid="button-view-reports" onClick={() => showAlert('info', 'Reports feature coming soon!')}>
                View Reports
              </Button>
              <Button variant="outline-secondary" data-testid="button-system-settings" onClick={() => showAlert('info', 'System settings feature coming soon!')}>
                System Settings
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};