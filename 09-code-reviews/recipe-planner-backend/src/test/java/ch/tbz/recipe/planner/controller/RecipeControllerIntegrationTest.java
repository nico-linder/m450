package ch.tbz.recipe.planner.controller;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Task 1: integration tests of the controller methods with REST Assured.
 * <p>
 * The whole application is started on a random port (controller, service, mapper, repository, H2),
 * nothing is mocked. At startup the application creates 15 demo recipes.
 * </p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class RecipeControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api/recipes";
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }

    @Test
    @DisplayName("GET /api/recipes returns the demo recipes with ingredients")
    void getRecipes() {
        given()
        .when()
                .get()
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("size()", greaterThanOrEqualTo(15))
                .body("name", hasItems("Lasagne al Forno", "Spaghetti Bolognese", "Fried Rice", "Pommes Frites"))
                .body("[0].ingredients[0].name", equalTo("Tomato"))
                .body("[0].ingredients[0].unit", equalTo("PIECE"));
    }

    @Test
    @DisplayName("POST /api/recipes creates a recipe with generated ids, GET by id returns it")
    void createAndGetById() {
        String id =
                given()
                        .contentType(ContentType.JSON)
                        .body("""
                                {
                                  "name": "Pizza Margherita",
                                  "description": "Classic pizza",
                                  "imageUrl": "https://example.com/pizza.jpg",
                                  "ingredients": [
                                    {"name": "Tomato", "comment": "ripe", "unit": "PIECE", "amount": 4},
                                    {"name": "Flour", "unit": "GRAMM", "amount": 500}
                                  ]
                                }
                                """)
                .when()
                        .post()
                .then()
                        .statusCode(200)
                        .body("id", notNullValue())
                        .body("name", equalTo("Pizza Margherita"))
                        .body("ingredients", hasSize(2))
                        .body("ingredients.id", everyItem(notNullValue()))
                .extract().path("id");

        given()
        .when()
                .get("/recipe/{id}", id)
        .then()
                .statusCode(200)
                .body("id", equalTo(id))
                .body("description", equalTo("Classic pizza"))
                .body("ingredients.name", hasItems("Tomato", "Flour"))
                .body("ingredients.find { it.name == 'Flour' }.amount", equalTo(500));

        given().get().then().body("name", hasItem("Pizza Margherita"));
    }

    @Test
    @DisplayName("PUT /api/recipes/{id} updates an existing recipe, GET returns the new values")
    void updateRecipe() {
        String id =
                given()
                        .contentType(ContentType.JSON)
                        .body("""
                                {"name": "Old", "description": "before", "ingredients": [{"name": "Salt", "unit": "GRAMM", "amount": 5}]}
                                """)
                .when()
                        .post()
                .then()
                        .statusCode(200)
                .extract().path("id");

        given()
                .contentType(ContentType.JSON)
                .body("""
                        {"name": "New", "description": "after", "imageUrl": "https://example.com/new.jpg",
                         "ingredients": [{"name": "Pepper", "unit": "GRAMM", "amount": 2}, {"name": "Oil", "unit": "DECILITRE", "amount": 1}]}
                        """)
        .when()
                .put("/{id}", id)
        .then()
                .statusCode(200)
                .body("id", equalTo(id))
                .body("name", equalTo("New"));

        given()
        .when()
                .get("/recipe/{id}", id)
        .then()
                .statusCode(200)
                .body("name", equalTo("New"))
                .body("description", equalTo("after"))
                .body("imageUrl", equalTo("https://example.com/new.jpg"))
                .body("ingredients.name", containsInAnyOrder("Pepper", "Oil"));
    }

    @Test
    @DisplayName("PUT /api/recipes/{id} with an unknown id returns 404")
    void updateUnknown() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"name\": \"X\", \"ingredients\": []}")
        .when()
                .put("/{id}", UUID.randomUUID())
        .then()
                .statusCode(404);
    }

    @Test
    @DisplayName("current behaviour: GET with an unknown id returns 200 with an empty body")
    void unknownId() {
        given()
        .when()
                .get("/recipe/{id}", UUID.randomUUID())
        .then()
                .statusCode(200)
                .body(emptyString());
    }

    @Test
    @DisplayName("GET with an invalid id returns 400")
    void invalidId() {
        given()
        .when()
                .get("/recipe/{id}", "123")
        .then()
                .statusCode(400);
    }
}

