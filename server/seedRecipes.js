require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Recipe = require("./models/Recipe");

const recipes = [
  {
    name: "Tomato Onion Sandwich",
    ingredients: ["bread", "tomato", "onion", "butter"],
    instructions: [
      "Slice the tomato and onion.",
      "Spread butter on the bread.",
      "Add tomato and onion slices.",
      "Toast the sandwich until golden.",
    ],
    category: "Breakfast",
    cookingTime: 10,
  },
  {
    name: "Vegetable Poha",
    ingredients: ["poha", "onion", "potato", "peanuts", "lemon"],
    instructions: [
      "Rinse the poha and drain it.",
      "Cook onion and potato in a pan.",
      "Add peanuts and poha.",
      "Mix well and finish with lemon juice.",
    ],
    category: "Breakfast",
    cookingTime: 20,
  },
  {
    name: "Masala Maggi",
    ingredients: ["noodles", "onion", "tomato", "peas", "masala"],
    instructions: [
      "Chop the onion and tomato.",
      "Cook them with peas in a pan.",
      "Add water, noodles, and masala.",
      "Cook until the noodles are soft.",
    ],
    category: "Snack",
    cookingTime: 10,
  },
  {
    name: "Aloo Paratha",
    ingredients: ["wheat flour", "potato", "chilli", "coriander", "salt"],
    instructions: [
      "Boil and mash the potatoes.",
      "Mix with chilli, coriander, and salt.",
      "Stuff the mixture into wheat dough.",
      "Roll and cook on a hot tawa.",
    ],
    category: "Breakfast",
    cookingTime: 25,
  },
  {
    name: "Vegetable Fried Rice",
    ingredients: ["rice", "carrot", "capsicum", "onion", "soy sauce"],
    instructions: [
      "Cook the rice and let it cool.",
      "Chop the vegetables.",
      "Stir-fry the vegetables in a pan.",
      "Add rice and soy sauce, then mix.",
    ],
    category: "Lunch",
    cookingTime: 20,
  },
  {
    name: "Paneer Bhurji",
    ingredients: ["paneer", "onion", "tomato", "turmeric", "chilli"],
    instructions: [
      "Crumble the paneer.",
      "Cook onion and tomato with spices.",
      "Add paneer and mix.",
      "Cook for a few minutes and serve.",
    ],
    category: "Dinner",
    cookingTime: 15,
  },
  {
    name: "Besan Chilla",
    ingredients: ["besan", "onion", "tomato", "coriander", "water"],
    instructions: [
      "Mix besan with water to make a batter.",
      "Add chopped onion, tomato, and coriander.",
      "Pour the batter onto a hot tawa.",
      "Cook both sides until golden.",
    ],
    category: "Breakfast",
    cookingTime: 15,
  },
  {
    name: "Garlic Butter Pasta",
    ingredients: ["pasta", "garlic", "butter", "milk", "cheese"],
    instructions: [
      "Boil the pasta until cooked.",
      "Melt butter and sauté garlic.",
      "Add milk and cheese.",
      "Mix in the pasta and serve.",
    ],
    category: "Dinner",
    cookingTime: 20,
  },
  {
    name: "Banana Smoothie",
    ingredients: ["banana", "milk", "honey", "ice"],
    instructions: [
      "Peel and slice the banana.",
      "Add banana, milk, honey, and ice to a blender.",
      "Blend until smooth.",
      "Serve immediately.",
    ],
    category: "Drink",
    cookingTime: 5,
  },
  {
    name: "Cucumber Salad",
    ingredients: ["cucumber", "tomato", "onion", "lemon", "salt"],
    instructions: [
      "Wash and chop the vegetables.",
      "Add them to a bowl.",
      "Add lemon juice and salt.",
      "Mix and serve fresh.",
    ],
    category: "Salad",
    cookingTime: 5,
  },
  {
    name: "Egg Bhurji",
    ingredients: ["egg", "onion", "tomato", "chilli", "oil"],
    instructions: [
      "Chop the onion and tomato.",
      "Cook them with chilli in a pan.",
      "Beat the eggs and add them.",
      "Stir until the eggs are fully cooked.",
    ],
    category: "Breakfast",
    cookingTime: 10,
  },
  {
    name: "Chana Masala",
    ingredients: ["chickpeas", "onion", "tomato", "garam masala", "ginger"],
    instructions: [
      "Cook the chickpeas until soft.",
      "Prepare a gravy with onion, tomato, and ginger.",
      "Add chickpeas and garam masala.",
      "Simmer until the gravy thickens.",
    ],
    category: "Lunch",
    cookingTime: 30,
  },
  {
    name: "Fruit Bowl",
    ingredients: ["apple", "banana", "orange", "grapes", "honey"],
    instructions: [
      "Wash all the fruits.",
      "Peel and chop the fruits as needed.",
      "Combine them in a bowl.",
      "Add honey and serve.",
    ],
    category: "Snack",
    cookingTime: 5,
  },
  {
    name: "Masala Oats",
    ingredients: ["oats", "carrot", "peas", "onion", "salt"],
    instructions: [
      "Chop the vegetables.",
      "Cook onion and vegetables in a pan.",
      "Add oats and water.",
      "Cook until soft and season with salt.",
    ],
    category: "Breakfast",
    cookingTime: 15,
  },
  {
    name: "Lemon Rice",
    ingredients: ["rice", "lemon", "peanuts", "turmeric", "curry leaves"],
    instructions: [
      "Cook the rice and let it cool.",
      "Heat oil and add peanuts and curry leaves.",
      "Add turmeric and lemon juice.",
      "Mix in the rice and serve.",
    ],
    category: "Lunch",
    cookingTime: 15,
  },
];

const seedRecipes = async () => {
  try {
    await connectDB();

    const operations = recipes.map((recipe) => ({
      updateOne: {
        filter: { name: recipe.name },
        update: { $set: recipe },
        upsert: true,
      },
    }));

    const result = await Recipe.bulkWrite(operations);

    console.log(`Recipes added: ${result.upsertedCount}`);
    console.log(`Existing recipes updated: ${result.modifiedCount}`);
    console.log("Recipe seeding completed!");
  } catch (error) {
    console.error("Recipe seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seedRecipes();
