/** Units supported by the backend (enum ch.tbz.recipe.planner.domain.Unit). */
export const UNITS = ["PIECE", "GRAMM", "KILOGRAMM", "LITRE", "DECILITRE"];

/** Values of a new, empty ingredient row in the form. */
export const EMPTY_INGREDIENT = {name: "", comment: "", unit: "PIECE", amount: 1};

/** Values of a new, empty recipe form. */
export const EMPTY_RECIPE = {name: "", description: "", imageUrl: "", ingredients: [EMPTY_INGREDIENT]};

/**
 * Converts the form values into the JSON structure expected by the backend.
 * Text fields are trimmed, empty optional fields are sent as null and amounts as numbers.
 *
 * @param {object} formValues values from react-hook-form
 * @returns {object} recipe for the REST API
 */
export const toRecipeRequest = (formValues) => ({
    name: formValues.name.trim(),
    description: emptyToNull(formValues.description),
    imageUrl: emptyToNull(formValues.imageUrl),
    ingredients: formValues.ingredients.map((ingredient) => ({
        name: ingredient.name.trim(),
        comment: emptyToNull(ingredient.comment),
        unit: ingredient.unit,
        amount: Number(ingredient.amount),
    })),
});

/**
 * Converts a recipe from the backend into form values (null becomes an empty string,
 * a recipe without ingredients gets one empty ingredient row).
 *
 * @param {object} recipe recipe from the REST API
 * @returns {object} values for react-hook-form
 */
export const toFormValues = (recipe) => ({
    name: recipe.name ?? "",
    description: recipe.description ?? "",
    imageUrl: recipe.imageUrl ?? "",
    ingredients: recipe.ingredients?.length
        ? recipe.ingredients.map((ingredient) => ({
            name: ingredient.name ?? "",
            comment: ingredient.comment ?? "",
            unit: ingredient.unit ?? "PIECE",
            amount: ingredient.amount ?? 1,
        }))
        : [EMPTY_INGREDIENT],
});

const emptyToNull = (value) => {
    const trimmed = (value ?? "").trim();
    return trimmed === "" ? null : trimmed;
};
