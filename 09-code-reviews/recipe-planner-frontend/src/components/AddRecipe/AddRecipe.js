import React from 'react';
import {useNavigate} from "react-router-dom";
import RecipeForm from "../RecipeForm/RecipeForm";
import {createRecipe} from "../../api/recipeApi";
import {EMPTY_RECIPE} from "./recipeForm";

/**
 * Page to create a new recipe with any number of ingredients.
 * After saving, the user is redirected to the recipe overview.
 */
function AddRecipe() {
    const navigate = useNavigate();

    const save = async (recipe) => {
        await createRecipe(recipe);
        navigate("/");
    };

    return <RecipeForm title="Add Recipe" initialValues={EMPTY_RECIPE} onSave={save}/>;
}

export default AddRecipe;
