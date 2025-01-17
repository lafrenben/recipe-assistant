import React from 'react';
import { Card, Row, Col, ListGroup, Button } from 'react-bootstrap';

function RecipeDisplay({ recipe, actionButtons, onUserInterfaceAction }) {
  return (
    <Card className="my-3">
      <Card.Body>
        {recipe.name && <Card.Title className="recipe-title">{recipe.name}</Card.Title>}
        {(recipe.prep_time || recipe.cook_time || recipe.yield) && (
          <div className="mb-3 text-muted">
            {recipe.prep_time && `Prep Time: ${recipe.prep_time}, `}
            {recipe.cook_time && `Cook Time: ${recipe.cook_time}, `}
            {recipe.yield && ` Yield: ${recipe.yield}`}
          </div>
        )}
        {actionButtons && recipe.ingredients && ( // only show the actions once the ingredients are available
          <div className="mb-3">
            {JSON.parse(actionButtons).map((uiAction) => (
              <Button
                key={uiAction.label} // Add a key prop to avoid React warnings
                variant="outline-primary"
                className="me-1"
                title={uiAction.request}
                onClick={() => onUserInterfaceAction(uiAction.label, uiAction.request)}
              >
                {uiAction.label}
              </Button>
            ))}
          </div>
        )}
        <Row>
          {recipe.ingredients && (
            <Col md={6}>
              <Card.Subtitle className="mb-2 text-muted">Ingredients</Card.Subtitle>
              <ListGroup variant="flush">
                {recipe.ingredients.map((ingredient) => (
                  <ListGroup.Item key={ingredient.id}>
                    {ingredient.quantity} {ingredient.name}
                    {ingredient.section && <small className="text-muted"> ({ingredient.section})</small>}
                    {ingredient.annotations && (
                      <small className="annotations-text"> {ingredient.annotations}</small>
                    )}
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
                    {instruction.annotations && (
                      <p className="annotations">
                        <small className="annotations-text"> {instruction.annotations}</small>
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
}

export default RecipeDisplay;

