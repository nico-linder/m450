import './Recipe.css'
import {Button, Card } from "react-bootstrap";
import React from "react";
import PropTypes from "prop-types";
import {useNavigate} from "react-router-dom";

function Recipe(props) {
    const navigate = useNavigate();

    return (
    <Card style={{ width: '18rem' }}>
        <Card.Img variant="top" src={props.image} />
        <Card.Body>
            <Card.Title>{props.title}</Card.Title>
            {props.description}
            <Button variant="primary" onClick={() => navigate(`/recipes/${props.id}/edit`)}>Edit Details</Button>
        </Card.Body>
    </Card>
    )
}

Recipe.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
};

export default Recipe;
