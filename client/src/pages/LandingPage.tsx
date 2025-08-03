import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useFirebaseAuth';
import { useLocation } from 'wouter';

export const LandingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (user) {
    setLocation('/dashboard');
    return null;
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <h1 className="display-4 mb-4 text-primary">Welcome to Firebase App</h1>
              <p className="lead mb-4">
                A modern web application built with React, Firebase Authentication, and Firestore database.
              </p>
              <div className="d-grid gap-3">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => setLocation('/auth')}
                >
                  Get Started
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};