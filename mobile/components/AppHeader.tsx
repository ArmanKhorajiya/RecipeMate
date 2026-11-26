
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type HeaderTheme = {
  surface: string;
  accent: string;
};

type Props = {
  theme: HeaderTheme;
  onHomePress: () => void;
  onProfilePress: () => void;
};

export default function AppHeader({
  theme,
  onHomePress,
  onProfilePress,
}: Props) {
  return (
    <View
      style={[
        styles.topBar,
        {
          backgroundColor: theme.surface,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onHomePress}
        accessibilityLabel="Go to Home"
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.appTitle,
            { color: theme.accent },
          ]}
        >
          RecipeMate 🍲
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileIconButton}
        onPress={onProfilePress}
        accessibilityLabel="Open profile"
        activeOpacity={0.7}
      >
        <Text style={styles.profileIcon}>👤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
