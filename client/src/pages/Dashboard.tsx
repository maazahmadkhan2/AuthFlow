import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Modal, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../hooks/useFirebaseAuth';
import { createPost, getUserPosts, getUserData, updateUserData } from '../lib/firebase';
import { FaPlus, FaEdit, FaUser, FaEnvelope, FaCalendar, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useLocation } from 'wouter';

interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: any;
}

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', published: false });
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
      return;
    }

    if (user) {
      loadUserData();
      loadPosts();
    }
  }, [user, authLoading, navigate]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const data = await getUserData(user.uid);
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPosts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userPosts = await getUserPosts(user.uid);
      setPosts(userPosts as Post[]);
    } catch (error) {
      console.error('Error loading posts:', error);
      showAlert('danger', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) {
      showAlert('danger', 'Please fill in all fields');
      return;
    }

    try {
      await createPost(user.uid, newPost.title, newPost.content);
      showAlert('success', 'Post created successfully!');
      setNewPost({ title: '', content: '', published: false });
      setShowCreateModal(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      showAlert('danger', 'Failed to create post');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <Container className="py-4">
      {alert && (
        <Alert variant={alert.type} className="mb-4" dismissible onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
            <div>
              <h1 className="mb-2">Dashboard</h1>
              <p className="text-muted mb-0">Welcome back, {user.displayName || user.email}!</p>
            </div>
            <Button 
              variant="primary" 
              className="mt-3 mt-sm-0"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="me-2" />
              New Post
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* User Profile Card */}
        <Col xs={12} lg={4} className="mb-4 mb-lg-0">
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Profile
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="rounded-circle mb-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-3 mx-auto"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <FaUser className="text-white" size={30} />
                  </div>
                )}
                <h6>{user.displayName || 'User'}</h6>
              </div>
              
              <div className="mb-2">
                <small className="text-muted">
                  <FaEnvelope className="me-2" />
                  Email:
                </small>
                <div>{user.email}</div>
              </div>
              
              <div className="mb-2">
                <small className="text-muted">
                  <FaCheckCircle className="me-2" />
                  Email Verified:
                </small>
                <div>
                  {user.emailVerified ? (
                    <Badge bg="success">Verified</Badge>
                  ) : (
                    <Badge bg="warning">Not Verified</Badge>
                  )}
                </div>
              </div>
              
              {userData?.createdAt && (
                <div className="mb-2">
                  <small className="text-muted">
                    <FaCalendar className="me-2" />
                    Member Since:
                  </small>
                  <div>{formatDate(userData.createdAt)}</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Posts Statistics */}
        <Col xs={12} lg={8}>
          <Card className="h-100">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <FaEdit className="me-2" />
                Your Posts
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col xs={6} sm={4}>
                  <div className="border-end border-light">
                    <h3 className="text-primary mb-1">{posts.length}</h3>
                    <small className="text-muted">Total Posts</small>
                  </div>
                </Col>
                <Col xs={6} sm={4}>
                  <div className="border-end border-light">
                    <h3 className="text-success mb-1">
                      {posts.filter(p => p.published).length}
                    </h3>
                    <small className="text-muted">Published</small>
                  </div>
                </Col>
                <Col xs={12} sm={4} className="mt-3 mt-sm-0">
                  <div>
                    <h3 className="text-warning mb-1">
                      {posts.filter(p => !p.published).length}
                    </h3>
                    <small className="text-muted">Drafts</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Posts List */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Posts</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2 text-muted">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-5">
                  <FaEdit size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No posts yet</h5>
                  <p className="text-muted">Create your first post to get started!</p>
                  <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    <FaPlus className="me-2" />
                    Create Post
                  </Button>
                </div>
              ) : (
                <Row>
                  {posts.map((post) => (
                    <Col xs={12} md={6} lg={4} key={post.id} className="mb-3">
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title">{post.title}</h6>
                            <Badge bg={post.published ? 'success' : 'secondary'}>
                              {post.published ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <p className="card-text text-muted small">
                            {post.content.length > 100
                              ? `${post.content.substring(0, 100)}...`
                              : post.content}
                          </p>
                          <small className="text-muted">
                            {formatDate(post.createdAt)}
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Post Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter post title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Write your post content here..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Publish immediately"
                checked={newPost.published}
                onChange={(e) => setNewPost({ ...newPost, published: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreatePost}>
            Create Post
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};