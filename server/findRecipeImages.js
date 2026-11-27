const recipes = [
  {
    name: "Tomato Onion Sandwich",
    searches: ["tomato sandwich", "onion sandwich", "vegetable sandwich"],
  },
  {
    name: "Vegetable Poha",
    searches: ["poha", "vegetable breakfast", "Indian breakfast"],
  },
  {
    name: "Masala Maggi",
    searches: ["masala noodles", "noodles", "spicy noodles"],
  },
  {
    name: "Aloo Paratha",
    searches: ["aloo paratha", "potato bread", "flatbread"],
  },
  {
    name: "Vegetable Fried Rice",
    searches: ["vegetable fried rice", "fried rice"],
  },
  {
    name: "Paneer Bhurji",
    searches: ["paneer bhurji", "paneer", "Indian cheese"],
  },
  {
    name: "Besan Chilla",
    searches: ["besan chilla", "chickpea pancake", "pancake"],
  },
  {
    name: "Garlic Butter Pasta",
    searches: ["garlic pasta", "butter pasta", "pasta"],
  },
  {
    name: "Banana Smoothie",
    searches: ["banana smoothie", "banana milkshake", "smoothie"],
  },
  {
    name: "Cucumber Salad",
    searches: ["cucumber salad", "cucumber", "salad"],
  },
  {
    name: "Egg Bhurji",
    searches: ["egg bhurji", "scrambled eggs", "egg"],
  },
  {
    name: "Chana Masala",
    searches: ["chana masala", "chickpea curry", "chickpeas"],
  },
  {
    name: "Fruit Bowl",
    searches: ["fruit salad", "fruit bowl", "mixed fruit"],
  },
  {
    name: "Masala Oats",
    searches: ["masala oats", "oatmeal", "porridge"],
  },
  {
    name: "Lemon Rice",
    searches: ["lemon rice", "rice", "rice dish"],
  },
];

async function findImages() {
  for (const recipe of recipes) {
    console.log(`\n🍽️ Recipe: ${recipe.name}`);
    let found = false;

    for (const searchTerm of recipe.searches) {
      try {
        const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchTerm)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.meals) {
          for (const meal of data.meals.slice(0, 3)) {
            console.log(`  Search: ${searchTerm}`);
            console.log(`  Meal: ${meal.strMeal}`);
            console.log(`  Image: ${meal.strMealThumb}`);
            console.log("  ----------------------");
            found = true;
          }
        }
      } catch (error) {
        console.log(`  Search failed: ${searchTerm}`);
        console.log(error.message);
      }
    }

    if (!found) {
      console.log("  No TheMealDB results found.");
    }
  }
}

findImages();
