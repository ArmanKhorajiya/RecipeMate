const fs = require("fs");
const path = require("path");

const API_BASE = "https://www.themealdb.com/api/json/v1/1";
const OUTPUT_FILE = path.join(__dirname, "preparedMealDbRecipes.json");

const DELAY_MS = 150;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMealDB(endpoint, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Request failed: ${endpoint} - ${error.message}`);
      }

      await sleep(attempt * 1000);
    }
  }
}

function cleanText(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function extractIngredients(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = cleanText(meal[`strIngredient${i}`]);
    const measure = cleanText(meal[`strMeasure${i}`]);

    if (ingredient) {
      ingredients.push(measure ? `${measure} ${ingredient}` : ingredient);
    }
  }

  return ingredients;
}

function extractInstructions(value) {
  const text = cleanText(value);

  if (!text) {
    return [];
  }

  // Preserve paragraphs and existing line breaks.
  let steps = text
    .split(/\r?\n+/)
    .map((step) => step.trim())
    .filter(Boolean);

  // Some TheMealDB instructions are one long paragraph.
  if (steps.length === 1) {
    steps = text
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map((step) => step.trim())
      .filter(Boolean);
  }

  return steps;
}

function convertToMinutes(value, unit) {
  const amount = Number(value);

  if (/hour|hr/i.test(unit)) {
    return Math.round(amount * 60);
  }

  return Math.round(amount);
}

function estimateFromInstructions(instructions) {
  const text = cleanText(instructions).toLowerCase();

  if (!text) {
    return null;
  }

  // Approximate long waiting periods.
  if (/\bovernight\b|\bleave overnight\b/.test(text)) {
    return 480;
  }

  if (/\ball day\b/.test(text)) {
    return 480;
  }

  let totalMinutes = 0;
  let foundTime = false;

  // First process ranges such as "20-25 minutes".
  const rangeRegex =
    /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)/gi;

  const rangeMatches = [...text.matchAll(rangeRegex)];

  for (const match of rangeMatches) {
    const midpoint = (Number(match[1]) + Number(match[2])) / 2;

    totalMinutes += convertToMinutes(midpoint, match[3]);
    foundTime = true;
  }

  // Remove ranges so their numbers are not counted twice.
  const textWithoutRanges = text.replace(rangeRegex, " ");

  // Then process individual durations.
  const timeRegex = /(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)/gi;

  const timeMatches = [...textWithoutRanges.matchAll(timeRegex)];

  for (const match of timeMatches) {
    totalMinutes += convertToMinutes(match[1], match[2]);
    foundTime = true;
  }

  if (!foundTime || totalMinutes <= 0) {
    return null;
  }

  // Avoid unrealistic values caused by repeated mentions.
  return Math.min(Math.round(totalMinutes), 720);
}

function estimateFromRecipeType(meal) {
  const name = cleanText(meal.strMeal).toLowerCase();
  const category = cleanText(meal.strCategory).toLowerCase();
  const instructions = cleanText(meal.strInstructions).toLowerCase();

  const combined = `${name} ${category} ${instructions}`;

  // Quick preparation recipes.
  if (
    /\bsalad\b|\bsmoothie\b|\bshake\b|\bjuice\b|\bdip\b|\bsauce\b/.test(name)
  ) {
    return 10;
  }

  // Common quick meals.
  if (/\bsandwich\b|\bomelette\b|\bomlet\b|\btoast\b|\bwrap\b/.test(name)) {
    return 15;
  }

  // Rice, pasta, noodles and stir-fried dishes.
  if (
    /\bfried rice\b|\bpasta\b|\bnoodles?\b|\bstir fry\b|\bstir-fry\b/.test(name)
  ) {
    return 25;
  }

  // Baking and oven-based dishes.
  if (
    /\bbake\b|\bbaked\b|\bcake\b|\bbread\b|\broast\b|\blasagna\b/.test(combined)
  ) {
    return 45;
  }

  // Dishes that commonly require simmering or longer cooking.
  if (/\bcurry\b|\bstew\b|\bsoup\b|\bcasserole\b|\bbraise\b/.test(combined)) {
    return 40;
  }

  // General category fallback.
  if (category === "dessert") {
    return 35;
  }

  if (category === "starter" || category === "side") {
    return 20;
  }

  return 30;
}

function estimateCookingTime(meal) {
  const explicitTime = estimateFromInstructions(meal.strInstructions);

  if (explicitTime !== null) {
    return explicitTime;
  }

  return estimateFromRecipeType(meal);
}

function prepareRecipe(meal) {
  const ingredients = extractIngredients(meal);
  const instructions = extractInstructions(meal.strInstructions);
  const image = cleanText(meal.strMealThumb);

  if (
    !meal.idMeal ||
    !meal.strMeal ||
    !image ||
    ingredients.length === 0 ||
    instructions.length === 0
  ) {
    return null;
  }

  return {
    mealDbId: meal.idMeal,
    name: cleanText(meal.strMeal),
    ingredients,
    instructions,
    category: cleanText(meal.strCategory) || "Other",
    cookingTime: estimateCookingTime(meal),
    image,
  };
}

async function prepareCatalog() {
  try {
    console.log("Fetching cuisine areas...");

    const areaData = await fetchMealDB("list.php?a=list");
    const areas = Array.isArray(areaData.meals) ? areaData.meals : [];

    if (areas.length === 0) {
      throw new Error("No cuisine areas returned.");
    }

    const mealSummaries = new Map();

    console.log(`Cuisine areas: ${areas.length}\n`);

    for (const area of areas) {
      const areaName = area.strArea;

      const data = await fetchMealDB(
        `filter.php?a=${encodeURIComponent(areaName)}`,
      );

      const meals = Array.isArray(data.meals) ? data.meals : [];

      for (const meal of meals) {
        if (meal.idMeal && meal.strMeal && meal.strMealThumb) {
          mealSummaries.set(meal.idMeal, meal);
        }
      }

      console.log(`${areaName}: ${meals.length} meals`);

      await sleep(DELAY_MS);
    }

    const summaries = [...mealSummaries.values()];

    if (summaries.length === 0) {
      throw new Error("No recipes with images were found.");
    }

    console.log(`\nFound ${summaries.length} unique recipes.`);
    console.log("Fetching full recipe details...\n");

    const preparedRecipes = [];
    let skipped = 0;

    for (let i = 0; i < summaries.length; i++) {
      const summary = summaries[i];

      try {
        const data = await fetchMealDB(
          `lookup.php?i=${encodeURIComponent(summary.idMeal)}`,
        );

        const meal = data.meals?.[0];

        if (!meal) {
          skipped++;
          continue;
        }

        const recipe = prepareRecipe(meal);

        if (recipe) {
          preparedRecipes.push(recipe);
        } else {
          skipped++;
        }
      } catch (error) {
        console.log(`Skipped ${summary.strMeal}: ${error.message}`);
        skipped++;
      }

      if ((i + 1) % 25 === 0 || i + 1 === summaries.length) {
        console.log(`Processed ${i + 1}/${summaries.length} recipes`);
      }

      await sleep(DELAY_MS);
    }

    if (preparedRecipes.length === 0) {
      throw new Error("No valid recipes were prepared.");
    }

    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(preparedRecipes, null, 2),
      "utf8",
    );

    console.log("\n========== PREPARATION COMPLETE ==========");
    console.log(`Recipes prepared: ${preparedRecipes.length}`);
    console.log(`Recipes skipped: ${skipped}`);
    console.log(`Output file: ${OUTPUT_FILE}`);

    console.log("\nCooking time examples:");

    for (const recipe of preparedRecipes.slice(0, 15)) {
      console.log(`- ${recipe.name}: ${recipe.cookingTime} minutes`);
    }

    console.log("\nMongoDB was not changed. This was a preparation step.");
  } catch (error) {
    console.error("\nCatalog preparation failed:", error.message);
    console.error("MongoDB was not changed.");
  }
}

prepareCatalog();
