import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

export default function EmptyState({
  title,
  message,
  icon = "food-outline",
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={48} color={colors.primary} />
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    ...typography.sectionTitle,
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },

  message: {
    ...typography.body,
    color: colors.secondaryText,
    textAlign: "center",
    maxWidth: 280,
  },
});
