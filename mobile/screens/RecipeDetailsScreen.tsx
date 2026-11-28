import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

export type RecipeDetailsRecipe = {
  _id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  category: string;
  cookingTime: number;
  image?: string;
};

type RecipeDetailsTheme = {
  background: string;
  surface: string;
  text: string;
  secondaryText: string;
  border: string;
  accent: string;
};

type Props = {
  visible: boolean;
  recipe: RecipeDetailsRecipe | null;
  theme: RecipeDetailsTheme;
  onClose: () => void;
  onStartCooking: () => void;
  onAddToMealPlanner: () => void;
};

export default function RecipeDetailsScreen({
  visible,
  recipe,
  theme,
  onClose,
  onStartCooking,
  onAddToMealPlanner,
}: Props) {
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);

  const styles = createStyles(theme);

  const toggleIngredient = (ingredient: string) => {
    setCheckedIngredients((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    );
  };

  const handleClose = () => {
    setCheckedIngredients([]);
    onClose();
  };

  if (!recipe) {
    return null;
  }

  const totalIngredients = recipe.ingredients.length;
  const checkedCount = checkedIngredients.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
          accessibilityLabel="Close recipe details"
        />

        <View style={styles.modalCard}>
          {/* Recipe image */}
          <View style={styles.imageContainer}>
            {recipe.image ? (
              <Image
                source={{ uri: recipe.image }}
                style={styles.recipeImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons
                  name="food"
                  size={58}
                  color={colors.primary}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
              accessibilityLabel="Close"
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>

            <View style={styles.imageBadge}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={15}
                color={colors.primaryDark}
              />
              <Text style={styles.imageBadgeText}>
                {recipe.cookingTime} min
              </Text>
            </View>
          </View>

          {/* Scrollable recipe information */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.recipeHeading}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{recipe.category}</Text>
              </View>

              <Text style={styles.recipeName}>{recipe.name}</Text>

              <Text style={styles.recipeSubtitle}>
                A delicious recipe to make at home
              </Text>
            </View>

            {/* Recipe facts */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name="clock-fast"
                    size={21}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.infoValue}>{recipe.cookingTime} min</Text>
                <Text style={styles.infoLabel}>Cooking time</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name="basket-outline"
                    size={21}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.infoValue}>{totalIngredients}</Text>
                <Text style={styles.infoLabel}>Ingredients</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name="chef-hat"
                    size={21}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.infoValue}>
                  {recipe.instructions.length}
                </Text>
                <Text style={styles.infoLabel}>Steps</Text>
              </View>
            </View>

            {/* Ingredients */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  <Text style={styles.sectionSubtitle}>
                    Tap an ingredient when you have it ready
                  </Text>
                </View>

                <Text style={styles.progressText}>
                  {checkedCount}/{totalIngredients}
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        totalIngredients > 0
                          ? `${(checkedCount / totalIngredients) * 100}%`
                          : "0%",
                    },
                  ]}
                />
              </View>

              <View style={styles.ingredientsCard}>
                {recipe.ingredients.map((ingredient, index) => {
                  const isChecked = checkedIngredients.includes(ingredient);

                  return (
                    <TouchableOpacity
                      key={`${index}-${ingredient}`}
                      style={[
                        styles.ingredientRow,
                        index !== recipe.ingredients.length - 1 &&
                          styles.ingredientBorder,
                      ]}
                      onPress={() => toggleIngredient(ingredient)}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isChecked && styles.checkboxChecked,
                        ]}
                      >
                        {isChecked && (
                          <MaterialCommunityIcons
                            name="check"
                            size={15}
                            color={colors.white}
                          />
                        )}
                      </View>

                      <Text
                        style={[
                          styles.ingredientText,
                          isChecked && styles.ingredientChecked,
                        ]}
                      >
                        {ingredient}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cooking Instructions</Text>

              <Text style={styles.sectionSubtitle}>
                Follow these steps to prepare your recipe
              </Text>

              {recipe.instructions.map((instruction, index) => (
                <View
                  key={`${index}-${instruction}`}
                  style={styles.instructionRow}
                >
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>

                  <View style={styles.instructionContent}>
                    <Text style={styles.stepTitle}>Step {index + 1}</Text>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Fixed action buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onAddToMealPlanner}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="calendar-plus"
                size={20}
                color={colors.primaryDark}
              />
              <Text style={styles.secondaryButtonText}>Meal Planner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onStartCooking}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="chef-hat"
                size={20}
                color={colors.white}
              />
              <Text style={styles.primaryButtonText}>Start Cooking</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: RecipeDetailsTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(25, 15, 8, 0.62)",
      justifyContent: "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFill,
    },

    modalCard: {
      height: "94%",
      backgroundColor: colors.background,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      overflow: "hidden",
    },

    imageContainer: {
      height: 230,
      position: "relative",
      backgroundColor: colors.surfaceSecondary,
    },

    recipeImage: {
      width: "100%",
      height: "100%",
    },

    imagePlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    closeButton: {
      position: "absolute",
      top: 18,
      right: 18,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.white,
      alignItems: "center",
      justifyContent: "center",
      elevation: 3,
    },

    imageBadge: {
      position: "absolute",
      bottom: 16,
      left: 18,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },

    imageBadgeText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primaryDark,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 22,
    },

    recipeHeading: {
      paddingTop: 20,
      paddingBottom: 18,
    },

    categoryBadge: {
      alignSelf: "flex-start",
      backgroundColor: colors.primaryLight,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 10,
    },

    categoryText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primaryDark,
    },

    recipeName: {
      ...typography.screenTitle,
      fontSize: 27,
      lineHeight: 34,
      color: colors.text,
    },

    recipeSubtitle: {
      ...typography.body,
      color: colors.secondaryText,
      fontSize: 13,
      marginTop: 7,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingVertical: 16,
      marginBottom: 26,
    },

    infoItem: {
      flex: 1,
      alignItems: "center",
    },

    infoIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 7,
    },

    infoValue: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.text,
    },

    infoLabel: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 3,
    },

    infoDivider: {
      width: 1,
      height: 48,
      backgroundColor: colors.border,
    },

    section: {
      marginBottom: 28,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },

    sectionTitle: {
      ...typography.sectionTitle,
      fontSize: 20,
      color: colors.text,
    },

    sectionSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 5,
      marginBottom: 14,
    },

    progressText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primaryDark,
    },

    progressTrack: {
      height: 6,
      backgroundColor: colors.primaryLight,
      borderRadius: 3,
      overflow: "hidden",
      marginBottom: 14,
    },

    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 3,
    },

    ingredientsCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingHorizontal: 15,
    },

    ingredientRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
    },

    ingredientBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },

    checkbox: {
      width: 23,
      height: 23,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    ingredientText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },

    ingredientChecked: {
      color: colors.mutedText,
      textDecorationLine: "line-through",
    },

    instructionRow: {
      flexDirection: "row",
      marginBottom: 18,
    },

    stepNumber: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
    },

    stepNumberText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.primaryDark,
    },

    instructionContent: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
    },

    stepTitle: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.primaryDark,
      marginBottom: 6,
    },

    instructionText: {
      ...typography.body,
      fontSize: 14,
      color: colors.text,
    },

    actionContainer: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 24,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    secondaryButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 15,
      backgroundColor: colors.surfaceSecondary,
    },

    secondaryButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primaryDark,
    },

    primaryButton: {
      flex: 1.2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 15,
    },

    primaryButtonText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.white,
    },
  });
