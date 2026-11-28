const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    ingredients: {
      type: [String],
      required: true,
    },

    instructions: {
      type: [String],
      required: true,
    },

    category: {
      type: String,
      default: "Other",
    },

    mealTypes: {
      type: [String],
      enum: ["Breakfast", "Lunch", "Dinner"],
      default: [],
    },

    cookingTime: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
