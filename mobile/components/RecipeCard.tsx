import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";

export type RecipeCardRecipe = {
  _id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  category: string;
  cookingTime: number;
  image?: string;
};

type RecipeCardTheme = {
  surface: string;
  activeTab: string;
  text: string;
  secondaryText: string;
  border: string;
  accent: string;
};

type RecipeCardProps = {
  recipe: RecipeCardRecipe;
  isFavorite: boolean;
  theme: RecipeCardTheme;
  onFavouritePress: (recipe: RecipeCardRecipe) => void;
  onViewDetails: (recipe: RecipeCardRecipe) => void;
};

const ingredientPhotoUrl = (ingredient: string) => {
  const cleaned = ingredient.trim().replace(/^\\d+\\s*/, "");
  const ingredientName = cleaned.split(/[,(]/)[0].trim().toLowerCase();
  const imageSlug = ingredientName.replace(/\\s+/g, "_");
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(imageSlug)}.png`;
};

export default function RecipeCard({
  recipe,
  isFavorite,
  theme,
  onFavouritePress,
  onViewDetails,
}: RecipeCardProps) {
  const imageUri =
    recipe.image ||
    (recipe.ingredients?.length
      ? ingredientPhotoUrl(recipe.ingredients[0])
      : "");

  return (
    <View
      style={[
        styles.recipeCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.cardImageContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: theme.activeTab },
            ]}
          >
            <Text style={styles.placeholderEmoji}>🍲</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.heartButton, { backgroundColor: theme.surface }]}
          onPress={() => onFavouritePress(recipe)}
          accessibilityLabel={
            isFavorite ? "Remove from favourites" : "Add to favourites"
          }
        >
          <Text
            style={[
              styles.heart,
              { color: isFavorite ? "#E53935" : theme.secondaryText },
            ]}
          >
            {isFavorite ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        numberOfLines={2}
        style={[styles.recipeName, { color: theme.text }]}
      >
        {recipe.name}
      </Text>
      <Text
        numberOfLines={1}
        style={[styles.category, { color: theme.secondaryText }]}
      >
        {recipe.category} • {recipe.cookingTime} min
      </Text>

      <TouchableOpacity
        style={[styles.viewDetailsButton, { backgroundColor: theme.accent }]}
        onPress={() => onViewDetails(recipe)}
      >
        <Text style={styles.viewDetailsButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  recipeCard: {
    width: "48%",
    borderWidth: 1,
    padding: 10,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
    overflow: "hidden",
  },
  cardImageContainer: {
    width: "100%",
    height: 125,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 9,
    position: "relative",
  },
  cardImage: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholderEmoji: { fontSize: 42 },
  viewDetailsButton: {
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
    marginTop: 8,
  },
  viewDetailsButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  recipeName: { fontSize: 16, fontWeight: "bold" },
  category: { fontSize: 12, marginTop: 4 },
  heartButton: {
    position: "absolute",
    right: 7,
    top: 7,
    padding: 5,
    borderRadius: 20,
  },
  heart: { fontSize: 25 },
});
