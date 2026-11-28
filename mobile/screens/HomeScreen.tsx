import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type HomeTheme = {
  surface: string;
  text: string;
  secondaryText: string;
  border: string;
  accent: string;
};

type RecipeItem = {
  _id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  category: string;
  cookingTime: number;
  image?: string;
};

type Props<T extends RecipeItem> = {
  theme: HomeTheme;
  userName?: string | null;
  recipes: T[];
  onSearchPress: () => void;
  renderRecipeList: (list: T[], scrollEnabled?: boolean) => React.ReactNode;
};

const quickCategories = [
  {
    label: "Breakfast",
    icon: "coffee-outline" as const,
  },
  {
    label: "Lunch",
    icon: "food-outline" as const,
  },
  {
    label: "Dinner",
    icon: "silverware-fork-knife" as const,
  },
  {
    label: "Snacks",
    icon: "cookie-outline" as const,
  },
];

export default function HomeScreen<T extends RecipeItem>({
  theme,
  userName,
  recipes,
  onSearchPress,
  renderRecipeList,
}: Props<T>) {
  const styles = createStyles(theme);

  const firstName = userName?.trim().split(" ")[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeTitle}>
            {firstName ? `Hello, ${firstName}!` : "Welcome to RecipeMate!"}
          </Text>

          <Text style={styles.welcomeSubtitle}>
            What would you like to cook today?
          </Text>
        </View>

        <View style={styles.chefIcon}>
          <MaterialCommunityIcons
            name="chef-hat"
            size={30}
            color={colors.primary}
          />
        </View>
      </View>

      {/* Search banner */}
      <TouchableOpacity
        style={styles.searchBanner}
        onPress={onSearchPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Search recipes by ingredients"
      >
        <View style={styles.searchIconContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={colors.primary}
          />
        </View>

        <View style={styles.searchTextContainer}>
          <Text style={styles.searchTitle}>Find your next meal</Text>
          <Text style={styles.searchSubtitle}>
            Search with ingredients you have
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.secondaryText}
        />
      </TouchableOpacity>

      {/* Quick categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore categories</Text>

        <View style={styles.categoryGrid}>
          {quickCategories.map((category) => (
            <View key={category.label} style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons
                  name={category.icon}
                  size={25}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.categoryLabel}>{category.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recipe collection */}
      <View style={styles.recipeSection}>
        <View style={styles.recipeSectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Discover recipes</Text>
            <Text style={styles.recipeSubtitle}>
              Delicious ideas for your next meal
            </Text>
          </View>

          <View style={styles.recipeCount}>
            <Text style={styles.recipeCountText}>{recipes.length}</Text>
          </View>
        </View>

        {renderRecipeList(recipes, false)}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: HomeTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 28,
    },

    welcomeSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 22,
    },

    welcomeTextContainer: {
      flex: 1,
      marginRight: 12,
    },

    welcomeTitle: {
      ...typography.screenTitle,
      fontSize: 23,
      color: colors.text,
    },

    welcomeSubtitle: {
      ...typography.body,
      color: colors.secondaryText,
      marginTop: 6,
    },

    chefIcon: {
      width: 58,
      height: 58,
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    searchBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 15,
      marginBottom: 28,
    },

    searchIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    searchTextContainer: {
      flex: 1,
    },

    searchTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },

    searchSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 4,
    },

    section: {
      marginBottom: 28,
    },

    sectionTitle: {
      ...typography.sectionTitle,
      fontSize: 19,
      color: colors.text,
    },

    categoryGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
    },

    categoryItem: {
      alignItems: "center",
      width: "23%",
    },

    categoryIcon: {
      width: 62,
      height: 62,
      borderRadius: 20,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 9,
    },

    categoryLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },

    recipeSection: {
      marginTop: 2,
    },

    recipeSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },

    recipeSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 5,
    },

    recipeCount: {
      minWidth: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },

    recipeCountText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.primaryDark,
    },
  });
