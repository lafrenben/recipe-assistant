import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

function RecipeInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(url);
  };

  return (
    <Form onSubmit={handleSubmit} className="my-3">
      <InputGroup>
        <Form.Control
          type="url"
          placeholder="Enter recipe URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={isLoading}
        />
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Extracting...' : 'Extract Recipe'}
        </Button>
      </InputGroup>
    </Form>
  );
}

export default RecipeInput;

