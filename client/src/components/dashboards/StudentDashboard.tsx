import React from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { FaBookOpen, FaClipboardList, FaGraduationCap, FaCalendar } from 'react-icons/fa';

interface StudentDashboardProps {
  userData: any;
  user: any;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userData, user }) => {
  return (
    <Container fluid data-testid="student-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 data-testid="text-welcome">Welcome, {userData?.displayName || 'Student'}</h2>
          <p className="text-muted">Student Learning Dashboard</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaBookOpen className="mb-2" size={40} color="#007bff" />
              <Card.Title>My Courses</Card.Title>
              <Card.Text>Current: 0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaClipboardList className="mb-2" size={40} color="#ffc107" />
              <Card.Title>Assignments</Card.Title>
              <Card.Text>Pending: 0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaGraduationCap className="mb-2" size={40} color="#28a745" />
              <Card.Title>Grades</Card.Title>
              <Card.Text>Average: -</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaCalendar className="mb-2" size={40} color="#17a2b8" />
              <Card.Title>Schedule</Card.Title>
              <Card.Text>Today: 0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" data-testid="alert-no-activity">
                <Alert.Heading>Welcome to Your Dashboard!</Alert.Heading>
                <p>Once you're enrolled in courses, you'll see your assignments, grades, and activity here.</p>
              </Alert>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>Upcoming Assignments</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted" data-testid="text-no-assignments">
                No upcoming assignments
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="primary" data-testid="button-browse-courses">
                  Browse Courses
                </Button>
                <Button variant="outline-primary" data-testid="button-view-schedule">
                  View Schedule
                </Button>
                <Button variant="outline-secondary" data-testid="button-my-grades">
                  My Grades
                </Button>
                <Button variant="outline-info" data-testid="button-help-support">
                  Help & Support
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>Account Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Role:</span>
                <Badge bg="secondary" data-testid="badge-user-role">{userData?.role || 'Student'}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Status:</span>
                <Badge bg={userData?.isActive !== false ? 'success' : 'danger'} data-testid="badge-user-status">
                  {userData?.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Email Verified:</span>
                <Badge bg={userData?.emailVerified ? 'success' : 'warning'} data-testid="badge-email-status">
                  {userData?.emailVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};