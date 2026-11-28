import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

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
  const cleaned = ingredient.trim().replace(/^\d+\s*/, "");
  const ingredientName = cleaned.split(/[,(]/)[0].trim().toLowerCase();

  const imageSlug = ingredientName.replace(/\s+/g, "_");

  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(
    imageSlug,
  )}.png`;
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

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      {/* Recipe image */}
      <View style={styles.imageContainer}>
        {imageUri && !imageFailed ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons
              name="food"
              size={42}
              color={theme.accent}
            />
          </View>
        )}

        {/* Favourite button */}
        <TouchableOpacity
          style={styles.favouriteButton}
          onPress={() => onFavouritePress(recipe)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? "Remove from favourites" : "Add to favourites"
          }
        >
          <MaterialCommunityIcons
            name={isFavorite ? "heart" : "heart-outline"}
            size={23}
            color={isFavorite ? colors.favourite : theme.secondaryText}
          />
        </TouchableOpacity>
      </View>

      {/* Recipe information */}
      <View style={styles.content}>
        <Text style={styles.recipeName} numberOfLines={2}>
          {recipe.name}
        </Text>

        <Text style={styles.category} numberOfLines={1}>
          {recipe.category}
        </Text>

        <View style={styles.timeContainer}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={theme.secondaryText}
          />

          <Text style={styles.timeText}>{recipe.cookingTime} min</Text>
        </View>

        {/* View details */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => onViewDetails(recipe)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${recipe.name}`}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>

          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: RecipeCardTheme) =>
  StyleSheet.create({
    card: {
      width: "48%",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      marginBottom: 14,
      overflow: "hidden",
      elevation: 2,
    },

    imageContainer: {
      width: "100%",
      height: 125,
      backgroundColor: theme.activeTab,
      position: "relative",
    },

    image: {
      width: "100%",
      height: "100%",
    },

    imagePlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.activeTab,
    },

    favouriteButton: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },

    content: {
      padding: 10,
    },

    recipeName: {
      ...typography.recipeTitle,
      fontSize: 15,
      color: theme.text,
      minHeight: 38,
    },

    category: {
      ...typography.caption,
      color: theme.secondaryText,
      marginTop: 3,
    },

    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      gap: 4,
    },

    timeText: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.secondaryText,
    },

    detailsButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
      borderRadius: 9,
      paddingVertical: 8,
      marginTop: 10,
      gap: 3,
    },

    detailsButtonText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "700",
    },
  });
