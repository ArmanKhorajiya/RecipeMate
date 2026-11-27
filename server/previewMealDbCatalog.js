const API_BASE = "https://www.themealdb.com/api/json/v1/1";

async function fetchMealDB(endpoint) {
  const response = await fetch(`${API_BASE}/${endpoint}`);

  if (!response.ok) {
    throw new Error(`TheMealDB request failed: ${response.status} ${endpoint}`);
  }

  return response.json();
}

async function previewCatalog() {
  try {
    console.log("Fetching TheMealDB cuisine areas...\n");

    const areaData = await fetchMealDB("list.php?a=list");
    const areas = areaData.meals;

    if (!Array.isArray(areas) || areas.length === 0) {
      throw new Error("No cuisine areas returned by TheMealDB.");
    }

    const allMeals = new Map();
    const failedAreas = [];

    for (const area of areas) {
      const areaName = area.strArea;

      try {
        const data = await fetchMealDB(
          `filter.php?a=${encodeURIComponent(areaName)}`,
        );

        const meals = Array.isArray(data.meals) ? data.meals : [];

        for (const meal of meals) {
          if (meal.idMeal && meal.strMeal && meal.strMealThumb) {
            allMeals.set(meal.idMeal, {
              id: meal.idMeal,
              name: meal.strMeal,
              image: meal.strMealThumb,
              area: areaName,
            });
          }
        }

        console.log(`${areaName}: ${meals.length} meals`);
      } catch (error) {
        failedAreas.push(areaName);
        console.log(`${areaName}: FAILED - ${error.message}`);
      }
    }

    console.log("\n========== CATALOG PREVIEW ==========");
    console.log(`Cuisine areas found: ${areas.length}`);
    console.log(`Unique meals with image URLs: ${allMeals.size}`);
    console.log(`Failed areas: ${failedAreas.length}`);

    if (failedAreas.length > 0) {
      console.log("\nFailed areas:");
      console.log(failedAreas.join(", "));
    }

    console.log("\nSample recipes:");

    for (const meal of [...allMeals.values()].slice(0, 15)) {
      console.log(`- ${meal.name} (${meal.area})`);
    }

    console.log("\nPreview complete. MongoDB was not changed.");
  } catch (error) {
    console.error("Catalog preview failed:", error.message);
  }
}

previewCatalog();
