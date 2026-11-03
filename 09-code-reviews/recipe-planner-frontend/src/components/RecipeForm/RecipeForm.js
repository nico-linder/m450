import React, {useState} from 'react';
import PropTypes from 'prop-types';
import '../AddRecipe/AddRecipe.css';
import {useFieldArray, useForm} from "react-hook-form";
import {Alert, Button, Col, Form, Row} from 'react-bootstrap';
import AddIngredient from "../AddIngredient/AddIngredient";
import {EMPTY_INGREDIENT, toRecipeRequest} from "../AddRecipe/recipeForm";

/**
 * Reusable recipe form (used to add and to edit recipes).
 * Validates the input and passes the converted recipe to onSave.
 * If onSave throws an error, an error message is shown.
 */
function RecipeForm({title, initialValues, onSave, submitLabel}) {
    const [submitError, setSubmitError] = useState(null);

    const {
        register,
        control,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm({defaultValues: initialValues});

    const {fields, append, remove} = useFieldArray({control, name: "ingredients"});

    const onSubmit = async (formValues) => {
        setSubmitError(null);
        try {
            await onSave(toRecipeRequest(formValues));
        } catch (error) {
            setSubmitError("The recipe could not be saved. Please try again.");
        }
    };

    return (
        <div className="bg">
            <Form className="m-3" noValidate onSubmit={handleSubmit(onSubmit)}>
                <h1 className="h3 bg-dark text-bg-primary mt-2">{title}</h1>

                {submitError && <Alert variant="danger">{submitError}</Alert>}

                <Form.Group className="mb-1" controlId="formBasicName">
                    <Form.Label>Recipe Name:</Form.Label>
                    <Form.Control
                        placeholder="Name"
                        isInvalid={!!errors.name}
                        {...register("name", {
                            required: "Recipe name is required",
                            validate: (value) => value.trim() !== "" || "Recipe name is required",
                        })}
                    />
                    <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-1" controlId="formBasicDescription">
                    <Form.Label>Description:</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Description" {...register("description")}/>
                </Form.Group>
                <Form.Group className="mb-5" controlId="formBasicImageUrl">
                    <Form.Label>Image URL:</Form.Label>
                    <Form.Control
                        placeholder="URL"
                        isInvalid={!!errors.imageUrl}
                        {...register("imageUrl", {
                            pattern: {value: /^https?:\/\/\S+$/i, message: "Image URL must start with http:// or https://"},
                        })}
                    />
                    <Form.Control.Feedback type="invalid">{errors.imageUrl?.message}</Form.Control.Feedback>
                </Form.Group>

                <Row className="text-white">
                    <Col>Ingredient</Col>
                    <Col>Unit</Col>
                    <Col>Quantity</Col>
                    <Col>Comment</Col>
                    <Col xs={1}></Col>
                </Row>
                <hr/>
                {fields.map((field, index) => (
                    <AddIngredient
                        key={field.id}
                        index={index}
                        register={register}
                        errors={errors}
                        onRemove={() => remove(index)}
                        canRemove={fields.length > 1}
                    />
                ))}
                <Button
                    variant='warning'
                    onClick={() => append(EMPTY_INGREDIENT)}
                    className="mt-1"
                >Add Ingredient</Button>

                <Button variant="primary" type="submit" className="mb-5" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : submitLabel}
                </Button>
            </Form>
        </div>
    )
}

RecipeForm.propTypes = {
    title: PropTypes.string.isRequired,
    initialValues: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    submitLabel: PropTypes.string,
};

RecipeForm.defaultProps = {
    submitLabel: "Submit",
};

export default RecipeForm;
