const fs = require("fs");
const path = require("path");
const readline = require("readline");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const Recipe = require("./models/Recipe");

const catalogPath = path.join(__dirname, "preparedMealDbRecipes.json");
const backupDirectory = path.join(__dirname, "backups");

const isValidImageUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const validateRecipe = (recipe, index) => {
  const errors = [];

  if (!recipe.name || typeof recipe.name !== "string") {
    errors.push("missing name");
  }

  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    errors.push("missing ingredients");
  }

  if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
    errors.push("missing instructions");
  }

  if (typeof recipe.cookingTime !== "number" || recipe.cookingTime <= 0) {
    errors.push("invalid cooking time");
  }

  if (!isValidImageUrl(recipe.image)) {
    errors.push("missing or invalid image URL");
  }

  return errors.length > 0
    ? `Recipe ${index + 1} (${recipe.name || "Unnamed"}): ${errors.join(", ")}`
    : null;
};

const askForConfirmation = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "\nType REPLACE to replace the existing recipe catalog: ",
      (answer) => {
        rl.close();
        resolve(answer.trim());
      },
    );
  });
};

const importCatalog = async () => {
  try {
    if (!fs.existsSync(catalogPath)) {
      throw new Error("preparedMealDbRecipes.json was not found.");
    }

    const recipes = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error("Catalog is empty or has an invalid format.");
    }

    const validationErrors = recipes.map(validateRecipe).filter(Boolean);

    const names = recipes.map((recipe) => recipe.name.trim().toLowerCase());

    const duplicateNames = names.filter(
      (name, index) => names.indexOf(name) !== index,
    );

    if (validationErrors.length > 0) {
      console.error("\nCatalog validation failed:");
      validationErrors.slice(0, 20).forEach(console.error);

      if (validationErrors.length > 20) {
        console.error(`...and ${validationErrors.length - 20} more errors.`);
      }

      throw new Error(
        `${validationErrors.length} recipe(s) failed validation.`,
      );
    }

    if (duplicateNames.length > 0) {
      throw new Error(
        `Catalog contains duplicate recipe names: ${[
          ...new Set(duplicateNames),
        ].join(", ")}`,
      );
    }

    console.log(`\nCatalog validation successful.`);
    console.log(`Recipes prepared: ${recipes.length}`);
    console.log("Every recipe has an image URL and required data.");

    await connectDB();

    const existingRecipes = await Recipe.find().lean();

    console.log(`Existing database recipes: ${existingRecipes.length}`);

    if (process.argv.includes("--dry-run")) {
      console.log("\nDry run complete. MongoDB was not changed.");
      process.exit(0);
    }

    const confirmation = await askForConfirmation();

    if (confirmation !== "REPLACE") {
      console.log("\nImport cancelled. MongoDB was not changed.");
      process.exit(0);
    }

    fs.mkdirSync(backupDirectory, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const backupPath = path.join(
      backupDirectory,
      `recipes-backup-${timestamp}.json`,
    );

    fs.writeFileSync(
      backupPath,
      JSON.stringify(existingRecipes, null, 2),
      "utf8",
    );

    console.log(`\nBackup created: ${backupPath}`);

    const backupCheck = JSON.parse(fs.readFileSync(backupPath, "utf8"));

    if (
      !Array.isArray(backupCheck) ||
      backupCheck.length !== existingRecipes.length
    ) {
      throw new Error("Backup verification failed. Import stopped.");
    }

    const recipesToInsert = recipes.map((recipe) => ({
      name: recipe.name.trim(),
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      category: recipe.category || "Other",
      cookingTime: recipe.cookingTime,
      image: recipe.image,
    }));

    try {
      await Recipe.deleteMany({});
      await Recipe.insertMany(recipesToInsert, {
        ordered: true,
      });

      const importedCount = await Recipe.countDocuments();

      if (importedCount !== recipesToInsert.length) {
        throw new Error(
          `Expected ${recipesToInsert.length} recipes, found ${importedCount}.`,
        );
      }

      console.log("\nRecipe catalog replaced successfully!");
      console.log(`Imported recipes: ${importedCount}`);
      console.log("User accounts were not changed.");
    } catch (importError) {
      console.error("\nImport failed. Attempting to restore backup...");

      await Recipe.deleteMany({});

      if (backupCheck.length > 0) {
        await Recipe.insertMany(backupCheck);
      }

      console.log("Previous recipe catalog restored.");
      throw importError;
    }

    process.exit(0);
  } catch (error) {
    console.error("\nCatalog import error:", error.message);
    process.exit(1);
  }
};

importCatalog();
