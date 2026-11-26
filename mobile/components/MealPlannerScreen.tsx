import React, { useEffect, useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  scheduleWeeklyMealReminder,
  cancelMealReminder,
} from "../services/notificationService";

type Recipe = {
  _id: string;
  name: string;
  category: string;
  cookingTime: number;
};

type MealType = "Breakfast" | "Lunch" | "Dinner";

type PlannedMeal = {
  id: string;
  recipeId: string;
  recipeName: string;
  day: string;
  meal: MealType;
  reminderHour?: number;
  reminderMinute?: number;
  notificationId?: string;
};

type MealPlannerScreenProps = {
  recipes: Recipe[];
  darkMode: boolean;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEALS: MealType[] = ["Breakfast", "Lunch", "Dinner"];

const STORAGE_KEY = "recipemate_meal_plan";

// Expo weekday: Sunday = 1, Monday = 2, ..., Saturday = 7.
const getExpoWeekday = (day: string) => {
  const jsDay = DAYS.indexOf(day);
  return jsDay === 6 ? 1 : jsDay + 2;
};

const getDefaultTime = (meal: MealType) => {
  const date = new Date();

  if (meal === "Breakfast") {
    date.setHours(8, 0, 0, 0);
  } else if (meal === "Lunch") {
    date.setHours(13, 0, 0, 0);
  } else {
    date.setHours(20, 0, 0, 0);
  }

  return date;
};

const formatTime = (hour: number, minute: number) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MealPlannerScreen({
  recipes,
  darkMode,
}: MealPlannerScreenProps) {
  const colors = {
    background: darkMode ? "#101614" : "#F4F7F2",
    surface: darkMode ? "#1B2420" : "#FFFFFF",
    plannedSurface: darkMode ? "#26372B" : "#E5F2E3",
    text: darkMode ? "#F1F5F2" : "#333333",
    secondaryText: darkMode ? "#AAB8AE" : "#666666",
    border: darkMode ? "#303D35" : "#D5DDD2",
    primary: darkMode ? "#65B86E" : "#2E7D32",
    selectedText: "#FFFFFF",
    danger: darkMode ? "#FF7777" : "#C62828",
  };

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedMeal, setSelectedMeal] = useState<MealType>("Breakfast");

  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  // Load saved meal plan.
  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        const savedPlan = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedPlan) {
          setPlannedMeals(JSON.parse(savedPlan));
        }
      } catch (error) {
        console.log("Could not load meal plan:", error);
      } finally {
        setLoaded(true);
      }
    };

    loadMealPlan();
  }, []);

  // Save meal plan whenever it changes.
  useEffect(() => {
    if (!loaded) return;

    const saveMealPlan = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plannedMeals));
      } catch (error) {
        console.log("Could not save meal plan:", error);
      }
    };

    saveMealPlan();
  }, [plannedMeals, loaded]);

  // Add a recipe to the selected day and meal.
  const addMeal = (recipe: Recipe) => {
    const alreadyPlanned = plannedMeals.some(
      (item) =>
        item.recipeId === recipe._id &&
        item.day === selectedDay &&
        item.meal === selectedMeal,
    );

    if (alreadyPlanned) {
      Alert.alert(
        "Already planned",
        "This recipe is already planned for this meal.",
      );
      return;
    }

    const newMeal: PlannedMeal = {
      id: `${recipe._id}-${selectedDay}-${selectedMeal}`,
      recipeId: recipe._id,
      recipeName: recipe.name,
      day: selectedDay,
      meal: selectedMeal,
    };

    setPlannedMeals((current) => [...current, newMeal]);
  };

  // Remove a meal and cancel its notification.
  const removeMeal = async (id: string) => {
    const mealToRemove = plannedMeals.find((item) => item.id === id);

    if (mealToRemove?.notificationId) {
      try {
        await cancelMealReminder(mealToRemove.notificationId);
      } catch (error) {
        console.log("Could not cancel reminder:", error);
      }
    }

    setPlannedMeals((current) => current.filter((item) => item.id !== id));
  };

  // Open the time picker for a planned meal.
  const openReminderPicker = (item: PlannedMeal) => {
    const date = new Date();

    date.setHours(
      item.reminderHour ?? getDefaultTime(item.meal).getHours(),
      item.reminderMinute ?? getDefaultTime(item.meal).getMinutes(),
      0,
      0,
    );

    setPickerDate(date);
    setActiveMealId(item.id);
    setShowTimePicker(true);
  };

  // Save the selected time and schedule a weekly notification.
  const handleTimeChange = async (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type !== "set" || !selectedDate || !activeMealId) {
      setShowTimePicker(false);
      setActiveMealId(null);
      return;
    }

    setShowTimePicker(false);

    const selectedMealItem = plannedMeals.find(
      (item) => item.id === activeMealId,
    );

    if (!selectedMealItem) {
      setActiveMealId(null);
      return;
    }

    try {
      // Cancel the old reminder before creating a new one.
      if (selectedMealItem.notificationId) {
        await cancelMealReminder(selectedMealItem.notificationId);
      }

      const notificationId = await scheduleWeeklyMealReminder(
        selectedMealItem.meal,
        selectedMealItem.recipeName,
        getExpoWeekday(selectedMealItem.day),
        selectedDate.getHours(),
        selectedDate.getMinutes(),
      );

      setPlannedMeals((current) =>
        current.map((item) =>
          item.id === activeMealId
            ? {
                ...item,
                reminderHour: selectedDate.getHours(),
                reminderMinute: selectedDate.getMinutes(),
                notificationId,
              }
            : item,
        ),
      );

      Alert.alert(
        "Reminder Set! 🔔",
        `Your ${selectedMealItem.meal} reminder is set for every ${selectedMealItem.day} at ${formatTime(
          selectedDate.getHours(),
          selectedDate.getMinutes(),
        )}.`,
      );
    } catch (error) {
      console.log("Reminder error:", error);

      Alert.alert(
        "Reminder Failed",
        error instanceof Error
          ? error.message
          : "Could not schedule the reminder.",
      );
    } finally {
      setActiveMealId(null);
    }
  };

  const selectedDayMeals = plannedMeals.filter(
    (item) => item.day === selectedDay && item.meal === selectedMeal,
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>
        Meal Planner 🍽️
      </Text>

      <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
        Plan what you want to cook
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Choose Day
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalList}
      >
        {DAYS.map((day) => {
          const selected = selectedDay === day;

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: selected ? colors.selectedText : colors.text,
                  },
                ]}
              >
                {day.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Choose Meal
      </Text>

      <View style={styles.mealRow}>
        {MEALS.map((meal) => {
          const selected = selectedMeal === meal;

          return (
            <TouchableOpacity
              key={meal}
              style={[
                styles.mealButton,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedMeal(meal)}
            >
              <Text
                style={[
                  styles.mealText,
                  {
                    color: selected ? colors.selectedText : colors.text,
                  },
                ]}
              >
                {meal}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Planned {selectedMeal}
      </Text>

      {selectedDayMeals.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          No recipe planned for {selectedDay}.
        </Text>
      ) : (
        selectedDayMeals.map((item) => (
          <View
            key={item.id}
            style={[
              styles.plannedCard,
              { backgroundColor: colors.plannedSurface },
            ]}
          >
            <View style={styles.plannedInfo}>
              <Text style={[styles.recipeName, { color: colors.primary }]}>
                {item.recipeName}
              </Text>

              {item.notificationId ? (
                <Text
                  style={[styles.reminderText, { color: colors.secondaryText }]}
                >
                  🔔 Every {item.day} •{" "}
                  {formatTime(item.reminderHour!, item.reminderMinute!)}
                </Text>
              ) : (
                <Text
                  style={[styles.reminderText, { color: colors.secondaryText }]}
                >
                  No reminder set
                </Text>
              )}

              <TouchableOpacity onPress={() => openReminderPicker(item)}>
                <Text
                  style={[styles.reminderButtonText, { color: colors.primary }]}
                >
                  {item.notificationId ? "Change Reminder" : "🔔 Set Reminder"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => removeMeal(item.id)}>
              <Text style={[styles.removeText, { color: colors.danger }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {showTimePicker && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Add a Recipe
      </Text>

      <ScrollView
        style={styles.recipeList}
        contentContainerStyle={styles.recipeListContent}
      >
        {recipes.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No recipes available. Add recipes to RecipeMate first.
          </Text>
        ) : (
          recipes.map((recipe) => (
            <View
              key={recipe._id}
              style={[
                styles.recipeCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.recipeInfo}>
                <Text style={[styles.recipeName, { color: colors.primary }]}>
                  {recipe.name}
                </Text>

                <Text
                  style={[
                    styles.recipeDetails,
                    { color: colors.secondaryText },
                  ]}
                >
                  {recipe.category} • {recipe.cookingTime} min
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => addMeal(recipe)}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },

  horizontalList: {
    flexGrow: 0,
  },

  dayButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
  },

  dayText: {
    fontWeight: "600",
  },

  mealRow: {
    flexDirection: "row",
    gap: 8,
  },

  mealButton: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
  },

  mealText: {
    fontWeight: "600",
    fontSize: 12,
  },

  plannedCard: {
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  plannedInfo: {
    flex: 1,
  },

  recipeName: {
    fontSize: 15,
    fontWeight: "bold",
  },

  reminderText: {
    fontSize: 12,
    marginTop: 5,
  },

  reminderButtonText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 7,
  },

  removeText: {
    fontWeight: "600",
    marginLeft: 10,
  },

  emptyText: {
    fontSize: 13,
    marginVertical: 8,
  },

  recipeList: {
    flex: 1,
  },

  recipeListContent: {
    paddingBottom: 20,
  },

  recipeCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  recipeInfo: {
    flex: 1,
  },

  recipeDetails: {
    fontSize: 12,
    marginTop: 5,
  },

  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    marginLeft: 10,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
