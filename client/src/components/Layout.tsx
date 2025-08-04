import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useFirebaseAuth';
import { signOutUser } from '../lib/firebase';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);

  // Collapse navbar when route changes
  useEffect(() => {
    setExpanded(false);
  }, [location]);

  // Collapse navbar when user login state changes
  useEffect(() => {
    setExpanded(false);
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setExpanded(false); // Collapse navbar after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4" expanded={expanded} onToggle={setExpanded}>
        <Container>
          <Navbar.Brand href="/" onClick={handleNavClick}>Firebase App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {user ? (
                <>
                  <Nav.Link disabled className="text-light">
                    Welcome, {user.displayName || user.email}
                  </Nav.Link>
                  <Button 
                    variant="outline-light" 
                    size="sm" 
                    onClick={handleSignOut}
                    style={{ fontSize: '14px', height: '32px' }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                !loading && (
                  <Nav.Link href="/auth" onClick={handleNavClick}>Sign In</Nav.Link>
                )
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="flex-grow-1">
        {children}
      </Container>

      <footer className="bg-light py-3 mt-4">
        <Container>
          <div className="text-center text-muted">
            <small>© 2025 Firebase App. Built with React & Bootstrap.</small>
          </div>
        </Container>
      </footer>
    </div>
  );
};