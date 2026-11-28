import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type SearchTheme = {
  background?: string;
  surface: string;
  border: string;
  text: string;
  secondaryText: string;
  accent: string;
  activeTab?: string;
};

type RecipeItem = {
  _id: string;
  name: string;
  category: string;
  ingredients: string[];
};

type Props<T extends RecipeItem> = {
  theme: SearchTheme;
  ingredientsInput: string;
  onIngredientsChange: (text: string) => void;
  recipes: T[];
  renderRecipeList: (list: T[], scrollEnabled?: boolean) => React.ReactNode;
};

const categories = ["All", "Veg", "Non-Veg", "Breakfast", "Lunch", "Dinner"];

const popularIngredients = ["Tomato", "Onion", "Paneer", "Chicken", "Potato"];

const nonVegKeywords = [
  "beef",
  "chicken",
  "lamb",
  "pork",
  "seafood",
  "fish",
  "mutton",
  "turkey",
  "duck",
  "non-veg",
];

export default function SearchScreen<T extends RecipeItem>({
  theme,
  ingredientsInput,
  onIngredientsChange,
  recipes,
  renderRecipeList,
}: Props<T>) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleClear = () => {
    onIngredientsChange("");
  };

  const handleIngredientPress = (ingredient: string) => {
    const current = ingredientsInput.trim();
    const normalizedIngredient = ingredient.toLowerCase();

    if (!current) {
      onIngredientsChange(normalizedIngredient);
      return;
    }

    const existing = current
      .split(",")
      .map((item) => item.trim().toLowerCase());

    if (existing.includes(normalizedIngredient)) {
      return;
    }

    onIngredientsChange(`${current}, ${normalizedIngredient}`);
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const category = (recipe.category || "").toLowerCase();
      const name = (recipe.name || "").toLowerCase();

      if (selectedCategory === "All") {
        return true;
      }

      if (selectedCategory === "Veg") {
        return (
          category.includes("vegetarian") ||
          category.includes("vegan") ||
          category === "veg"
        );
      }

      if (selectedCategory === "Non-Veg") {
        return nonVegKeywords.some((word) => category.includes(word));
      }

      return (
        category.includes(selectedCategory.toLowerCase()) ||
        name.includes(selectedCategory.toLowerCase())
      );
    });
  }, [recipes, selectedCategory]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background || "transparent" },
      ]}
    >
      {/* Search heading and input */}
      <View style={styles.stickyHeader}>
        <Text style={[styles.eyebrow, { color: theme.accent }]}>
          DISCOVER RECIPES
        </Text>

        <Text style={[styles.title, { color: theme.text }]}>
          Find your next meal
        </Text>

        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Search recipes using ingredients you already have.
        </Text>

        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={23}
            color={theme.accent}
          />

          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Tomato, onion, potato..."
            placeholderTextColor={theme.secondaryText}
            selectionColor={theme.accent}
            value={ingredientsInput}
            onChangeText={onIngredientsChange}
            autoCapitalize="none"
            returnKeyType="search"
          />

          {ingredientsInput.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              style={styles.clearButton}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={21}
                color={theme.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Popular ingredients */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Popular ingredients
            </Text>

            <Text style={[styles.sectionHint, { color: theme.secondaryText }]}>
              TAP TO ADD
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {popularIngredients.map((ingredient) => {
              const isSelected = ingredientsInput
                .split(",")
                .some(
                  (item) =>
                    item.trim().toLowerCase() === ingredient.toLowerCase(),
                );

              return (
                <TouchableOpacity
                  key={ingredient}
                  style={[
                    styles.ingredientChip,
                    {
                      backgroundColor: isSelected
                        ? theme.activeTab || "#FFE5BF"
                        : theme.surface,
                      borderColor: isSelected ? theme.accent : theme.border,
                    },
                  ]}
                  onPress={() => handleIngredientPress(ingredient)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {ingredient}
                  </Text>

                  <MaterialCommunityIcons
                    name={isSelected ? "check" : "plus"}
                    size={15}
                    color={theme.accent}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Explore categories
          </Text>

          <View style={styles.categoryContainer}>
            {categories.map((category) => {
              const selected = selectedCategory === category;

              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selected ? theme.accent : theme.surface,
                      borderColor: selected ? theme.accent : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: selected ? "#FFFFFF" : theme.text,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recipe results */}
        <View style={styles.resultsHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recipes for you
            </Text>

            <Text
              style={[styles.resultsSubtitle, { color: theme.secondaryText }]}
            >
              Explore something delicious today
            </Text>
          </View>

          <View
            style={[
              styles.resultBadge,
              { backgroundColor: theme.activeTab || "#FFE5BF" },
            ]}
          >
            <Text style={[styles.resultCount, { color: theme.accent }]}>
              {filteredRecipes.length} found
            </Text>
          </View>
        </View>

        <View style={styles.recipeResults}>
          {filteredRecipes.length > 0 ? (
            renderRecipeList(filteredRecipes, false)
          ) : (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: theme.activeTab || "#FFE5BF" },
                ]}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={34}
                  color={theme.accent}
                />
              </View>

              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No recipes found
              </Text>

              <Text
                style={[
                  styles.emptyDescription,
                  { color: theme.secondaryText },
                ]}
              >
                Try another category or change your search ingredients.
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory("All");
                  handleClear();
                }}
                style={[styles.resetButton, { backgroundColor: theme.accent }]}
                activeOpacity={0.8}
              >
                <Text style={styles.resetButtonText}>Reset filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  stickyHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 17,
  },

  searchBox: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
  },

  clearButton: {
    padding: 3,
  },

  scrollArea: {
    flex: 1,
  },

  section: {
    marginTop: 18,
    paddingHorizontal: 18,
  },

  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
  },

  sectionHint: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  chipsContainer: {
    gap: 9,
    paddingTop: 13,
    paddingBottom: 4,
  },

  ingredientChip: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 13,
  },

  categoryChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "700",
  },

  resultsHeader: {
    marginTop: 27,
    marginBottom: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },

  resultBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  resultCount: {
    fontSize: 11,
    fontWeight: "800",
  },

  recipeResults: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },

  emptyState: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginTop: 5,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
  },

  emptyDescription: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },

  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 17,
  },

  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
