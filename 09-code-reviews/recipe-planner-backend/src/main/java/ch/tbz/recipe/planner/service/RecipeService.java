package ch.tbz.recipe.planner.service;

import ch.tbz.recipe.planner.entities.IngredientEntity;
import ch.tbz.recipe.planner.entities.RecipeEntity;
import ch.tbz.recipe.planner.mapper.RecipeEntityMapper;
import ch.tbz.recipe.planner.repository.RecipeRepository;
import ch.tbz.recipe.planner.domain.Recipe;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RecipeService {

    RecipeEntityMapper mapper;

    RecipeRepository repository;

    public RecipeService(RecipeEntityMapper mapper, RecipeRepository repository) {
        this.mapper = mapper;
        this.repository = repository;
    }

    public List<Recipe> getRecipes() {
        List<RecipeEntity> recipesEntities = repository.findAll();
        return recipesEntities.stream().map(mapper::entityToDomain).toList();
    }

    public Recipe getRecipeById(UUID recipeId) {
        return mapper.entityToDomain(repository.findById(recipeId).orElse(null));
    }

    public Recipe addRecipe(Recipe recipe) {
        var createdRecipe = repository.save(mapper.domainToEntity(recipe));
        return mapper.entityToDomain(createdRecipe);
    }

    /**
     * Updates name, description, image and ingredients of an existing recipe.
     * The ingredients are replaced completely by the given list (new ingredient ids are generated).
     *
     * @param recipeId id of the recipe to update
     * @param recipe   new values; an id inside the object is ignored
     * @return the updated recipe, or an empty Optional if no recipe with this id exists
     */
    @Transactional
    public Optional<Recipe> updateRecipe(UUID recipeId, Recipe recipe) {
        return repository.findById(recipeId).map(entity -> {
            entity.setName(recipe.getName());
            entity.setDescription(recipe.getDescription());
            entity.setImageUrl(recipe.getImageUrl());

            // Modify the managed list in place, so orphanRemoval deletes the old ingredients
            List<IngredientEntity> newIngredients = mapper.domainToEntity(recipe).getIngredients();
            entity.getIngredients().clear();
            if (newIngredients != null) {
                newIngredients.forEach(ingredient -> ingredient.setId(null));
                entity.getIngredients().addAll(newIngredients);
            }

            return mapper.entityToDomain(repository.save(entity));
        });
    }
}
