import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function SettingsModal({ show, onHide, standardAnnotations, onStandardAnnotationsChange }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="standardAnnotations">
            <Form.Label>Standard Annotations</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={standardAnnotations}
              onChange={onStandardAnnotationsChange}
              placeholder="Enter standard annotations to be applied to all recipes"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
