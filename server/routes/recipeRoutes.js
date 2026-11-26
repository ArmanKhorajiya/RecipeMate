const express = require("express");
const Recipe = require("../models/Recipe");

const router = express.Router();

// Escape special characters before using an ingredient in a regex
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// GET all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find();

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recipes",
      error: error.message,
    });
  }
});

// SEARCH and rank recipes by matching ingredients
router.get("/search", async (req, res) => {
  try {
    const ingredients = req.query.ingredients;

    if (!ingredients) {
      return res.status(400).json({
        message: "Please provide ingredients to search",
      });
    }

    const ingredientList = [
      ...new Set(
        ingredients
          .split(",")
          .map((ingredient) => ingredient.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];

    if (ingredientList.length === 0) {
      return res.status(200).json([]);
    }

    const searchPatterns = ingredientList.map(
      (ingredient) => new RegExp(escapeRegex(ingredient), "i"),
    );

    const recipes = await Recipe.find({
      ingredients: {
        $in: searchPatterns,
      },
    });

    const rankedRecipes = recipes
      .map((recipe) => {
        const recipeIngredients = recipe.ingredients.map((ingredient) =>
          ingredient.toLowerCase(),
        );

        const matchedCount = ingredientList.filter((searchIngredient) =>
          recipeIngredients.some((recipeIngredient) =>
            recipeIngredient.includes(searchIngredient),
          ),
        ).length;

        return {
          recipe,
          matchedCount,
        };
      })
      .sort((a, b) => b.matchedCount - a.matchedCount);

    res.status(200).json(rankedRecipes.map((item) => item.recipe));
  } catch (error) {
    res.status(500).json({
      message: "Failed to search recipes",
      error: error.message,
    });
  }
});

// GET recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recipe",
      error: error.message,
    });
  }
});

// CREATE a new recipe
router.post("/", async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);

    res.status(201).json(recipe);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create recipe",
      error: error.message,
    });
  }
});

module.exports = router;
