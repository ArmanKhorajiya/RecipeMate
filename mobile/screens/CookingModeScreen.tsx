import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
} from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNavigation from "../components/BottomNavigation";

type CookingRecipe = {
  _id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  category?: string;
  cookingTime: number;
  image?: string;
};

type AppTab =
  | "Home"
  | "Search"
  | "Favourites"
  | "Meal Planner"
  | "Settings"
  | "Profile";
type BottomTab = Exclude<AppTab, "Profile">;

type CookingTheme = {
  background: string;
  surface: string;
  surfaceRaised?: string;
  text: string;
  secondaryText: string;
  border: string;
  accent: string;
  activeTab: string;
};

type Props = {
  recipe: CookingRecipe;
  theme: CookingTheme;
  activeTab: AppTab;
  onExit: () => void;
  onNavigate: (tab: BottomTab) => void;
  onProfilePress: () => void;
};

export default function CookingModeScreen({
  recipe,
  theme,
  activeTab,
  onExit,
  onNavigate,
  onProfilePress,
}: Props) {
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const ingredients = recipe.ingredients ?? [];
  const instructions = recipe.instructions ?? [];
  const totalIngredients = ingredients.length;
  const totalSteps = instructions.length;
  const ingredientProgress =
    totalIngredients > 0
      ? (checkedIngredients.length / totalIngredients) * 100
      : 0;
  const stepProgress =
    totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index],
    );
  };

  const isLastStep = totalSteps > 0 && currentStep >= totalSteps - 1;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={
          theme.background === "#1F1A16" ? "light-content" : "dark-content"
        }
      />
      <AppHeader
        theme={theme}
        title="Cooking Mode"
        subtitle="Follow along, one step at a time"
        onHomePress={() => onNavigate("Home")}
        onProfilePress={onProfilePress}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          onPress={onExit}
          activeOpacity={0.75}
          style={styles.exitButton}
        >
          <Text style={[styles.exitText, { color: theme.accent }]}>
            ‹ Exit cooking mode
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.recipeHero,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {recipe.image ? (
            <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
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
          <View style={styles.recipeInfo}>
            <Text style={[styles.recipeName, { color: theme.text }]}>
              {recipe.name}
            </Text>
            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: theme.secondaryText }]}>
                {recipe.category || "Recipe"}
              </Text>
              <Text style={[styles.metaDot, { color: theme.accent }]}>•</Text>
              <Text style={[styles.metaText, { color: theme.secondaryText }]}>
                {recipe.cookingTime} min
              </Text>
            </View>
          </View>
          <View
            style={[styles.modeBadge, { backgroundColor: theme.activeTab }]}
          >
            <Text style={[styles.modeBadgeText, { color: theme.accent }]}>
              COOK ALONG
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your ingredients
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: theme.secondaryText }]}
            >
              Check each item as you prepare it
            </Text>
          </View>
          <Text style={[styles.progressCount, { color: theme.accent }]}>
            {checkedIngredients.length}/{totalIngredients}
          </Text>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${ingredientProgress}%`,
                backgroundColor: theme.accent,
              },
            ]}
          />
        </View>

        <View
          style={[
            styles.ingredientCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {totalIngredients === 0 ? (
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              No ingredients listed for this recipe.
            </Text>
          ) : (
            ingredients.map((ingredient, index) => {
              const checked = checkedIngredients.includes(index);
              return (
                <TouchableOpacity
                  key={`${index}-${ingredient}`}
                  activeOpacity={0.7}
                  onPress={() => toggleIngredient(index)}
                  style={[
                    styles.ingredientRow,
                    index !== ingredients.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: checked ? theme.accent : theme.border,
                        backgroundColor: checked ? theme.accent : "transparent",
                      },
                    ]}
                  >
                    {checked ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                  <Text
                    style={[
                      styles.ingredientText,
                      {
                        color: checked ? theme.secondaryText : theme.text,
                        textDecorationLine: checked ? "line-through" : "none",
                      },
                    ]}
                  >
                    {ingredient}
                  </Text>
                  <Text
                    style={[
                      styles.ingredientStatus,
                      { color: checked ? theme.accent : theme.secondaryText },
                    ]}
                  >
                    {checked ? "Ready" : ""}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {totalIngredients > 0 &&
        checkedIngredients.length === totalIngredients ? (
          <View
            style={[styles.readyBanner, { backgroundColor: theme.activeTab }]}
          >
            <Text style={[styles.readyBannerText, { color: theme.accent }]}>
              ✓ All ingredients are ready. Let's cook!
            </Text>
          </View>
        ) : null}

        <View style={styles.sectionHeading}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Cooking steps
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: theme.secondaryText }]}
            >
              Stay focused on the current step
            </Text>
          </View>
          <Text style={[styles.progressCount, { color: theme.accent }]}>
            {totalSteps > 0 ? `${currentStep + 1}/${totalSteps}` : "0/0"}
          </Text>
        </View>

        <View
          style={[
            styles.stepCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.stepTopRow}>
            <View
              style={[styles.stepNumber, { backgroundColor: theme.activeTab }]}
            >
              <Text style={[styles.stepNumberText, { color: theme.accent }]}>
                {totalSteps > 0
                  ? String(currentStep + 1).padStart(2, "0")
                  : "—"}
              </Text>
            </View>
            <Text style={[styles.stepLabel, { color: theme.secondaryText }]}>
              STEP BY STEP
            </Text>
          </View>

          <View
            style={[
              styles.progressTrack,
              styles.stepProgressTrack,
              { backgroundColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${stepProgress}%`, backgroundColor: theme.accent },
              ]}
            />
          </View>

          <Text style={[styles.instructionText, { color: theme.text }]}>
            {instructions[currentStep] || "No cooking instructions available."}
          </Text>

          <View style={styles.stepControls}>
            <TouchableOpacity
              disabled={currentStep === 0}
              onPress={() =>
                setCurrentStep((previous) => Math.max(0, previous - 1))
              }
              activeOpacity={0.75}
              style={[
                styles.previousButton,
                {
                  borderColor: theme.border,
                  opacity: currentStep === 0 ? 0.45 : 1,
                },
              ]}
            >
              <Text style={[styles.previousButtonText, { color: theme.text }]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={totalSteps === 0}
              onPress={() => {
                if (currentStep < totalSteps - 1) {
                  setCurrentStep((previous) => previous + 1);
                } else {
                  onExit();
                }
              }}
              activeOpacity={0.8}
              style={[
                styles.nextButton,
                {
                  backgroundColor: theme.accent,
                  opacity: totalSteps === 0 ? 0.5 : 1,
                },
              ]}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? "Finish cooking ✓" : "Next step  →"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation
        theme={theme}
        activeTab={activeTab}
        onNavigate={onNavigate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 28 },
  exitButton: { alignSelf: "flex-start", paddingVertical: 7, marginBottom: 12 },
  exitText: { fontSize: 14, fontWeight: "700" },
  recipeHero: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 26,
  },
  recipeImage: { width: "100%", height: 155 },
  imagePlaceholder: {
    height: 125,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderEmoji: { fontSize: 48 },
  recipeInfo: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  recipeName: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 7 },
  metaText: { fontSize: 13, fontWeight: "500" },
  metaDot: { marginHorizontal: 8, fontSize: 15 },
  modeBadge: {
    alignSelf: "flex-start",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modeBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800" },
  sectionSubtitle: { fontSize: 12, marginTop: 4 },
  progressCount: { fontSize: 14, fontWeight: "800" },
  progressTrack: {
    height: 7,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressFill: { height: "100%", borderRadius: 20 },
  ingredientCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkmark: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  ingredientText: { flex: 1, fontSize: 14, lineHeight: 20 },
  ingredientStatus: { fontSize: 11, fontWeight: "700", marginLeft: 8 },
  emptyText: { paddingVertical: 16, fontSize: 14 },
  readyBanner: {
    borderRadius: 12,
    padding: 13,
    marginTop: -8,
    marginBottom: 22,
  },
  readyBannerText: { textAlign: "center", fontSize: 13, fontWeight: "800" },
  stepCard: { borderWidth: 1, borderRadius: 22, padding: 18, marginBottom: 12 },
  stepTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  stepNumber: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: { fontSize: 16, fontWeight: "900" },
  stepLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  stepProgressTrack: { marginBottom: 20 },
  instructionText: {
    fontSize: 17,
    lineHeight: 28,
    fontWeight: "500",
    minHeight: 100,
    marginBottom: 24,
  },
  stepControls: { flexDirection: "row", gap: 10 },
  previousButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  previousButtonText: { fontSize: 14, fontWeight: "700" },
  nextButton: {
    flex: 1.4,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
