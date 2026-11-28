import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

type HeaderTheme = {
  surface: string;
  accent: string;
  text?: string;
  secondaryText?: string;
  border?: string;
};

type Props = {
  theme: HeaderTheme;
  title?: string;
  subtitle?: string;
  userInitials?: string | null;
  onHomePress: () => void;
  onProfilePress: () => void;
};

export default function AppHeader({
  theme,
  title = "Welcome back!",
  subtitle,
  userInitials,
  onHomePress,
  onProfilePress,
}: Props) {
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Screen title */}
      <TouchableOpacity
        style={styles.titleContainer}
        onPress={onHomePress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            {subtitle}
          </Text>
        ) : null}
      </TouchableOpacity>

      {/* Profile button */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={onProfilePress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        {userInitials ? (
          <Text style={styles.initials}>
            {userInitials.trim().toUpperCase()}
          </Text>
        ) : (
          <MaterialCommunityIcons
            name="account-outline"
            size={25}
            color={colors.text}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: HeaderTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.accent || colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    titleContainer: {
      flex: 1,
      minWidth: 0,
      marginRight: 12,
      justifyContent: "center",
    },

    title: {
      ...typography.screenTitle,
      fontSize: 21,
      color: theme.text || colors.text,
    },

    subtitle: {
      ...typography.caption,
      color: theme.text || colors.text,
      opacity: 0.8,
      marginTop: 3,
    },

    profileButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: theme.border || colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    initials: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text || colors.text,
    },
  });
