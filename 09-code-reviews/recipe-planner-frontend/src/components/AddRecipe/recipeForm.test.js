import {EMPTY_INGREDIENT, EMPTY_RECIPE, toFormValues, toRecipeRequest} from "./recipeForm";

describe("toFormValues", () => {
    test("converts null values of a loaded recipe into empty strings", () => {
        const values = toFormValues({
            id: "1",
            name: "Soup",
            description: null,
            imageUrl: null,
            ingredients: [{id: "i", name: "Water", comment: null, unit: "LITRE", amount: 2}],
        });

        expect(values).toEqual({
            name: "Soup",
            description: "",
            imageUrl: "",
            ingredients: [{name: "Water", comment: "", unit: "LITRE", amount: 2}],
        });
    });

    test("adds one empty ingredient row if the recipe has no ingredients", () => {
        expect(toFormValues({name: "Empty", ingredients: []}).ingredients).toEqual([EMPTY_INGREDIENT]);
        expect(toFormValues({name: "Empty", ingredients: null}).ingredients).toEqual([EMPTY_INGREDIENT]);
    });
});

describe("toRecipeRequest", () => {
    test("trims texts, converts amounts to numbers and sends empty optional fields as null", () => {
        const request = toRecipeRequest({
            name: "  Pizza  ",
            description: "",
            imageUrl: "   ",
            ingredients: [
                {name: " Tomato ", comment: "", unit: "PIECE", amount: "4"},
                {name: "Flour", comment: " fine ", unit: "GRAMM", amount: 500},
            ],
        });

        expect(request).toEqual({
            name: "Pizza",
            description: null,
            imageUrl: null,
            ingredients: [
                {name: "Tomato", comment: null, unit: "PIECE", amount: 4},
                {name: "Flour", comment: "fine", unit: "GRAMM", amount: 500},
            ],
        });
    });

    test("does not send an id, so the backend generates a new one", () => {
        const request = toRecipeRequest({...EMPTY_RECIPE, name: "Soup"});

        expect(request).not.toHaveProperty("id");
        expect(request.ingredients[0]).not.toHaveProperty("id");
    });
});
