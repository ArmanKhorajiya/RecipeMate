import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";

import AppHeader from "./AppHeader";
import BottomNavigation from "./BottomNavigation";

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
  surfaceRaised: string;
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

const bottomTabs: {
  label: string;
  tab: BottomTab;
  icon: string;
}[] = [
  { label: "Home", tab: "Home", icon: "⌂" },
  { label: "Search", tab: "Search", icon: "⌕" },
  { label: "Favourites", tab: "Favourites", icon: "♡" },
  { label: "Planner", tab: "Meal Planner", icon: "▦" },
  { label: "Settings", tab: "Settings", icon: "⚙" },
];

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

  const totalIngredients = recipe.ingredients.length;
  const totalSteps = recipe.instructions.length;

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

  const handleNavigation = (tab: BottomTab) => {
    onNavigate(tab);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: StatusBar.currentHeight ?? 0,
      }}
    >
      {/* Header */}
      <AppHeader
        theme={theme}
        onHomePress={() => onNavigate("Home")}
        onProfilePress={onProfilePress}
      />

      {/* Cooking screen content */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
        }}
      >
        {/* Exit cooking mode */}
        <TouchableOpacity
          onPress={onExit}
          activeOpacity={0.7}
          style={{
            alignSelf: "flex-start",
            marginBottom: 14,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              color: theme.accent,
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            ← Exit Cooking Mode
          </Text>
        </TouchableOpacity>

        {/* Recipe information */}
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            {recipe.name}
          </Text>

          <Text style={{ color: theme.secondaryText }}>
            {recipe.category || "Recipe"} • {recipe.cookingTime} minutes
          </Text>
        </View>

        {/* Ingredients checklist */}
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 6,
            }}
          >
            Ingredients
          </Text>

          <Text
            style={{
              color: theme.secondaryText,
              marginBottom: 12,
            }}
          >
            Tap ingredients as you prepare them.
          </Text>

          {/* Ingredient progress */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "600" }}>
              {checkedIngredients.length} / {totalIngredients} ready
            </Text>

            <Text style={{ color: theme.secondaryText }}>
              {Math.round(ingredientProgress)}%
            </Text>
          </View>

          <View
            style={{
              height: 8,
              backgroundColor: theme.border,
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: `${ingredientProgress}%`,
                height: "100%",
                backgroundColor: theme.accent,
              }}
            />
          </View>

          {totalIngredients > 0 &&
            checkedIngredients.length === totalIngredients && (
              <View
                style={{
                  backgroundColor: theme.accent,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  ✓ All ingredients are ready!
                </Text>
              </View>
            )}

          {recipe.ingredients.map((ingredient, index) => {
            const checked = checkedIngredients.includes(index);

            return (
              <TouchableOpacity
                key={`${index}-${ingredient}`}
                activeOpacity={0.7}
                onPress={() => toggleIngredient(index)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 10,
                  backgroundColor: checked
                    ? theme.surfaceRaised
                    : "transparent",
                  borderWidth: 1,
                  borderColor: checked ? theme.accent : theme.border,
                }}
              >
                {/* Checkbox */}
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    borderWidth: 1.5,
                    borderColor: checked ? theme.accent : theme.secondaryText,
                    backgroundColor: checked ? theme.accent : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  {checked && (
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      ✓
                    </Text>
                  )}
                </View>

                {/* Ingredient name */}
                <Text
                  style={{
                    flex: 1,
                    color: checked ? theme.secondaryText : theme.text,
                    textDecorationLine: checked ? "line-through" : "none",
                    fontSize: 15,
                  }}
                >
                  {ingredient}
                </Text>

                {/* Ingredient status */}
                <Text
                  style={{
                    color: checked ? theme.accent : theme.secondaryText,
                    fontSize: 12,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  {checked ? "Ready" : "Needed"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Guided instructions */}
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            Let's Cook!
          </Text>

          <Text
            style={{
              color: theme.secondaryText,
              marginBottom: 14,
            }}
          >
            Step {totalSteps > 0 ? currentStep + 1 : 0} of {totalSteps}
          </Text>

          {/* Step progress */}
          <View
            style={{
              height: 8,
              backgroundColor: theme.border,
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: `${stepProgress}%`,
                height: "100%",
                backgroundColor: theme.accent,
              }}
            />
          </View>

          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              lineHeight: 28,
              marginBottom: 24,
            }}
          >
            {recipe.instructions[currentStep] || "No instructions available."}
          </Text>

          {/* Step navigation */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            <TouchableOpacity
              disabled={currentStep === 0}
              onPress={() => setCurrentStep((previous) => previous - 1)}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 10,
                backgroundColor: theme.border,
                alignItems: "center",
                opacity: currentStep === 0 ? 0.4 : 1,
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: "600",
                }}
              >
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
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 10,
                backgroundColor: theme.accent,
                alignItems: "center",
                opacity: totalSteps === 0 ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {currentStep === totalSteps - 1 ? "Finish" : "Next Step"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom navigation - stays on this full screen */}
      <BottomNavigation
        theme={theme}
        activeTab={activeTab}
        onNavigate={onNavigate}
      />
    </SafeAreaView>
  );
}
