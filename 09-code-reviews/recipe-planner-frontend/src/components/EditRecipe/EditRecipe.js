import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {Alert, Spinner} from "react-bootstrap";
import RecipeForm from "../RecipeForm/RecipeForm";
import {getRecipe, updateRecipe} from "../../api/recipeApi";
import {toFormValues} from "../AddRecipe/recipeForm";

/**
 * Page to edit an existing recipe. The recipe is loaded by the id from the URL (/recipes/:id/edit),
 * shown in the recipe form and saved with PUT. After saving, the user is redirected to the overview.
 */
function EditRecipe() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [state, setState] = useState({status: "loading", recipe: null});

    useEffect(() => {
        let active = true;
        getRecipe(id)
            .then((recipe) => active && setState(recipe
                ? {status: "loaded", recipe}
                : {status: "notFound", recipe: null}))
            .catch(() => active && setState({status: "error", recipe: null}));
        return () => {
            active = false;
        };
    }, [id]);

    const save = async (recipe) => {
        await updateRecipe(id, recipe);
        navigate("/");
    };

    if (state.status === "loading") {
        return <div className="m-3 text-center"><Spinner animation="border" role="status" aria-label="Loading recipe"/></div>;
    }
    if (state.status === "notFound") {
        return <Alert variant="warning" className="m-3">Recipe not found.</Alert>;
    }
    if (state.status === "error") {
        return <Alert variant="danger" className="m-3">The recipe could not be loaded. Please try again.</Alert>;
    }

    return (
        <RecipeForm
            title="Edit Recipe"
            initialValues={toFormValues(state.recipe)}
            onSave={save}
            submitLabel="Save changes"
        />
    );
}

export default EditRecipe;
