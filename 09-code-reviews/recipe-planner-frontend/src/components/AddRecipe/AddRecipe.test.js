import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import AddRecipe from "./AddRecipe";
import {createRecipe} from "../../api/recipeApi";

// The API module is replaced by a mock, so no backend is needed
jest.mock("../../api/recipeApi", () => ({
    createRecipe: jest.fn(),
}));

const renderForm = () => render(
    <MemoryRouter initialEntries={["/new-menues"]}>
        <Routes>
            <Route path="/new-menues" element={<AddRecipe/>}/>
            <Route path="/" element={<div>Browse page</div>}/>
        </Routes>
    </MemoryRouter>
);

describe("AddRecipe", () => {
    beforeEach(() => {
        createRecipe.mockReset();
    });

    test("shows the form with one empty ingredient row", () => {
        renderForm();

        expect(screen.getByRole("heading", {name: "Add Recipe"})).toBeInTheDocument();
        expect(screen.getByLabelText("Recipe Name:")).toHaveValue("");
        expect(screen.getAllByTestId("ingredient-row")).toHaveLength(1);
        expect(screen.getByLabelText("Ingredient 1 unit")).toHaveValue("PIECE");
    });

    test("shows validation errors and does not save an empty recipe", async () => {
        renderForm();

        await userEvent.click(screen.getByRole("button", {name: "Submit"}));

        expect(await screen.findByText("Recipe name is required")).toBeInTheDocument();
        expect(screen.getByText("Ingredient name is required")).toBeInTheDocument();
        expect(createRecipe).not.toHaveBeenCalled();
    });

    test("rejects an invalid image URL and an amount below 1", async () => {
        renderForm();

        await userEvent.type(screen.getByLabelText("Recipe Name:"), "Pizza");
        await userEvent.type(screen.getByLabelText("Image URL:"), "not-a-url");
        await userEvent.type(screen.getByLabelText("Ingredient 1 name"), "Tomato");
        await userEvent.clear(screen.getByLabelText("Ingredient 1 amount"));
        await userEvent.type(screen.getByLabelText("Ingredient 1 amount"), "0");
        await userEvent.click(screen.getByRole("button", {name: "Submit"}));

        expect(await screen.findByText("Image URL must start with http:// or https://")).toBeInTheDocument();
        expect(screen.getByText("Amount must be at least 1")).toBeInTheDocument();
        expect(createRecipe).not.toHaveBeenCalled();
    });

    test("adds and removes ingredient rows, the last row cannot be removed", async () => {
        renderForm();

        expect(screen.getByRole("button", {name: "Remove ingredient 1"})).toBeDisabled();

        await userEvent.click(screen.getByRole("button", {name: "Add Ingredient"}));
        expect(screen.getAllByTestId("ingredient-row")).toHaveLength(2);

        await userEvent.click(screen.getByRole("button", {name: "Remove ingredient 2"}));
        expect(screen.getAllByTestId("ingredient-row")).toHaveLength(1);
    });

    test("sends the recipe to the backend and navigates to the overview", async () => {
        createRecipe.mockResolvedValue({id: "1"});
        renderForm();

        await userEvent.type(screen.getByLabelText("Recipe Name:"), "Pizza Margherita");
        await userEvent.type(screen.getByLabelText("Description:"), "Classic pizza");
        await userEvent.type(screen.getByLabelText("Image URL:"), "https://example.com/pizza.jpg");
        await userEvent.type(screen.getByLabelText("Ingredient 1 name"), "Tomato");
        await userEvent.clear(screen.getByLabelText("Ingredient 1 amount"));
        await userEvent.type(screen.getByLabelText("Ingredient 1 amount"), "4");

        await userEvent.click(screen.getByRole("button", {name: "Add Ingredient"}));
        await userEvent.type(screen.getByLabelText("Ingredient 2 name"), "Flour");
        await userEvent.selectOptions(screen.getByLabelText("Ingredient 2 unit"), "GRAMM");
        await userEvent.clear(screen.getByLabelText("Ingredient 2 amount"));
        await userEvent.type(screen.getByLabelText("Ingredient 2 amount"), "500");

        await userEvent.click(screen.getByRole("button", {name: "Submit"}));

        await waitFor(() => expect(createRecipe).toHaveBeenCalledTimes(1));
        expect(createRecipe).toHaveBeenCalledWith({
            name: "Pizza Margherita",
            description: "Classic pizza",
            imageUrl: "https://example.com/pizza.jpg",
            ingredients: [
                {name: "Tomato", comment: null, unit: "PIECE", amount: 4},
                {name: "Flour", comment: null, unit: "GRAMM", amount: 500},
            ],
        });
        expect(await screen.findByText("Browse page")).toBeInTheDocument();
    });

    test("shows an error message if the backend is not reachable", async () => {
        createRecipe.mockRejectedValue(new Error("Network Error"));
        renderForm();

        await userEvent.type(screen.getByLabelText("Recipe Name:"), "Pizza");
        await userEvent.type(screen.getByLabelText("Ingredient 1 name"), "Tomato");
        await userEvent.click(screen.getByRole("button", {name: "Submit"}));

        expect(await screen.findByText("The recipe could not be saved. Please try again.")).toBeInTheDocument();
        expect(screen.queryByText("Browse page")).not.toBeInTheDocument();
    });
});
