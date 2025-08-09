import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { FaBookOpen, FaClipboardList, FaGraduationCap, FaCalendar, FaPlus, FaEye, FaDownload } from 'react-icons/fa';
import { createPost, getUserPosts } from '../../lib/firebase';

interface StudentDashboardProps {
  userData: any;
  user: any;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userData, user }) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

  // Mock data for demonstration - in real app this would come from Firebase
  const mockCourses = [
    { id: 1, name: 'Mathematics 101', instructor: 'Dr. Smith', progress: 75 },
    { id: 2, name: 'Physics 201', instructor: 'Prof. Johnson', progress: 60 },
    { id: 3, name: 'Chemistry 101', instructor: 'Dr. Brown', progress: 85 }
  ];

  const mockAssignments = [
    { id: 1, title: 'Algebra Homework', course: 'Mathematics 101', dueDate: '2025-08-15', status: 'pending', points: 100 },
    { id: 2, title: 'Physics Lab Report', course: 'Physics 201', dueDate: '2025-08-18', status: 'submitted', points: 80 },
    { id: 3, title: 'Chemical Equations', course: 'Chemistry 101', dueDate: '2025-08-20', status: 'graded', points: 95, grade: 'A' }
  ];

  const mockGrades = [
    { course: 'Mathematics 101', assignment: 'Quiz 1', grade: 'B+', points: '88/100' },
    { course: 'Physics 201', assignment: 'Midterm', grade: 'A-', points: '92/100' },
    { course: 'Chemistry 101', assignment: 'Lab 1', grade: 'A', points: '95/100' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Set mock data
      setCourses(mockCourses);
      setAssignments(mockAssignments);
      setGrades(mockGrades);
      
      // Load recent activity from Firebase posts
      if (user?.uid) {
        const posts = await getUserPosts(user.uid);
        setRecentActivity(posts.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showAlert('danger', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !submissionText.trim()) {
      showAlert('danger', 'Please enter your assignment submission');
      return;
    }

    try {
      await createPost(user.uid, `Assignment: ${selectedAssignment.title}`, submissionText);
      showAlert('success', 'Assignment submitted successfully!');
      setShowSubmissionModal(false);
      setSubmissionText('');
      setSelectedAssignment(null);
      
      // Update assignment status
      setAssignments(prev => prev.map(a => 
        a.id === selectedAssignment.id ? { ...a, status: 'submitted' } : a
      ));
    } catch (error) {
      console.error('Error submitting assignment:', error);
      showAlert('danger', 'Failed to submit assignment');
    }
  };

  const showAlert = (type: 'success' | 'danger' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
  const averageGrade = grades.length > 0 ? 
    grades.reduce((sum, g) => sum + parseInt(g.points.split('/')[0]), 0) / grades.length : 0;

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid data-testid="student-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 data-testid="text-welcome">Welcome, {userData?.displayName || 'Student'}</h2>
          <p className="text-muted">Student Learning Dashboard</p>
        </Col>
      </Row>

      {alert && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert(null)} className="mb-4">
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaBookOpen className="mb-2" size={40} color="#007bff" />
              <Card.Title>{courses.length}</Card.Title>
              <Card.Text>My Courses</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaClipboardList className="mb-2" size={40} color={pendingAssignments > 0 ? "#dc3545" : "#ffc107"} />
              <Card.Title>{pendingAssignments}</Card.Title>
              <Card.Text>Pending Assignments</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaGraduationCap className="mb-2" size={40} color="#28a745" />
              <Card.Title>{averageGrade > 0 ? averageGrade.toFixed(1) : '-'}</Card.Title>
              <Card.Text>Average Grade</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaCalendar className="mb-2" size={40} color="#17a2b8" />
              <Card.Title>{new Date().toLocaleDateString()}</Card.Title>
              <Card.Text>Today</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>My Assignments</h5>
              <Button size="sm" variant="outline-primary" onClick={() => loadDashboardData()}>
                Refresh
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Course</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(assignment => (
                    <tr key={assignment.id}>
                      <td>{assignment.title}</td>
                      <td>{assignment.course}</td>
                      <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={
                          assignment.status === 'pending' ? 'warning' :
                          assignment.status === 'submitted' ? 'info' :
                          assignment.status === 'graded' ? 'success' : 'secondary'
                        }>
                          {assignment.status}
                          {assignment.grade && ` (${assignment.grade})`}
                        </Badge>
                      </td>
                      <td>
                        {assignment.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline-primary"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowSubmissionModal(true);
                            }}
                          >
                            <FaPlus /> Submit
                          </Button>
                        )}
                        {assignment.status === 'submitted' && (
                          <Button size="sm" variant="outline-info" disabled>
                            <FaEye /> Submitted
                          </Button>
                        )}
                        {assignment.status === 'graded' && (
                          <Button size="sm" variant="outline-success" disabled>
                            <FaDownload /> View Grade
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>My Courses</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {courses.map(course => (
                  <Col md={4} key={course.id} className="mb-3">
                    <Card border="left" className="h-100">
                      <Card.Body>
                        <h6>{course.name}</h6>
                        <p className="text-muted small">{course.instructor}</p>
                        <div className="progress mb-2" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <small className="text-muted">{course.progress}% Complete</small>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Recent Grades</h5>
            </Card.Header>
            <Card.Body>
              {grades.length > 0 ? (
                <div className="list-group list-group-flush">
                  {grades.map((grade, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{grade.assignment}</h6>
                          <small className="text-muted">{grade.course}</small>
                        </div>
                        <div className="text-end">
                          <Badge bg="success">{grade.grade}</Badge>
                          <small className="text-muted d-block">{grade.points}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No grades available yet</p>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5>Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="primary" data-testid="button-browse-courses">
                  <FaBookOpen className="me-2" />
                  Browse Courses
                </Button>
                <Button variant="outline-primary" data-testid="button-view-schedule">
                  <FaCalendar className="me-2" />
                  View Schedule
                </Button>
                <Button variant="outline-secondary" data-testid="button-my-grades">
                  <FaGraduationCap className="me-2" />
                  My Grades
                </Button>
                <Button variant="outline-info" onClick={() => showAlert('info', 'Help & Support coming soon!')}>
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
                <Badge bg={user?.emailVerified ? 'success' : 'warning'} data-testid="badge-email-status">
                  {user?.emailVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Assignment Submission Modal */}
      <Modal show={showSubmissionModal} onHide={() => setShowSubmissionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Submit Assignment: {selectedAssignment?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Assignment Submission</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter your assignment submission here..."
              />
            </Form.Group>
            <Form.Text className="text-muted">
              Course: {selectedAssignment?.course} | Due: {selectedAssignment?.dueDate}
            </Form.Text>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmissionModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitAssignment}>
            Submit Assignment
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};