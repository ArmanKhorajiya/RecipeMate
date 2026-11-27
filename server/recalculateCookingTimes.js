const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "preparedMealDbRecipes.json");

function getBaselineTime(recipe) {
  const name = (recipe.name || "").toLowerCase();
  const category = (recipe.category || "").toLowerCase();
  const text = `${name} ${category}`;

  // Bread often requires substantial preparation and baking.
  if (/\bbread\b|\bloaf\b|\bdough\b|\bkhobz\b/.test(name)) {
    return 90;
  }

  // Quick, no-cook recipes.
  if (/\bsalad\b|\bsmoothie\b|\bshake\b|\bjuice\b|\bdip\b/.test(name)) {
    return 10;
  }

  // Quick meals.
  if (/\bsandwich\b|\bburger\b|\bomelette\b|\bomlet\b|\btoast\b/.test(name)) {
    return 20;
  }

  // Rice, pasta and noodles.
  if (/\bfried rice\b|\brice\b|\bpasta\b|\bnoodles?\b/.test(name)) {
    return 25;
  }

  // Long-cooking dishes.
  if (/\bcurry\b|\bstew\b|\bbraise\b|\bcasserole\b|\broast\b/.test(text)) {
    return 50;
  }

  // Soups.
  if (/\bsoup\b|\bchowder\b/.test(name)) {
    return 40;
  }

  // Baking and desserts.
  if (
    /\bcake\b|\bbiscuit\b|\bcookie\b|\btart\b|\bpie\b|\bpudding\b/.test(name)
  ) {
    return 40;
  }

  if (category === "dessert") {
    return 35;
  }

  if (category === "starter" || category === "side") {
    return 20;
  }

  return 30;
}

function findCookingDurations(instructions) {
  const text = (instructions || []).join(" ").toLowerCase();

  const action =
    "(?:cook|bake|boil|fry|simmer|roast|grill|steam|broil|poach|saute|sauté|microwave|heat|brown|sear)";

  const duration = "(\\d+(?:\\.\\d+)?)\\s*(hours?|hrs?|minutes?|mins?)";

  const regex = new RegExp(`${action}[^.!?]{0,100}?${duration}`, "gi");

  const durations = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    let minutes = Number(match[1]);
    const unit = match[2];

    if (/hour|hr/i.test(unit)) {
      minutes *= 60;
    }

    if (minutes > 0) {
      durations.push(Math.round(minutes));
    }
  }

  return durations;
}

function estimateCookingTime(recipe) {
  const baseline = getBaselineTime(recipe);

  const durations = findCookingDurations(recipe.instructions);

  if (durations.length === 0) {
    return baseline;
  }

  // Use the longest cooking action, not the sum of every duration.
  const longestCookingStep = Math.max(...durations);

  // Keep a reasonable estimate and avoid extreme values.
  return Math.min(Math.max(baseline, longestCookingStep), 240);
}

function recalculate() {
  try {
    if (!fs.existsSync(INPUT_FILE)) {
      throw new Error("preparedMealDbRecipes.json was not found.");
    }

    const recipes = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));

    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error("The prepared recipe file is empty.");
    }

    for (const recipe of recipes) {
      recipe.cookingTime = estimateCookingTime(recipe);
    }

    fs.writeFileSync(INPUT_FILE, JSON.stringify(recipes, null, 2), "utf8");

    console.log("Cooking times recalculated.");
    console.log(`Recipes updated: ${recipes.length}`);
    console.log("\nSample estimates:");

    for (const recipe of recipes.slice(0, 20)) {
      console.log(`- ${recipe.name}: ${recipe.cookingTime} minutes`);
    }

    console.log("\nThe JSON file was updated. MongoDB was not changed.");
  } catch (error) {
    console.error("Recalculation failed:", error.message);
  }
}

recalculate();
