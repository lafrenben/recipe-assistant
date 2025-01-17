import React from 'react';
import { Navbar as BootstrapNavbar, Container, Button, Spinner } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Navbar({ onToggleChat, isLoading, onOpenSettings }) {
  return (
    <BootstrapNavbar bg="dark" data-bs-theme="dark" className="mb-3 navbar-custom">
      <Container fluid>
        <BootstrapNavbar.Brand href="#home" className="me-auto"><span className="logo-emoji">👨‍🍳</span> jump-to-recipe</BootstrapNavbar.Brand>
        <div className="d-flex align-items-center">
          {isLoading && (
            <Spinner animation="border" variant="light" size="sm" className="me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          )}
          <Button variant="outline-light" onClick={onOpenSettings} className="me-2">
            <i className="bi bi-gear" style={{ fontSize: '1.5rem' }}></i>
            <span className="visually-hidden">Open Settings</span>
          </Button>
          <Button variant="outline-light" onClick={onToggleChat}>
            <i className="bi bi-chat-dots" style={{ fontSize: '1.5rem' }}></i>
            <span className="visually-hidden">Toggle Chat</span>
          </Button>
        </div>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
