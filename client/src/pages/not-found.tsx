import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useLocation } from 'wouter';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col xs={12} md={6}>
          <Card className="shadow border-0">
            <Card.Body className="py-5">
              <h1 className="display-1 text-muted">404</h1>
              <h2 className="mb-3">Page Not Found</h2>
              <p className="text-muted mb-4">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <Button 
                variant="primary" 
                onClick={() => setLocation('/')}
              >
                Go Home
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}