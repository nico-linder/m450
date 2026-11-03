import {EMPTY_RECIPE, toRecipeRequest} from "./recipeForm";

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
