import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function SettingsModal({
    show,
    onHide,
    standardAnnotations,
    onStandardAnnotationsChange,
    actionButtons,
    onActionButtonsChange }) {

  const [jsonError, setJsonError] = useState(null);
  const [localActionButtons, setLocalActionButtons] = useState(actionButtons);

  useEffect(() => {
    setLocalActionButtons(actionButtons);
  }, [actionButtons]);

  const validateJson = (jsonString) => {
    if (jsonString.trim() === '') {
      setJsonError(null);
      return true;
    }

    try {
      JSON.parse(jsonString);
      setJsonError(null);
      return true;
    } catch (error) {
      setJsonError('Invalid JSON: ' + error.message);
    }
    return false;
  };
    
  const handleActionButtonsChange = (e) => {
    const newValue = e.target.value;
    setLocalActionButtons(newValue);
    const isValid = validateJson(newValue);
    onActionButtonsChange(newValue, isValid);
  };

  return (
    <Modal size="lg" show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="standardAnnotations">
            <Form.Label>Standard Annotations</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={standardAnnotations}
              onChange={onStandardAnnotationsChange}
              placeholder="Enter standard annotations to be applied to all recipes"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="actionButtons">
            <Form.Label>Action Buttons (JSON)</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              value={localActionButtons}
              onChange={handleActionButtonsChange}
              placeholder="Enter JSON for action buttons or leave blank"
              isInvalid={!!jsonError}
            />
            <Form.Control.Feedback type="invalid">
              {jsonError}
            </Form.Control.Feedback>
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
