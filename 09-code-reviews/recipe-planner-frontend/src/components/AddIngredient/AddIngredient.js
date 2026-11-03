import React from 'react';
import PropTypes from 'prop-types';
import './AddIngredient.css';
import {Button, Col, Form, Row} from "react-bootstrap";
import {UNITS} from "../AddRecipe/recipeForm";

/**
 * One ingredient row of the recipe form (name, unit, amount, optional comment).
 * The inputs are registered in the parent form via react-hook-form.
 */
const AddIngredient = ({index, register, errors, onRemove, canRemove}) => {
    const fieldErrors = errors?.ingredients?.[index] ?? {};

    return (
        <Row className="align-items-start" data-testid="ingredient-row">
            <Col>
                <Form.Group className="mb-1" controlId={`ingredient-${index}-name`}>
                    <Form.Control
                        placeholder="Name"
                        aria-label={`Ingredient ${index + 1} name`}
                        isInvalid={!!fieldErrors.name}
                        {...register(`ingredients.${index}.name`, {
                            required: "Ingredient name is required",
                            validate: (value) => value.trim() !== "" || "Ingredient name is required",
                        })}
                    />
                    <Form.Control.Feedback type="invalid">{fieldErrors.name?.message}</Form.Control.Feedback>
                </Form.Group>
            </Col>
            <Col>
                <Form.Group className="mb-1" controlId={`ingredient-${index}-unit`}>
                    <Form.Select aria-label={`Ingredient ${index + 1} unit`} {...register(`ingredients.${index}.unit`)}>
                        {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col>
                <Form.Group className="mb-1" controlId={`ingredient-${index}-amount`}>
                    <Form.Control
                        type="number"
                        min={1}
                        placeholder="Quantity"
                        aria-label={`Ingredient ${index + 1} amount`}
                        isInvalid={!!fieldErrors.amount}
                        {...register(`ingredients.${index}.amount`, {
                            required: "Amount is required",
                            min: {value: 1, message: "Amount must be at least 1"},
                            validate: (value) => Number.isInteger(Number(value)) || "Amount must be a whole number",
                        })}
                    />
                    <Form.Control.Feedback type="invalid">{fieldErrors.amount?.message}</Form.Control.Feedback>
                </Form.Group>
            </Col>
            <Col>
                <Form.Group className="mb-1" controlId={`ingredient-${index}-comment`}>
                    <Form.Control
                        placeholder="Comment (optional)"
                        aria-label={`Ingredient ${index + 1} comment`}
                        {...register(`ingredients.${index}.comment`)}
                    />
                </Form.Group>
            </Col>
            <Col xs={1}>
                <Button
                    onClick={onRemove}
                    disabled={!canRemove}
                    variant='outline-light'
                    className="mb-1"
                    aria-label={`Remove ingredient ${index + 1}`}
                >x</Button>
            </Col>
        </Row>
    )
}

AddIngredient.propTypes = {
    index: PropTypes.number.isRequired,
    register: PropTypes.func.isRequired,
    errors: PropTypes.object,
    onRemove: PropTypes.func.isRequired,
    canRemove: PropTypes.bool,
};

AddIngredient.defaultProps = {
    errors: {},
    canRemove: true,
};

export default AddIngredient;
