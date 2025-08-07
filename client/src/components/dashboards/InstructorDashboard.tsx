import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { FaGraduationCap, FaClipboardList, FaBookOpen, FaChartBar } from 'react-icons/fa';
import { getUsersByRole } from '../../lib/firebase';

interface InstructorDashboardProps {
  userData: any;
  user: any;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ userData, user }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studData = await getUsersByRole('student');
      setStudents(studData);
    } catch (error) {
      console.error('Error loading students:', error);
      showAlert('danger', 'Failed to load students data');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  return (
    <Container fluid data-testid="instructor-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 data-testid="text-welcome">Welcome, {userData?.displayName || 'Instructor'}</h2>
          <p className="text-muted">Teaching Dashboard</p>
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
              <FaGraduationCap className="mb-2" size={40} color="#28a745" />
              <Card.Title data-testid="text-students-count">{students.length}</Card.Title>
              <Card.Text>Total Students</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaClipboardList className="mb-2" size={40} color="#007bff" />
              <Card.Title>Assignments</Card.Title>
              <Card.Text>Management</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaBookOpen className="mb-2" size={40} color="#17a2b8" />
              <Card.Title>Classes</Card.Title>
              <Card.Text>Schedule</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaChartBar className="mb-2" size={40} color="#ffc107" />
              <Card.Title>Grades</Card.Title>
              <Card.Text>Analytics</Card.Text>
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
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header>
                <h5>My Students</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover data-testid="table-students">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 15).map((student) => (
                      <tr key={student.id} data-testid={`student-row-${student.id}`}>
                        <td>{student.displayName}</td>
                        <td>{student.email}</td>
                        <td>
                          <Badge bg={student.isActive !== false ? 'success' : 'danger'}>
                            {student.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          {student.updatedAt ? 
                            new Date(student.updatedAt.toDate()).toLocaleDateString() : 
                            'Never'
                          }
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">
                          No students assigned
                        </td>
                      </tr>
                    )}
                    {students.length > 15 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">
                          ... and {students.length - 15} more students
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="mb-4">
              <Card.Header>
                <h5>Recent Activity</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">No recent activity</p>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h5>Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button variant="primary" data-testid="button-create-assignment">
                    Create Assignment
                  </Button>
                  <Button variant="outline-primary" data-testid="button-grade-submissions">
                    Grade Submissions
                  </Button>
                  <Button variant="outline-secondary" data-testid="button-view-classes">
                    View Classes
                  </Button>
                  <Button variant="outline-info" data-testid="button-student-progress">
                    Student Progress
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};