import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type DietaryPreference = "All" | "Vegetarian" | "Vegan";

export type RecipeMateSettings = {
  darkMode: boolean;
  dietaryPreference: DietaryPreference;
};

type SettingsScreenProps = {
  onBack: () => void;
  onSettingsChange: (settings: RecipeMateSettings) => void;
  onClearLocalData: () => void;
  showBackToProfile?: boolean;
};

const SETTINGS_KEY = "recipemate_settings";

const defaultSettings: RecipeMateSettings = {
  darkMode: false,
  dietaryPreference: "All",
};

export default function SettingsScreen({
  onBack,
  onSettingsChange,
  onClearLocalData,
  showBackToProfile = false,
}: SettingsScreenProps) {
  const [settings, setSettings] = useState<RecipeMateSettings>(defaultSettings);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);

        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);

          const updatedSettings = {
            ...defaultSettings,
            ...parsedSettings,
          };

          setSettings(updatedSettings);
          onSettingsChange(updatedSettings);
        }
      } catch (error) {
        console.log("Could not load settings:", error);
      } finally {
        setLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (updatedSettings: RecipeMateSettings) => {
    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);

    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      Alert.alert("Error", "Could not save your settings.");
    }
  };

  const toggleDarkMode = (value: boolean) => {
    updateSettings({
      ...settings,
      darkMode: value,
    });
  };

  const selectDietaryPreference = (preference: DietaryPreference) => {
    updateSettings({
      ...settings,
      dietaryPreference: preference,
    });
  };

  const clearLocalData = () => {
    Alert.alert(
      "Clear saved data?",
      "This will remove your saved favourites and meal plan from this device.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear data",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "recipemate_favourites",
                "recipemate_meal_plan",
              ]);

              onClearLocalData();

              Alert.alert(
                "Data cleared",
                "Your local favourites and meal plan have been removed.",
              );
            } catch (error) {
              Alert.alert("Error", "Could not clear your saved data.");
            }
          },
        },
      ],
    );
  };

  const isDark = settings.darkMode;

  const colors = {
    background: isDark ? "#121812" : "#F4F7F2",
    card: isDark ? "#1E281F" : "#FFFFFF",
    text: isDark ? "#F1F5F0" : "#333333",
    secondary: isDark ? "#B0BDB0" : "#777777",
    border: isDark ? "#344234" : "#E5E5E5",
    primary: "#2E7D32",
  };

  if (!loaded) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {showBackToProfile && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            ← Back to Profile
          </Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.heading, { color: colors.text }]}>Settings ⚙️</Text>

      {/* Appearance */}
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Appearance
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Dark Mode
            </Text>
            <Text style={[styles.description, { color: colors.secondary }]}>
              Use a darker theme throughout RecipeMate
            </Text>
          </View>

          <Switch
            value={settings.darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#BDBDBD", true: "#81C784" }}
            thumbColor={settings.darkMode ? "#2E7D32" : "#F4F3F4"}
          />
        </View>
      </View>

      {/* Cooking preferences */}
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Cooking Preferences
        </Text>

        <Text
          style={[
            styles.description,
            { color: colors.secondary, marginBottom: 12 },
          ]}
        >
          Choose your dietary preference
        </Text>

        <View style={styles.preferenceContainer}>
          {(["All", "Vegetarian", "Vegan"] as DietaryPreference[]).map(
            (preference) => {
              const selected = settings.dietaryPreference === preference;

              return (
                <TouchableOpacity
                  key={preference}
                  style={[
                    styles.preferenceButton,
                    {
                      backgroundColor: selected
                        ? colors.primary
                        : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => selectDietaryPreference(preference)}
                >
                  <Text
                    style={{
                      color: selected ? "#FFFFFF" : colors.text,
                      fontWeight: selected ? "bold" : "500",
                    }}
                  >
                    {preference}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        <Text
          style={[
            styles.description,
            { color: colors.secondary, marginTop: 10 },
          ]}
        >
          Your preference will be used to filter recipes.
        </Text>
      </View>

      {/* Privacy */}
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Privacy & Storage
        </Text>

        <Text
          style={[
            styles.description,
            { color: colors.secondary, marginBottom: 12 },
          ]}
        >
          Remove saved favourites and meal plans from this device.
        </Text>

        <TouchableOpacity style={styles.dangerButton} onPress={clearLocalData}>
          <Text style={styles.dangerButtonText}>Clear Local Data</Text>
        </TouchableOpacity>
      </View>

      {/* Help and About */}
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Help & About
        </Text>

        <Text style={[styles.settingTitle, { color: colors.text }]}>
          RecipeMate
        </Text>

        <Text
          style={[
            styles.description,
            { color: colors.secondary, marginTop: 5 },
          ]}
        >
          Discover recipes, manage favourites, and plan your meals.
        </Text>

        <Text
          style={[
            styles.description,
            { color: colors.secondary, marginTop: 10 },
          ]}
        >
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 25,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 22,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 18,
  },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
  },
  preferenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  preferenceButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  dangerButton: {
    backgroundColor: "#FCE8E6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#C62828",
    fontWeight: "bold",
  },
});
