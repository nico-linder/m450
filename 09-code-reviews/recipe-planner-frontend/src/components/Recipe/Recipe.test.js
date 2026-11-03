import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import Recipe from "./Recipe";

describe("Recipe card", () => {
    test("shows title and description and opens the edit page with the recipe id", async () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <Routes>
                    <Route path="/" element={<Recipe id="abc-123" title="Fried Rice" description="Asian dish" image="rice.jpg"/>}/>
                    <Route path="/recipes/:id/edit" element={<div>Edit page</div>}/>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Fried Rice")).toBeInTheDocument();
        expect(screen.getByText("Asian dish")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Edit Details"}));

        expect(screen.getByText("Edit page")).toBeInTheDocument();
    });
});
