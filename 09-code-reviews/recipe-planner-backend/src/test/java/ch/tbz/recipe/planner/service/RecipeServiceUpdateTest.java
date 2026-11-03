package ch.tbz.recipe.planner.service;

import ch.tbz.recipe.planner.domain.Ingredient;
import ch.tbz.recipe.planner.domain.Recipe;
import ch.tbz.recipe.planner.domain.Unit;
import ch.tbz.recipe.planner.entities.IngredientEntity;
import ch.tbz.recipe.planner.entities.RecipeEntity;
import ch.tbz.recipe.planner.mapper.RecipeEntityMapper;
import ch.tbz.recipe.planner.mapper.RecipeEntityMapperImpl;
import ch.tbz.recipe.planner.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.SoftAssertions.assertSoftly;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link RecipeService#updateRecipe(UUID, Recipe)} with a mocked repository
 * and the real (MapStruct generated) mapper.
 */
@ExtendWith(MockitoExtension.class)
class RecipeServiceUpdateTest {

    @Mock
    private RecipeRepository repository;

    private RecipeService service;
    private UUID recipeId;
    private RecipeEntity existing;

    @BeforeEach
    void setUp() {
        RecipeEntityMapper mapper = new RecipeEntityMapperImpl();
        service = new RecipeService(mapper, repository);

        recipeId = UUID.randomUUID();
        List<IngredientEntity> ingredients = new ArrayList<>(List.of(
                new IngredientEntity(UUID.randomUUID(), "Tomato", "The big ones", Unit.PIECE, 5)));
        existing = new RecipeEntity(recipeId, "Old name", "Old description", "old.jpg", ingredients);
    }

    @Test
    @DisplayName("updates all fields and replaces the ingredients of an existing recipe")
    void updateExisting() {
        when(repository.findById(recipeId)).thenReturn(Optional.of(existing));
        when(repository.save(any(RecipeEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        List<IngredientEntity> managedList = existing.getIngredients();

        Recipe update = new Recipe(UUID.randomUUID(), "New name", "New description", "new.jpg", List.of(
                new Ingredient(UUID.randomUUID(), "Flour", null, Unit.GRAMM, 500),
                new Ingredient(null, "Water", "cold", Unit.DECILITRE, 3)));

        Optional<Recipe> result = service.updateRecipe(recipeId, update);

        assertThat(result).isPresent();
        assertSoftly(softly -> {
            softly.assertThat(result.get().getId()).as("id from the path, not from the body").isEqualTo(recipeId);
            softly.assertThat(result.get().getName()).isEqualTo("New name");
            softly.assertThat(result.get().getDescription()).isEqualTo("New description");
            softly.assertThat(result.get().getImageUrl()).isEqualTo("new.jpg");
            softly.assertThat(result.get().getIngredients()).extracting(Ingredient::getName).containsExactly("Flour", "Water");
            softly.assertThat(existing.getIngredients()).as("managed list is modified in place").isSameAs(managedList);
            softly.assertThat(existing.getIngredients()).extracting(IngredientEntity::getId).containsOnlyNulls();
        });
        verify(repository).save(existing);
    }

    @Test
    @DisplayName("removes all ingredients if the update contains none")
    void updateWithoutIngredients() {
        when(repository.findById(recipeId)).thenReturn(Optional.of(existing));
        when(repository.save(any(RecipeEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Recipe> result = service.updateRecipe(recipeId, new Recipe(null, "Empty", null, null, null));

        assertThat(result).isPresent();
        assertThat(result.get().getIngredients()).isEmpty();
    }

    @Test
    @DisplayName("returns an empty Optional and saves nothing if the recipe does not exist")
    void updateUnknown() {
        UUID unknown = UUID.randomUUID();
        when(repository.findById(unknown)).thenReturn(Optional.empty());

        Optional<Recipe> result = service.updateRecipe(unknown, new Recipe(null, "X", null, null, List.of()));

        assertThat(result).isEmpty();
        verify(repository, never()).save(any());
    }
}
