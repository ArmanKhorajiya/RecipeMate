const express = require("express");
const Recipe = require("../models/Recipe");

const router = express.Router();

// Escape special characters before using an ingredient in a regex
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Pagination helper
const getPagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const requestedLimit = parseInt(req.query.limit, 10) || 50;
  const limit = Math.min(Math.max(requestedLimit, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// GET recipes with pagination
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [recipes, total] = await Promise.all([
      Recipe.find().sort({ name: 1 }).skip(skip).limit(limit).lean(),

      Recipe.countDocuments(),
    ]);

    res.status(200).json({
      recipes,
      page,
      limit,
      total,
      hasMore: skip + recipes.length < total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recipes",
      error: error.message,
    });
  }
});

// SEARCH and rank recipes with pagination
router.get("/search", async (req, res) => {
  try {
    const ingredients = req.query.ingredients;

    if (!ingredients || !ingredients.trim()) {
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
      return res.status(200).json({
        recipes: [],
        page: 1,
        limit: 50,
        total: 0,
        hasMore: false,
      });
    }

    const { page, limit, skip } = getPagination(req);

    const searchPatterns = ingredientList.map(
      (ingredient) => new RegExp(escapeRegex(ingredient), "i"),
    );

    const matchedRecipes = await Recipe.find({
      ingredients: {
        $in: searchPatterns,
      },
    }).lean();

    const rankedRecipes = matchedRecipes
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
      .sort((a, b) => {
        if (b.matchedCount !== a.matchedCount) {
          return b.matchedCount - a.matchedCount;
        }

        return a.recipe.name.localeCompare(b.recipe.name);
      });

    const total = rankedRecipes.length;
    const recipes = rankedRecipes
      .slice(skip, skip + limit)
      .map((item) => item.recipe);

    res.status(200).json({
      recipes,
      page,
      limit,
      total,
      hasMore: skip + recipes.length < total,
    });
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
