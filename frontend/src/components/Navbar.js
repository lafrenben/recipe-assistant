import React from 'react';
import { Navbar as BootstrapNavbar, Container, Button, Spinner } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Navbar({ onToggleChat, isLoading }) {
  return (
    <BootstrapNavbar bg="dark" variant="dark" className="mb-3">
      <Container fluid>
        <BootstrapNavbar.Brand href="#home" className="me-auto">👨‍🍳 Recipe Assistant</BootstrapNavbar.Brand>
        <div className="d-flex align-items-center">
          {isLoading && (
            <Spinner animation="border" variant="light" size="sm" className="me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          )}
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

