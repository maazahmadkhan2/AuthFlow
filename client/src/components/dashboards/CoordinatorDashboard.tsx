import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { FaChalkboardTeacher, FaGraduationCap, FaBookOpen, FaClipboardList } from 'react-icons/fa';
import { getUsersByRole } from '../../lib/firebase';

interface CoordinatorDashboardProps {
  userData: any;
  user: any;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({ userData, user }) => {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [instrData, studData] = await Promise.all([
        getUsersByRole('instructor'),
        getUsersByRole('student')
      ]);
      
      setInstructors(instrData);
      setStudents(studData);
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('danger', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  return (
    <Container fluid data-testid="coordinator-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 data-testid="text-welcome">Welcome, {userData?.displayName || 'Coordinator'}</h2>
          <p className="text-muted">Course Coordination Dashboard</p>
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
              <FaBookOpen className="mb-2" size={40} color="#17a2b8" />
              <Card.Title>Courses</Card.Title>
              <Card.Text>Management</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaClipboardList className="mb-2" size={40} color="#ffc107" />
              <Card.Title>Schedule</Card.Title>
              <Card.Text>Overview</Card.Text>
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
                <h5>Instructors Under Coordination</h5>
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
                          No instructors assigned
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
                <h5>Students Overview</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover data-testid="table-students">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 10).map((student) => (
                      <tr key={student.id} data-testid={`student-row-${student.id}`}>
                        <td>{student.displayName}</td>
                        <td>{student.email}</td>
                        <td>
                          <Badge bg={student.isActive !== false ? 'success' : 'danger'}>
                            {student.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted">
                          No students found
                        </td>
                      </tr>
                    )}
                    {students.length > 10 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted">
                          ... and {students.length - 10} more students
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
              <h5>Course Management Actions</h5>
            </Card.Header>
            <Card.Body>
              <Button variant="primary" className="me-3" data-testid="button-manage-courses">
                Manage Courses
              </Button>
              <Button variant="outline-primary" className="me-3" data-testid="button-assign-instructors">
                Assign Instructors
              </Button>
              <Button variant="outline-secondary" className="me-3" data-testid="button-view-schedules">
                View Schedules
              </Button>
              <Button variant="outline-info" data-testid="button-course-reports">
                Course Reports
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};