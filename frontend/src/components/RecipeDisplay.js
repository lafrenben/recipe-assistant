import React from 'react';
import { Card, Row, Col, ListGroup } from 'react-bootstrap';

function RecipeDisplay({ recipe }) {
  return (
    <Card className="my-3">
      <Card.Body>
        {recipe.name && <Card.Title>{recipe.name}</Card.Title>}
        <Row>
          {recipe.ingredients && (
            <Col md={6}>
              <Card.Subtitle className="mb-2 text-muted">Ingredients</Card.Subtitle>
              <ListGroup variant="flush">
                {recipe.ingredients.map((ingredient) => (
                  <ListGroup.Item key={ingredient.id}>
                    {ingredient.quantity} {ingredient.name}
                    {ingredient.section && <small className="text-muted"> ({ingredient.section})</small>}
                    {ingredient.annotations && <small className="text-muted"> {ingredient.annotations}</small>}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          )}
          {recipe.instructions && (
            <Col md={6}>
              <Card.Subtitle className="mb-2 text-muted">Instructions</Card.Subtitle>
              <ol>
                {recipe.instructions.map((instruction) => (
                  <li key={instruction.id} className="instruction">
                    {instruction.text}
                    {instruction.annotations && <p className="annotations"><small className="text-muted">{instruction.annotations}</small></p>}
                  </li>
                ))}
              </ol>
            </Col>
          )}
        </Row>
        {(recipe.prep_time || recipe.cook_time || recipe.yield) && (
          <Row className="mt-3">
            <Col>
              <span className="text-muted">
                {recipe.prep_time && `Prep Time: ${recipe.prep_time}, `}
                {recipe.cook_time && `Cook Time: ${recipe.cook_time}, `}
                {recipe.yield && ` Yield: ${recipe.yield}`}
              </span>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}

export default RecipeDisplay;

