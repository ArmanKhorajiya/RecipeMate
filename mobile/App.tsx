import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
} from "react-native";
import HomeFeaturedCarousel from "./components/common/HomeFeaturedCarousel";
import SettingsScreen, {
  type RecipeMateSettings,
} from "./screens/SettingsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SearchScreen from "./screens/SearchScreen";
import HomeScreen from "./screens/HomeScreen";
import FavouritesScreen from "./screens/FavouritesScreen";
import RecipeDetailsScreen from "./screens/RecipeDetailsScreen";

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

  // Load app settings.
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

  const [mealPlanModalVisible, setMealPlanModalVisible] = useState(false);

  const [plannerDay, setPlannerDay] = useState("Monday");

  const [plannerMeal, setPlannerMeal] = useState<
    "Breakfast" | "Lunch" | "Dinner"
  >("Breakfast");

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const [authModalVisible, setAuthModalVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<TabName>("Home");

  const [settingsReturnToProfile, setSettingsReturnToProfile] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(
    null,
  );

  // Fetch recipes from backend.
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

      const data = await response.json();

      const recipeList = Array.isArray(data) ? data : data.recipes;

      if (!Array.isArray(recipeList)) {
        throw new Error("Invalid recipes response from server");
      }

      setRecipes(recipeList);

      console.log("Recipe categories:", [
        ...new Set(recipeList.map((recipe: Recipe) => recipe.category)),
      ]);
    } catch (err) {
      setError(
        "Unable to connect to RecipeMate server. Check your network and backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Load recipes when the app starts.
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Search when the Search tab is active.
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

  // Handle successful authentication.
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

  // Handle logout.
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("recipemate_token");

      setAuthToken(null);
      setAuthUser(null);
      setActiveTab("Home");
      setSettingsReturnToProfile(false);

      Alert.alert("Logged out", "You are now using RecipeMate as a guest.");
    } catch (err) {
      Alert.alert("Error", "Unable to log out. Please try again.");
    }
  };

  // Handle favourite button.
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

  // Add selected recipe to the meal planner.
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

  // Render one recipe card.
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

  // Render recipe list for Home, Search, and Favourites.
  const renderRecipeList = (list: Recipe[], scrollEnabled = false) => {
    return (
      <FlatList
        data={list}
        keyExtractor={(recipe) => recipe._id}
        numColumns={2}
        scrollEnabled={scrollEnabled}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>{renderRecipeCard(item)}</View>
        )}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.secondaryText,
              textAlign: "center",
            }}
          >
            No recipes found.
          </Text>
        }
      />
    );
  };

  const favouriteRecipes = recipes.filter((recipe) =>
    favoriteIds.includes(recipe._id),
  );

  // Render the currently selected screen.
  const renderCurrentScreen = () => {
    if (activeTab === "Settings") {
      return (
        <SettingsScreen
          showBackToProfile={settingsReturnToProfile}
          onBack={() => {
            setActiveTab(settingsReturnToProfile ? "Profile" : "Home");

            setSettingsReturnToProfile(false);
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
      return (
        <ProfileScreen
          authUser={authUser}
          theme={theme}
          onLoginPress={() => setAuthModalVisible(true)}
          onSettingsPress={() => {
            setSettingsReturnToProfile(true);
            setActiveTab("Settings");
          }}
          onLogoutPress={handleLogout}
          onFavoritesPress={() => {
            setActiveTab("Favourites");
          }}
          onPlannerPress={() => {
            setActiveTab("Meal Planner");
          }}
        />
      );
    }

    if (activeTab === "Favourites") {
      return (
        <FavouritesScreen
          theme={theme}
          isLoggedIn={Boolean(authToken && authUser)}
          favouriteCount={favouriteRecipes.length}
          onLoginPress={() => setAuthModalVisible(true)}
          renderFavouriteRecipes={() => renderRecipeList(favouriteRecipes)}
        />
      );
    }

    if (activeTab === "Search") {
      return (
        <SearchScreen
          theme={theme}
          ingredientsInput={ingredientsInput}
          onIngredientsChange={setIngredientsInput}
          recipes={recipes}
          renderRecipeList={renderRecipeList}
        />
      );
    }

    return (
      <HomeScreen
        theme={theme}
        userName={authUser?.name ?? "Guest"}
        recipes={recipes}
        onSearchPress={() => setActiveTab("Search")}
        renderRecipeList={renderRecipeList}
      />
    );
  };

  // Cooking mode is displayed as a full screen.
  if (cookingModeVisible && selectedRecipe) {
    return (
      <CookingModeScreen
        recipe={selectedRecipe}
        theme={theme}
        activeTab={activeTab}
        onExit={() => {
          setCookingModeVisible(false);
        }}
        onNavigate={(tab) => {
          setCookingModeVisible(false);
          setSelectedRecipe(null);
          setActiveTab(tab);
        }}
        onProfilePress={() => {
          setCookingModeVisible(false);
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
        userInitials={
          authUser
            ? authUser.name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join("")
            : null
        }
        title={
          activeTab === "Home"
            ? "RecipeMate"
            : activeTab === "Favourites"
              ? "Your Favourites"
              : activeTab === "Meal Planner"
                ? "Meal Planner"
                : activeTab === "Search"
                  ? "Find Recipes"
                  : activeTab === "Settings"
                    ? "Settings"
                    : "Your Profile"
        }
        subtitle={
          activeTab === "Home"
            ? "Discover your next favourite recipe"
            : activeTab === "Favourites"
              ? "Your saved recipes"
              : activeTab === "Meal Planner"
                ? "Plan your meals"
                : activeTab === "Search"
                  ? "Discover your next meal"
                  : activeTab === "Profile"
                    ? "Manage your account"
                    : "Customize RecipeMate"
        }
        onHomePress={() => {
          setActiveTab("Home");
        }}
        onProfilePress={() => {
          setActiveTab("Profile");
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
          setActiveTab(tab);
          setSettingsReturnToProfile(false);
        }}
      />

      {/* Recipe details modal */}
      <RecipeDetailsScreen
        visible={selectedRecipe !== null}
        recipe={selectedRecipe}
        theme={theme}
        onClose={() => setSelectedRecipe(null)}
        onStartCooking={() => {
          if (!selectedRecipe) return;

          setCookingModeVisible(true);
        }}
        onAddToMealPlanner={() => {
          if (!selectedRecipe) return;

          setMealPlanModalVisible(true);
        }}
      />

      {/* Add recipe to meal planner modal */}
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
              style={{
                marginTop: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.secondaryText }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Authentication modal */}
      <Modal
        visible={authModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.background,
              },
            ]}
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
    paddingTop: 55,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  recipeCard: {
    borderWidth: 1,
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 3,
  },
  recipeName: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
  },
  category: {
    marginTop: 6,
    marginBottom: 15,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    padding: 15,
  },
  modalContent: {
    height: "85%",
    borderRadius: 20,
    overflow: "hidden",
  },
});
