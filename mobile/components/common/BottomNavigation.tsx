import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

export type BottomTab =
  | "Home"
  | "Search"
  | "Favourites"
  | "Meal Planner"
  | "Settings";

type NavigationTheme = {
  surface: string;
  border: string;
  activeTab: string;
  accent: string;
  secondaryText: string;
};

type Props = {
  theme: NavigationTheme;
  activeTab: BottomTab;
  onNavigate: (tab: BottomTab) => void;
};

type TabItem = {
  name: BottomTab;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  activeIcon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

const tabs: TabItem[] = [
  {
    name: "Home",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "Search",
    label: "Search",
    icon: "magnify",
    activeIcon: "magnify",
  },
  {
    name: "Favourites",
    label: "Favourites",
    icon: "heart-outline",
    activeIcon: "heart",
  },
  {
    name: "Meal Planner",
    label: "Planner",
    icon: "calendar-month-outline",
    activeIcon: "calendar-month",
  },
  {
    name: "Settings",
    label: "Settings",
    icon: "cog-outline",
    activeIcon: "cog",
  },
];

export default function BottomNavigation({
  theme,
  activeTab,
  onNavigate,
}: Props) {
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {tabs.map(({ name, label, icon, activeIcon }) => {
        const selected = activeTab === name;

        return (
          <TouchableOpacity
            key={name}
            style={styles.tabButton}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => onNavigate(name)}
          >
            <View
              style={[
                styles.iconContainer,
                selected && styles.activeIconContainer,
              ]}
            >
              <MaterialCommunityIcons
                name={selected ? activeIcon : icon}
                size={25}
                color={selected ? theme.accent : theme.secondaryText}
              />
            </View>

            <Text
              style={[styles.tabLabel, selected && styles.activeTabLabel]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (theme: NavigationTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface || colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.border || colors.border,
      paddingHorizontal: 4,
      paddingTop: 8,
      paddingBottom: 8,
    },

    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 0,
    },

    iconContainer: {
      width: 48,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 3,
    },

    activeIconContainer: {
      backgroundColor: theme.activeTab,
    },

    tabLabel: {
      ...typography.navigationLabel,
      fontSize: 10,
      color: theme.secondaryText,
      textAlign: "center",
    },

    activeTabLabel: {
      color: theme.accent,
      fontWeight: "800",
    },
  });
