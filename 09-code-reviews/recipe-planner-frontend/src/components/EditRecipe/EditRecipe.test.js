import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import EditRecipe from "./EditRecipe";
import {getRecipe, updateRecipe} from "../../api/recipeApi";

// The API module is replaced by a mock, so no backend is needed
jest.mock("../../api/recipeApi", () => ({
    getRecipe: jest.fn(),
    updateRecipe: jest.fn(),
}));

const RECIPE_ID = "3f1c2a4e-1111-2222-3333-444455556666";

const LASAGNE = {
    id: RECIPE_ID,
    name: "Lasagne al Forno",
    description: "Italian classic",
    imageUrl: "https://example.com/lasagne.jpg",
    ingredients: [{id: "i-1", name: "Tomato", comment: "The big ones", unit: "PIECE", amount: 5}],
};

const renderPage = () => render(
    <MemoryRouter initialEntries={[`/recipes/${RECIPE_ID}/edit`]}>
        <Routes>
            <Route path="/recipes/:id/edit" element={<EditRecipe/>}/>
            <Route path="/" element={<div>Browse page</div>}/>
        </Routes>
    </MemoryRouter>
);

describe("EditRecipe", () => {
    beforeEach(() => {
        getRecipe.mockReset();
        updateRecipe.mockReset();
    });

    test("loads the recipe by the id from the URL and fills the form", async () => {
        getRecipe.mockResolvedValue(LASAGNE);
        renderPage();

        expect(screen.getByLabelText("Loading recipe")).toBeInTheDocument();
        expect(await screen.findByRole("heading", {name: "Edit Recipe"})).toBeInTheDocument();
        expect(getRecipe).toHaveBeenCalledWith(RECIPE_ID);
        expect(screen.getByLabelText("Recipe Name:")).toHaveValue("Lasagne al Forno");
        expect(screen.getByLabelText("Description:")).toHaveValue("Italian classic");
        expect(screen.getByLabelText("Ingredient 1 name")).toHaveValue("Tomato");
        expect(screen.getByLabelText("Ingredient 1 unit")).toHaveValue("PIECE");
        expect(screen.getByLabelText("Ingredient 1 amount")).toHaveValue(5);
        expect(screen.getByLabelText("Ingredient 1 comment")).toHaveValue("The big ones");
    });

    test("saves the changed recipe with PUT and navigates to the overview", async () => {
        getRecipe.mockResolvedValue(LASAGNE);
        updateRecipe.mockResolvedValue({...LASAGNE, name: "Lasagne Verdure"});
        renderPage();

        const name = await screen.findByLabelText("Recipe Name:");
        await userEvent.clear(name);
        await userEvent.type(name, "Lasagne Verdure");
        await userEvent.click(screen.getByRole("button", {name: "Save changes"}));

        await waitFor(() => expect(updateRecipe).toHaveBeenCalledTimes(1));
        expect(updateRecipe).toHaveBeenCalledWith(RECIPE_ID, {
            name: "Lasagne Verdure",
            description: "Italian classic",
            imageUrl: "https://example.com/lasagne.jpg",
            ingredients: [{name: "Tomato", comment: "The big ones", unit: "PIECE", amount: 5}],
        });
        expect(await screen.findByText("Browse page")).toBeInTheDocument();
    });

    test("shows a message if the recipe does not exist", async () => {
        getRecipe.mockResolvedValue(null);
        renderPage();

        expect(await screen.findByText("Recipe not found.")).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Save changes"})).not.toBeInTheDocument();
    });

    test("shows an error if the recipe cannot be loaded", async () => {
        getRecipe.mockRejectedValue(new Error("Network Error"));
        renderPage();

        expect(await screen.findByText("The recipe could not be loaded. Please try again.")).toBeInTheDocument();
    });

    test("shows an error and stays on the page if saving fails (e.g. 404)", async () => {
        getRecipe.mockResolvedValue(LASAGNE);
        updateRecipe.mockRejectedValue(new Error("Request failed with status code 404"));
        renderPage();

        await userEvent.click(await screen.findByRole("button", {name: "Save changes"}));

        expect(await screen.findByText("The recipe could not be saved. Please try again.")).toBeInTheDocument();
        expect(screen.queryByText("Browse page")).not.toBeInTheDocument();
    });
});
