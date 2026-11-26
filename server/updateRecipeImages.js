require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Recipe = require("./models/Recipe");

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getRecipeImage = async (recipeName) => {
  const searchQuery = `filetype:bitmap "${recipeName}" food`;

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: searchQuery,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "640",
    format: "json",
  });

  const url = `https://commons.wikimedia.org/w/api.php?${params}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "RecipeMateApp/1.0 (recipe image updater)",
    },
  });

  if (!response.ok) {
    throw new Error(`Wikimedia request failed: ${response.status}`);
  }

  const data = await response.json();
  const pages = Object.values(data.query?.pages || {});

  if (pages.length === 0) {
    return null;
  }

  const recipeWords = normalize(recipeName)
    .split(" ")
    .filter((word) => word.length > 2);

  const rankedPages = pages
    .map((page) => {
      const title = normalize(page.title.replace(/^file /, ""));
      const matchedWords = recipeWords.filter((word) =>
        title.includes(word),
      ).length;

      return {
        page,
        score: recipeWords.length ? matchedWords / recipeWords.length : 0,
      };
    })
    .sort((a, b) => b.score - a.score);

  const bestMatch = rankedPages[0];

  // Avoid assigning an unrelated image.
  if (!bestMatch || bestMatch.score < 0.5) {
    return null;
  }

  const imageInfo = bestMatch.page.imageinfo?.[0];

  return imageInfo?.thumburl || imageInfo?.url || null;
};

const updateImages = async () => {
  try {
    await connectDB();

    const recipes = await Recipe.find();
    console.log(`Found ${recipes.length} recipes`);

    let updated = 0;
    let notFound = 0;

    for (const recipe of recipes) {
      try {
        // Wait 2 seconds between Wikimedia requests
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const imageUrl = await getRecipeImage(recipe.name);

        if (!imageUrl) {
          console.log(`No suitable image found: ${recipe.name}`);
          notFound++;
          continue;
        }

        await Recipe.updateOne(
          { _id: recipe._id },
          { $set: { image: imageUrl } },
        );

        console.log(`Image updated: ${recipe.name}`);
        updated++;
      } catch (error) {
        console.log(`Failed for ${recipe.name}: ${error.message}`);
      }
    }

    console.log("\nImage update completed");
    console.log(`Updated: ${updated}`);
    console.log(`Not found: ${notFound}`);
  } catch (error) {
    console.error("Image updater failed:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

updateImages();
