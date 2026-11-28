import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type HeaderTheme = {
  surface: string;
  accent: string;
};

type Props = {
  theme: HeaderTheme;
  title?: string;
  subtitle?: string;
  userInitials?: string | null;
  onHomePress: () => void;
  onProfilePress: () => void;
};

const COLORS = {
  primary: "#F7930A",
  cream: "#FFF7ED",
  white: "#FFFFFF",
  brown: "#2B1608",
  border: "#E8D8C7",
};

export default function AppHeader({
  title = "Welcome back!",
  subtitle,
  userInitials,
  onHomePress,
  onProfilePress,
}: Props) {
  return (
    <View style={styles.topBar}>
      {/* Screen Title */}
      <TouchableOpacity
        onPress={onHomePress}
        activeOpacity={0.7}
        accessibilityLabel="Go to Home"
        style={styles.titleContainer}
      >
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={onProfilePress}
        accessibilityLabel="Open profile"
        activeOpacity={0.7}
      >
        {userInitials ? (
          <Text style={styles.initials}>{userInitials}</Text>
        ) : (
          <MaterialCommunityIcons
            name="account-outline"
            size={25}
            color={COLORS.brown}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titleContainer: {
    flex: 1,
    marginRight: 12,
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.brown,
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.brown,
    opacity: 0.8,
    marginTop: 3,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cream,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  initials: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.brown,
  },
});
