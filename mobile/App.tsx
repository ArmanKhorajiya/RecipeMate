import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Pressable,
} from "react-native";

import SettingsScreen, {
  type RecipeMateSettings,
} from "./screens/SettingsScreen";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as SecureStore from "expo-secure-store";

import AuthScreen from "./components/AuthScreen";

import MealPlannerScreen from "./components/MealPlannerScreen";

import CookingModeScreen from "./components/CookingModeScreen";

import { API_BASE_URL } from "./constants/api";

import AppHeader from "./components/AppHeader";

import BottomNavigation, {
  type BottomTab,
} from "./components/BottomNavigation";

type Recipe = {
  _id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  category: string;
  cookingTime: number;
  image?: string;
};
type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};
type TabName =
  | "Home"
  | "Search"
  | "Favourites"
  | "Meal Planner"
  | "Profile"
  | "Settings";
const FAVOURITES_KEY = "recipemate_favourites";
export default function App() {
  const [appSettings, setAppSettings] = useState<RecipeMateSettings>({
    darkMode: false,
    dietaryPreference: "All",
  });
  const theme = {
    background: appSettings.darkMode ? "#101614" : "#F4F7F2",
    surface: appSettings.darkMode ? "#1B2420" : "#FFFFFF",
    surfaceRaised: appSettings.darkMode ? "#202D26" : "#FFFFFF",
    text: appSettings.darkMode ? "#F1F5F2" : "#222222",
    secondaryText: appSettings.darkMode ? "#AAB8AE" : "#666666",
    border: appSettings.darkMode ? "#303D35" : "#D5DDD2",
    accent: appSettings.darkMode ? "#65B86E" : "#2E7D32",
    activeTab: appSettings.darkMode ? "#26372B" : "#E5F2E3",
  };
  useEffect(() => {
    const loadAppSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem("recipemate_settings");
        if (savedSettings) {
          setAppSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Failed to load app settings:", error);
      }
    };
    loadAppSettings();
  }, []);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cookingModeVisible, setCookingModeVisible] = useState(false);
  const [cookingStepIndex, setCookingStepIndex] = useState(0);
  const [mealPlanModalVisible, setMealPlanModalVisible] = useState(false);
  const [plannerDay, setPlannerDay] = useState("Monday");
  const [plannerMeal, setPlannerMeal] = useState<
    "Breakfast" | "Lunch" | "Dinner"
  >("Breakfast");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>("Home");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsReturnToProfile, setSettingsReturnToProfile] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(
    null,
  );
  // Load recipes from backend.
  const fetchRecipes = async (ingredients = "") => {
    try {
      setLoading(true);
      setError("");
      const trimmedIngredients = ingredients.trim();
      const url = trimmedIngredients
        ? `${API_BASE_URL}/api/recipes/search?ingredients=${encodeURIComponent(
            trimmedIngredients,
          )}`
        : `${API_BASE_URL}/api/recipes`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }
      const data: Recipe[] = await response.json();

      console.log(
        "Recipe API data:",
        JSON.stringify(
          data.map((recipe) => ({
            name: recipe.name,
            image: recipe.image,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
          })),
          null,
          2,
        ),
      );

      setRecipes(data);
    } catch (err) {
      setError(
        "Unable to connect to RecipeMate server. Check your network and backend.",
      );
    } finally {
      setLoading(false);
    }
  };
  // Load all recipes when the app starts.
  useEffect(() => {
    fetchRecipes();
  }, []);
  // Search automatically when the Search tab is active.
  useEffect(() => {
    if (activeTab !== "Search") return;
    const timer = setTimeout(() => {
      fetchRecipes(ingredientsInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [ingredientsInput, activeTab]);
  // Restore login session.
  useEffect(() => {
    const restoreLogin = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("recipemate_token");
        if (!savedToken) return;
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        if (!response.ok) {
          await SecureStore.deleteItemAsync("recipemate_token");
          return;
        }
        const data = await response.json();
        setAuthToken(savedToken);
        setAuthUser(data.user);
      } catch (err) {
        console.log("Could not restore login:", err);
      }
    };
    restoreLogin();
  }, []);
  // Load locally saved favourites.
  useEffect(() => {
    const loadFavourites = async () => {
      try {
        const saved = await AsyncStorage.getItem(FAVOURITES_KEY);
        if (saved) {
          setFavoriteIds(JSON.parse(saved));
        }
      } catch (err) {
        console.log("Could not load favourites:", err);
      } finally {
        setFavoritesLoaded(true);
      }
    };
    loadFavourites();
  }, []);
  // Save favourites whenever they change.
  useEffect(() => {
    if (!favoritesLoaded) return;
    AsyncStorage.setItem(FAVOURITES_KEY, JSON.stringify(favoriteIds)).catch(
      (err) => {
        console.log("Could not save favourites:", err);
      },
    );
  }, [favoriteIds, favoritesLoaded]);
  const handleAuthenticated = (token: string, user: AuthUser) => {
    setAuthToken(token);
    setAuthUser(user);
    setAuthModalVisible(false);
    // Save the favourite that triggered the login prompt.
    if (pendingFavoriteId) {
      setFavoriteIds((current) =>
        current.includes(pendingFavoriteId)
          ? current
          : [...current, pendingFavoriteId],
      );
      setPendingFavoriteId(null);
    }
  };
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("recipemate_token");
      setAuthToken(null);
      setAuthUser(null);
      setActiveTab("Home");
      setSettingsVisible(false);
      Alert.alert("Logged out", "You are now using RecipeMate as a guest.");
    } catch (err) {
      Alert.alert("Error", "Unable to log out. Please try again.");
    }
  };
  const handleFavouritePress = (recipe: Recipe) => {
    if (!authToken || !authUser) {
      setPendingFavoriteId(recipe._id);
      setAuthModalVisible(true);
      return;
    }
    setFavoriteIds((current) => {
      if (current.includes(recipe._id)) {
        return current.filter((id) => id !== recipe._id);
      }
      return [...current, recipe._id];
    });
  };
  const saveSelectedRecipeToMealPlan = async () => {
    if (!selectedRecipe) return;

    try {
      const storageKey = "recipemate_meal_plan";
      const savedPlan = await AsyncStorage.getItem(storageKey);
      const plannedMeals = savedPlan ? JSON.parse(savedPlan) : [];

      const alreadyPlanned = plannedMeals.some(
        (item: any) =>
          item.recipeId === selectedRecipe._id &&
          item.day === plannerDay &&
          item.meal === plannerMeal,
      );

      if (alreadyPlanned) {
        Alert.alert(
          "Already planned",
          "This recipe is already planned for this meal.",
        );
        return;
      }

      const newMeal = {
        id: `${selectedRecipe._id}-${plannerDay}-${plannerMeal}`,
        recipeId: selectedRecipe._id,
        recipeName: selectedRecipe.name,
        day: plannerDay,
        meal: plannerMeal,
      };

      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify([...plannedMeals, newMeal]),
      );

      setMealPlanModalVisible(false);
      setSelectedRecipe(null);
      setActiveTab("Meal Planner");

      Alert.alert(
        "Added to Meal Planner",
        `${selectedRecipe.name} added for ${plannerDay} • ${plannerMeal}.`,
      );
    } catch (error) {
      console.error("Could not add recipe to meal plan:", error);
      Alert.alert("Error", "Could not add this recipe to your meal plan.");
    }
  };
  const renderRecipeCard = (recipe: Recipe) => {
    const isFavorite = favoriteIds.includes(recipe._id);

    return (
      <View
        key={recipe._id}
        style={[
          styles.recipeCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            padding: 10,
          },
        ]}
      >
        <View style={{ position: "relative" }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              console.log("Selected recipe:", recipe);
              setSelectedRecipe(recipe);
            }}
          >
            {recipe.image ? (
              <Image
                source={{ uri: recipe.image }}
                style={{
                  width: "100%",
                  height: 120,
                  borderRadius: 10,
                  backgroundColor: theme.border,
                }}
                resizeMode="cover"
                onLoad={() => {
                  console.log("Recipe image loaded:", recipe.name);
                }}
                onError={(event) => {
                  console.log(
                    "Recipe image failed:",
                    recipe.name,
                    recipe.image,
                    event.nativeEvent.error,
                  );
                }}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: 120,
                  borderRadius: 10,
                  backgroundColor: theme.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 36 }}>🍲</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: theme.surface,
              borderRadius: 20,
              width: 34,
              height: 34,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => handleFavouritePress(recipe)}
          >
            <Text
              style={{
                fontSize: 22,
                color: isFavorite ? "#E53935" : theme.text,
              }}
            >
              {isFavorite ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.recipeName,
            {
              color: theme.text,
              marginTop: 8,
              fontSize: 15,
            },
          ]}
          numberOfLines={2}
        >
          {recipe.name}
        </Text>

        <Text
          style={[
            styles.category,
            {
              color: theme.secondaryText,
              fontSize: 12,
              marginTop: 4,
            },
          ]}
          numberOfLines={1}
        >
          {recipe.category} • {recipe.cookingTime} min
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: theme.accent,
            paddingVertical: 9,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 10,
          }}
          onPress={() => setSelectedRecipe(recipe)}
        >
          <Text style={styles.primaryButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const renderRecipeList = (list: Recipe[]) => {
    return (
      <FlatList
        data={list}
        keyExtractor={(recipe) => recipe._id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>{renderRecipeCard(item)}</View>
        )}
        ListEmptyComponent={
          <Text style={{ color: theme.secondaryText, textAlign: "center" }}>
            No recipes found.
          </Text>
        }
      />
    );
  };
  const favouriteRecipes = recipes.filter((recipe) =>
    favoriteIds.includes(recipe._id),
  );
  const renderProfile = () => {
    if (!authUser) {
      return (
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.profileTitle, { color: theme.accent }]}>
            Your Profile 👤
          </Text>
          <Text style={[styles.profileText, { color: theme.secondaryText }]}>
            Log in to access your profile and save your favourite recipes.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}
            onPress={() => setAuthModalVisible(true)}
          >
            <Text style={styles.primaryButtonText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View
        style={[
          styles.profileCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.profileTitle, { color: theme.accent }]}>
          Your Profile 👤
        </Text>
        <View style={[styles.avatar, { backgroundColor: theme.activeTab }]}>
          <Text style={[styles.avatarText, { color: theme.accent }]}>
            {authUser.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.profileName, { color: theme.text }]}>
          {authUser.name}
        </Text>
        <Text style={[styles.profileText, { color: theme.secondaryText }]}>
          {authUser.email}
        </Text>
        <Text style={[styles.roleText, { color: theme.accent }]}>
          Account: {authUser.role}
        </Text>
        {authUser.role === "admin" && (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { backgroundColor: theme.activeTab },
            ]}
            onPress={() =>
              Alert.alert(
                "Admin Dashboard",
                "We will connect the admin dashboard next.",
              )
            }
          >
            <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
              Admin Dashboard
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: theme.activeTab }]}
          onPress={() => {
            setSettingsReturnToProfile(true);
            setSettingsVisible(false);
            setActiveTab("Settings");
          }}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
            ⚙️ Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const renderSettings = () => (
    <View
      style={[
        styles.profileCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <TouchableOpacity
        onPress={() => setSettingsVisible(false)}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>← Back to Profile</Text>
      </TouchableOpacity>

      <Text style={styles.profileTitle}>Settings ⚙️</Text>
      <View style={styles.settingsItem}>
        <Text style={styles.settingsTitle}>Notifications</Text>
        <Text style={styles.settingsDescription}>
          Cooking reminders and recipe updates
        </Text>
      </View>
      <View style={styles.settingsItem}>
        <Text style={styles.settingsTitle}>Cooking Preferences</Text>
        <Text style={styles.settingsDescription}>
          Cuisine and dietary preferences
        </Text>
      </View>
      <View style={styles.settingsItem}>
        <Text style={styles.settingsTitle}>Appearance</Text>
        <Text style={styles.settingsDescription}>
          Light mode is currently active
        </Text>
      </View>
      <View style={styles.settingsItem}>
        <Text style={styles.settingsTitle}>Help & About</Text>
        <Text style={styles.settingsDescription}>
          RecipeMate • Recipe discovery and meal planning
        </Text>
      </View>
    </View>
  );
  const renderCurrentScreen = () => {
    if (activeTab === "Settings") {
      return (
        <SettingsScreen
          showBackToProfile={settingsReturnToProfile}
          onBack={() => {
            setActiveTab(settingsReturnToProfile ? "Profile" : "Home");
          }}
          onSettingsChange={setAppSettings}
          onClearLocalData={() => {
            setFavoriteIds([]);
          }}
        />
      );
    }
    if (activeTab === "Meal Planner") {
      return (
        <MealPlannerScreen recipes={recipes} darkMode={appSettings.darkMode} />
      );
    }
    if (activeTab === "Profile") {
      return settingsVisible ? renderSettings() : renderProfile();
    }
    if (activeTab === "Favourites") {
      if (!authUser) {
        return (
          <View
            style={[
              styles.profileCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.profileTitle, { color: theme.accent }]}>
              Your Favourites ❤️
            </Text>
            <Text style={[styles.profileText, { color: theme.secondaryText }]}>
              Log in to save and view your favourite recipes.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.accent }]}
              onPress={() => setAuthModalVisible(true)}
            >
              <Text style={styles.primaryButtonText}>Login / Sign Up</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <ScrollView
          style={styles.recipeList}
          contentContainerStyle={styles.recipeListContent}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Your Favourites ({favouriteRecipes.length})
          </Text>
          {renderRecipeList(favouriteRecipes)}
        </ScrollView>
      );
    }
    return (
      <>
        {activeTab === "Search" && (
          <>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Search ingredients: tomato, onion..."
              placeholderTextColor={theme.secondaryText}
              selectionColor={theme.accent}
              value={ingredientsInput}
              onChangeText={setIngredientsInput}
              autoCapitalize="none"
            />
            <Text style={[styles.hint, { color: theme.secondaryText }]}>
              Results update automatically as you type.
            </Text>
          </>
        )}
        <ScrollView
          style={styles.recipeList}
          contentContainerStyle={styles.recipeListContent}
        >
          {activeTab === "Home" && (
            <View style={styles.homeGreeting}>
              <Text style={[styles.greetingTitle, { color: theme.accent }]}>
                {authUser
                  ? `Welcome back, ${authUser.name.split(" ")[0]}! 👋`
                  : "Welcome to RecipeMate! 👋"}
              </Text>
              <Text
                style={[
                  styles.greetingSubtitle,
                  { color: theme.secondaryText },
                ]}
              >
                What would you like to cook today?
              </Text>
            </View>
          )}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {activeTab === "Search"
              ? `Search Results (${recipes.length})`
              : `Explore Recipes (${recipes.length})`}
          </Text>
          {renderRecipeList(recipes)}
        </ScrollView>
      </>
    );
  };
  const tabs: {
    name: TabName;
    icon: string;
  }[] = [
    { name: "Home", icon: "⌂" },
    { name: "Search", icon: "⌕" },
    { name: "Favourites", icon: "♡" },
    { name: "Meal Planner", icon: "▦" },
    { name: "Settings", icon: "⚙" },
  ];

  if (cookingModeVisible && selectedRecipe) {
    return (
      <CookingModeScreen
        recipe={selectedRecipe}
        theme={theme}
        activeTab={activeTab}
        onExit={() => {
          setCookingModeVisible(false);
          setCookingStepIndex(0);
        }}
        onNavigate={(tab) => {
          setCookingModeVisible(false);
          setCookingStepIndex(0);
          setSelectedRecipe(null);
          setActiveTab(tab);
        }}
        onProfilePress={() => {
          setCookingModeVisible(false);
          setCookingStepIndex(0);
          setSelectedRecipe(null);
          setActiveTab("Profile");
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <StatusBar
        barStyle={appSettings.darkMode ? "light-content" : "dark-content"}
      />
      <AppHeader
        theme={theme}
        onHomePress={() => {
          setActiveTab("Home");
          setSettingsVisible(false);
        }}
        onProfilePress={() => {
          setActiveTab("Profile");
          setSettingsVisible(false);
        }}
      />
      <View
        style={[
          styles.screen,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        {renderCurrentScreen()}
      </View>
      <BottomNavigation
        theme={theme}
        activeTab={activeTab}
        onNavigate={(tab: BottomTab) => {
          if (tab === "Settings") {
            setSettingsReturnToProfile(false);
          }

          setActiveTab(tab);
          setSettingsVisible(false);
          setSettingsReturnToProfile(false);
        }}
      />

      <Modal
        visible={selectedRecipe !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedRecipe(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.65)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          {/* Backdrop: tap outside to close */}
          <Pressable
            onPress={() => setSelectedRecipe(null)}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />

          {/* Recipe card with bounded height */}
          <View
            style={{
              width: "100%",
              height: "85%",
              backgroundColor: theme.surface,
              borderRadius: 20,
              padding: 20,
            }}
          >
            {/* Close button */}
            <TouchableOpacity
              onPress={() => setSelectedRecipe(null)}
              style={{
                alignSelf: "flex-end",
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
              accessibilityLabel="Close recipe details"
            >
              <Text
                style={{
                  fontSize: 30,
                  color: theme.text,
                  lineHeight: 34,
                }}
              >
                ×
              </Text>
            </TouchableOpacity>

            {/* This area is now bounded and scrollable */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              {selectedRecipe && (
                <>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 24,
                      fontWeight: "bold",
                      marginBottom: 12,
                    }}
                  >
                    {selectedRecipe.name}
                  </Text>

                  {selectedRecipe.image ? (
                    <Image
                      source={{ uri: selectedRecipe.image }}
                      style={{
                        width: "100%",
                        height: 180,
                        borderRadius: 12,
                        marginBottom: 16,
                      }}
                      resizeMode="cover"
                    />
                  ) : null}

                  <Text
                    style={{
                      color: theme.secondaryText,
                      fontSize: 14,
                      marginBottom: 18,
                    }}
                  >
                    {selectedRecipe.category} • {selectedRecipe.cookingTime} min
                  </Text>

                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 20,
                      fontWeight: "bold",
                      marginBottom: 10,
                    }}
                  >
                    Ingredients
                  </Text>

                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <Text
                      key={`${index}-${ingredient}`}
                      style={{
                        color: theme.text,
                        fontSize: 16,
                        marginBottom: 8,
                      }}
                    >
                      • {ingredient}
                    </Text>
                  ))}

                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 20,
                      fontWeight: "bold",
                      marginTop: 20,
                      marginBottom: 10,
                    }}
                  >
                    Instructions
                  </Text>

                  {selectedRecipe.instructions.map((instruction, index) => (
                    <Text
                      key={`${index}-${instruction}`}
                      style={{
                        color: theme.text,
                        fontSize: 16,
                        lineHeight: 24,
                        marginBottom: 10,
                      }}
                    >
                      {index + 1}. {instruction}
                    </Text>
                  ))}
                </>
              )}
            </ScrollView>

            {/* Buttons stay outside the scroll area */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                if (!selectedRecipe) return;
                setCookingStepIndex(0);
                setCookingModeVisible(true);
              }}
            >
              <Text style={styles.primaryButtonText}>Start Cooking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                if (!selectedRecipe) return;
                setMealPlanModalVisible(true);
              }}
            >
              <Text style={styles.primaryButtonText}>Add to Meal Planner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={mealPlanModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMealPlanModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: theme.text,
                marginBottom: 16,
              }}
            >
              Add to Meal Planner
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 10,
              }}
            >
              Select Day
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setPlannerDay(day)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: plannerDay === day ? "#4CAF50" : "#e5e5e5",
                  }}
                >
                  <Text
                    style={{
                      color: plannerDay === day ? "#fff" : "#000",
                      fontWeight: plannerDay === day ? "bold" : "normal",
                    }}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 10,
              }}
            >
              Select Meal
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {(["Breakfast", "Lunch", "Dinner"] as const).map((meal) => (
                <TouchableOpacity
                  key={meal}
                  onPress={() => setPlannerMeal(meal)}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor:
                      plannerMeal === meal ? "#4CAF50" : "#e5e5e5",
                  }}
                >
                  <Text
                    style={{
                      color: plannerMeal === meal ? "#fff" : "#000",
                      fontWeight: plannerMeal === meal ? "bold" : "normal",
                    }}
                  >
                    {meal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={saveSelectedRecipeToMealPlan}
            >
              <Text style={styles.primaryButtonText}>Confirm and Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMealPlanModalVisible(false)}
              style={{ marginTop: 14, alignItems: "center" }}
            >
              <Text style={{ color: theme.secondaryText }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={cookingModeVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCookingModeVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 18,
              padding: 24,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: theme.secondaryText,
                marginBottom: 8,
              }}
            >
              GUIDED COOKING
            </Text>

            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              {selectedRecipe?.name}
            </Text>

            <Text
              style={{
                color: theme.accent,
                fontWeight: "600",
                marginBottom: 20,
              }}
            >
              Step {cookingStepIndex + 1} of{" "}
              {selectedRecipe?.instructions.length ?? 0}
            </Text>

            <View
              style={{
                height: 7,
                backgroundColor: theme.border,
                borderRadius: 10,
                marginBottom: 24,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${
                    ((cookingStepIndex + 1) /
                      (selectedRecipe?.instructions.length || 1)) *
                    100
                  }%`,
                  backgroundColor: theme.accent,
                  borderRadius: 10,
                }}
              />
            </View>

            <Text
              style={{
                fontSize: 19,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 30,
                lineHeight: 28,
              }}
            >
              {selectedRecipe?.instructions[cookingStepIndex] ??
                "No cooking instructions available."}
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                disabled={cookingStepIndex === 0}
                onPress={() => setCookingStepIndex((prev) => prev - 1)}
                style={{
                  flex: 1,
                  padding: 13,
                  borderRadius: 10,
                  backgroundColor: theme.border,
                  alignItems: "center",
                  opacity: cookingStepIndex === 0 ? 0.4 : 1,
                }}
              >
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (
                    cookingStepIndex <
                    (selectedRecipe?.instructions.length ?? 0) - 1
                  ) {
                    setCookingStepIndex((prev) => prev + 1);
                  } else {
                    setCookingModeVisible(false);
                    setCookingStepIndex(0);
                    Alert.alert(
                      "Cooking Completed! 🎉",
                      "Your recipe is ready. Enjoy your meal!",
                    );
                  }
                }}
                style={{
                  flex: 1,
                  padding: 13,
                  borderRadius: 10,
                  backgroundColor: theme.accent,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {(selectedRecipe?.instructions.length ?? 0) > 0 &&
                  cookingStepIndex ===
                    (selectedRecipe?.instructions.length ?? 0) - 1
                    ? "Finish"
                    : "Next"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setCookingModeVisible(false)}
              style={{ alignItems: "center", marginTop: 20 }}
            >
              <Text style={{ color: theme.secondaryText }}>
                Exit Cooking Mode
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={authModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <AuthScreen
              onAuthenticated={handleAuthenticated}
              onClose={() => {
                setAuthModalVisible(false);
                setPendingFavoriteId(null);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F2",
    paddingTop: 55,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  topBarAction: {
    color: "#2E7D32",
    fontWeight: "bold",
    fontSize: 15,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginTop: 12,
  },
  hint: {
    color: "#777",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 15,
  },
  loader: {
    marginTop: 40,
  },
  recipeList: {
    flex: 1,
  },
  recipeListContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  recipeCard: {
    borderWidth: 1,
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeName: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  heartButton: {
    padding: 5,
    marginLeft: 8,
  },
  heart: {
    fontSize: 28,
    color: "#E53935",
  },
  category: {
    color: "#777",
    marginTop: 6,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  ingredients: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  instruction: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginTop: 25,
  },
  error: {
    color: "#C62828",
    textAlign: "center",
    fontSize: 15,
    marginTop: 20,
  },
  bottomNavigation: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingHorizontal: 5,
    paddingTop: 9,
    paddingBottom: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    marginHorizontal: 2,
    borderRadius: 14,
    minHeight: 62,
  },
  tabIcon: {
    fontSize: 30,
    lineHeight: 34,
    color: "#89958D",
    marginBottom: 3,
    textAlign: "center",
  },
  tabLabel: {
    fontSize: 11,
    color: "#AAB4AD",
    textAlign: "center",
  },
  selectedTabText: {
    color: "#2E7D32",
    fontWeight: "bold",
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    elevation: 3,
  },
  profileTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
  },
  profileText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 15,
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#E5F2E3",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  profileName: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  roleText: {
    textAlign: "center",
    color: "#2E7D32",
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#E5F2E3",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#2E7D32",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FCE8E6",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#C62828",
    fontWeight: "bold",
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  settingsItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  settingsDescription: {
    color: "#777",
    fontSize: 12,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    padding: 15,
  },
  modalContent: {
    height: "85%",
    backgroundColor: "#F4F7F2",
    borderRadius: 20,
    overflow: "hidden",
  },
  profileIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E5F2E3",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    fontSize: 22,
  },
  homeGreeting: {
    marginBottom: 18,
    paddingVertical: 8,
  },
  greetingTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 6,
  },
  greetingSubtitle: {
    fontSize: 15,
    color: "#666666",
  },
});
