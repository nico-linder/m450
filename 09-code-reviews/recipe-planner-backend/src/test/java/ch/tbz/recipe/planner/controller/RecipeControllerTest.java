package ch.tbz.recipe.planner.controller;

import ch.tbz.recipe.planner.domain.Ingredient;
import ch.tbz.recipe.planner.domain.Recipe;
import ch.tbz.recipe.planner.domain.Unit;
import ch.tbz.recipe.planner.mapper.RecipeEntityMapper;
import ch.tbz.recipe.planner.repository.RecipeRepository;
import ch.tbz.recipe.planner.service.RecipeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Task 1: tests for all methods of {@link RecipeController} with MockMvc.
 * <p>
 * {@code @WebMvcTest} only starts the web layer; the {@link RecipeService} is replaced by a Mockito mock,
 * so routing, JSON (de)serialization and status codes are tested in isolation.
 * </p>
 */
@WebMvcTest(RecipeController.class)
class RecipeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RecipeService service;

    /** Required by the controller constructor (not used by the endpoints). */
    @MockBean
    private RecipeEntityMapper mapper;

    /**
     * Required by the demo data CommandLineRunner in RecipePlannerApplication, which is also loaded in the
     * web layer test slice. As a mock, findAll() returns an empty list and no database is needed.
     */
    @MockBean
    private RecipeRepository repository;

    private UUID lasagneId;
    private Recipe lasagne;
    private Recipe friedRice;

    @BeforeEach
    void setUp() {
        lasagneId = UUID.randomUUID();
        lasagne = new Recipe(lasagneId, "Lasagne al Forno", "Italian classic", "https://example.com/lasagne.jpg",
                List.of(new Ingredient(UUID.randomUUID(), "Tomato", "The big ones", Unit.PIECE, 5)));
        friedRice = new Recipe(UUID.randomUUID(), "Fried Rice", "Asian dish", "https://example.com/rice.jpg", List.of());
    }

    @Nested
    @DisplayName("GET /api/recipes")
    class GetRecipes {

        @Test
        @DisplayName("returns 200 and all recipes as JSON")
        void allRecipes() throws Exception {
            when(service.getRecipes()).thenReturn(List.of(lasagne, friedRice));

            mockMvc.perform(get("/api/recipes"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].id").value(lasagneId.toString()))
                    .andExpect(jsonPath("$[0].name").value("Lasagne al Forno"))
                    .andExpect(jsonPath("$[0].ingredients[0].unit").value("PIECE"))
                    .andExpect(jsonPath("$[0].ingredients[0].amount").value(5))
                    .andExpect(jsonPath("$[1].name").value("Fried Rice"));

            verify(service).getRecipes();
        }

        @Test
        @DisplayName("returns 200 and an empty list if there are no recipes")
        void noRecipes() throws Exception {
            when(service.getRecipes()).thenReturn(List.of());

            mockMvc.perform(get("/api/recipes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/recipes/recipe/{recipeId}")
    class GetRecipe {

        @Test
        @DisplayName("returns 200 and the recipe with the given id")
        void existingRecipe() throws Exception {
            when(service.getRecipeById(lasagneId)).thenReturn(lasagne);

            mockMvc.perform(get("/api/recipes/recipe/{id}", lasagneId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(lasagneId.toString()))
                    .andExpect(jsonPath("$.description").value("Italian classic"))
                    .andExpect(jsonPath("$.imageUrl").value("https://example.com/lasagne.jpg"))
                    .andExpect(jsonPath("$.ingredients", hasSize(1)));

            verify(service).getRecipeById(lasagneId);
        }

        @Test
        @DisplayName("current behaviour: unknown id returns 200 with an empty body (no 404)")
        void unknownRecipe() throws Exception {
            UUID unknown = UUID.randomUUID();
            when(service.getRecipeById(unknown)).thenReturn(null);

            mockMvc.perform(get("/api/recipes/recipe/{id}", unknown))
                    .andExpect(status().isOk())
                    .andExpect(content().string(""));
        }

        @Test
        @DisplayName("an id that is not a UUID returns 400 Bad Request")
        void invalidId() throws Exception {
            mockMvc.perform(get("/api/recipes/recipe/{id}", "not-a-uuid"))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(service);
        }
    }

    @Nested
    @DisplayName("POST /api/recipes")
    class AddRecipe {

        @Test
        @DisplayName("passes the recipe from the JSON body to the service and returns the created recipe")
        void addRecipe() throws Exception {
            when(service.addRecipe(any(Recipe.class))).thenReturn(lasagne);

            mockMvc.perform(post("/api/recipes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {
                                      "name": "Lasagne al Forno",
                                      "description": "Italian classic",
                                      "imageUrl": "https://example.com/lasagne.jpg",
                                      "ingredients": [
                                        {"name": "Tomato", "comment": "The big ones", "unit": "PIECE", "amount": 5}
                                      ]
                                    }
                                    """))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(lasagneId.toString()))
                    .andExpect(jsonPath("$.name").value("Lasagne al Forno"));

            ArgumentCaptor<Recipe> captor = ArgumentCaptor.forClass(Recipe.class);
            verify(service).addRecipe(captor.capture());
            Recipe received = captor.getValue();
            assertThat(received.getId()).isNull();
            assertThat(received.getName()).isEqualTo("Lasagne al Forno");
            assertThat(received.getIngredients()).singleElement()
                    .satisfies(ingredient -> {
                        assertThat(ingredient.getUnit()).isEqualTo(Unit.PIECE);
                        assertThat(ingredient.getAmount()).isEqualTo(5);
                    });
        }

        @Test
        @DisplayName("an unknown unit in the JSON returns 400 Bad Request")
        void invalidUnit() throws Exception {
            mockMvc.perform(post("/api/recipes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"name": "X", "ingredients": [{"name": "Salt", "unit": "TEASPOON", "amount": 1}]}
                                    """))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(service);
        }

        @Test
        @DisplayName("invalid JSON returns 400 Bad Request")
        void invalidJson() throws Exception {
            mockMvc.perform(post("/api/recipes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{ not json"))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(service);
        }
    }

    @Nested
    @DisplayName("PUT /api/recipes/{recipeId}")
    class UpdateRecipe {

        private static final String UPDATE_JSON = """
                {
                  "name": "Lasagne Verdure",
                  "description": "Vegetarian",
                  "imageUrl": "https://example.com/verdure.jpg",
                  "ingredients": [{"name": "Zucchini", "unit": "PIECE", "amount": 2}]
                }
                """;

        @Test
        @DisplayName("returns 200 and the updated recipe")
        void updateExisting() throws Exception {
            Recipe updated = new Recipe(lasagneId, "Lasagne Verdure", "Vegetarian", "https://example.com/verdure.jpg",
                    List.of(new Ingredient(UUID.randomUUID(), "Zucchini", null, Unit.PIECE, 2)));
            when(service.updateRecipe(eq(lasagneId), any(Recipe.class))).thenReturn(Optional.of(updated));

            mockMvc.perform(put("/api/recipes/{id}", lasagneId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(UPDATE_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(lasagneId.toString()))
                    .andExpect(jsonPath("$.name").value("Lasagne Verdure"))
                    .andExpect(jsonPath("$.ingredients[0].name").value("Zucchini"));

            ArgumentCaptor<Recipe> captor = ArgumentCaptor.forClass(Recipe.class);
            verify(service).updateRecipe(eq(lasagneId), captor.capture());
            assertThat(captor.getValue().getName()).isEqualTo("Lasagne Verdure");
        }

        @Test
        @DisplayName("returns 404 if the recipe does not exist")
        void updateUnknown() throws Exception {
            UUID unknown = UUID.randomUUID();
            when(service.updateRecipe(eq(unknown), any(Recipe.class))).thenReturn(Optional.empty());

            mockMvc.perform(put("/api/recipes/{id}", unknown)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(UPDATE_JSON))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string(""));
        }

        @Test
        @DisplayName("returns 400 for an id that is not a UUID")
        void invalidId() throws Exception {
            mockMvc.perform(put("/api/recipes/{id}", "abc")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(UPDATE_JSON))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(service);
        }

        @Test
        @DisplayName("CORS: PUT from the React frontend is allowed (preflight)")
        void corsPreflight() throws Exception {
            mockMvc.perform(options("/api/recipes/{id}", lasagneId)
                            .header("Origin", "http://localhost:3000")
                            .header("Access-Control-Request-Method", "PUT"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
        }
    }

    @Test
    @DisplayName("CORS: the React frontend (localhost:3000) is allowed")
    void corsFrontendAllowed() throws Exception {
        when(service.getRecipes()).thenReturn(List.of());

        mockMvc.perform(get("/api/recipes").header("Origin", "http://localhost:3000"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
    }
}

