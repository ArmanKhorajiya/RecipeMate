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
import EmptyState from "../components/common/EmptyState";

type FavouritesTheme = {
  background: string;
  surface: string;
  text: string;
  secondaryText: string;
  border: string;
  accent: string;
};

type Props = {
  theme: FavouritesTheme;
  isLoggedIn: boolean;
  favouriteCount: number;
  onLoginPress: () => void;
  renderFavouriteRecipes: () => React.ReactNode;
};

export default function FavouritesScreen({
  theme,
  isLoggedIn,
  favouriteCount,
  onLoginPress,
  renderFavouriteRecipes,
}: Props) {
  const styles = createStyles(theme);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Your Favourites</Text>
          <Text style={styles.subtitle}>Your personally saved recipes</Text>
        </View>

        <View style={styles.heartIcon}>
          <MaterialCommunityIcons
            name="heart"
            size={27}
            color={colors.favourite}
          />
        </View>
      </View>

      {!isLoggedIn ? (
        <View style={styles.loginCard}>
          <View style={styles.loginIcon}>
            <MaterialCommunityIcons
              name="heart-outline"
              size={42}
              color={colors.primary}
            />
          </View>

          <Text style={styles.loginTitle}>Save recipes you love</Text>

          <Text style={styles.loginMessage}>
            Log in to keep your favourite recipes together and find them
            whenever you need.
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={onLoginPress}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.loginButtonText}>Login / Sign Up</Text>

            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Favourite count */}
          <View style={styles.countCard}>
            <View style={styles.countIcon}>
              <MaterialCommunityIcons
                name="heart-multiple"
                size={23}
                color={colors.primary}
              />
            </View>

            <View style={styles.countTextContainer}>
              <Text style={styles.countTitle}>Saved recipes</Text>
              <Text style={styles.countSubtitle}>
                Recipes you want to cook again
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countNumber}>{favouriteCount}</Text>
            </View>
          </View>

          {/* Recipes */}
          {favouriteCount === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                title="No favourites yet"
                message="Tap the heart on a recipe to save it here."
                icon="heart-outline"
              />
            </View>
          ) : (
            <View style={styles.recipeSection}>
              <Text style={styles.sectionTitle}>Your saved recipes</Text>

              <View style={styles.recipeList}>{renderFavouriteRecipes()}</View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (theme: FavouritesTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 30,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },

    headerText: {
      flex: 1,
      marginRight: 12,
    },

    title: {
      ...typography.screenTitle,
      fontSize: 24,
      color: colors.text,
    },

    subtitle: {
      ...typography.body,
      fontSize: 13,
      color: colors.secondaryText,
      marginTop: 5,
    },

    heartIcon: {
      width: 56,
      height: 56,
      borderRadius: 19,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    loginCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      marginTop: 18,
    },

    loginIcon: {
      width: 88,
      height: 88,
      borderRadius: 28,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },

    loginTitle: {
      ...typography.sectionTitle,
      color: colors.text,
      textAlign: "center",
      fontSize: 20,
    },

    loginMessage: {
      ...typography.body,
      color: colors.secondaryText,
      fontSize: 14,
      textAlign: "center",
      marginTop: 10,
      marginBottom: 22,
    },

    loginButton: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 15,
      paddingVertical: 14,
      gap: 8,
    },

    loginButtonText: {
      ...typography.button,
      color: colors.white,
      fontSize: 14,
    },

    countCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 14,
      marginBottom: 25,
    },

    countIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    countTextContainer: {
      flex: 1,
    },

    countTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },

    countSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 4,
    },

    countBadge: {
      minWidth: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },

    countNumber: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.primaryDark,
    },

    recipeSection: {
      marginTop: 2,
    },

    sectionTitle: {
      ...typography.sectionTitle,
      color: colors.text,
      fontSize: 19,
      marginBottom: 14,
    },

    recipeList: {
      width: "100%",
    },

    emptyContainer: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 22,
      marginTop: 8,
    },
  });
