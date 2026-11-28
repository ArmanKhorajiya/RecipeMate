import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  activeTab: string;
  onNavigate: (tab: BottomTab) => void;
};

const COLORS = {
  orange: "#F7930A",
  cream: "#FFF7ED",
  white: "#FFFFFF",
  brown: "#2B1608",
  secondaryText: "#6B625A",
  border: "#E8D8C7",
  activeBackground: "#FFE5BF",
};

const tabs: {
  name: BottomTab;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  activeIcon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}[] = [
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

export default function BottomNavigation({ activeTab, onNavigate }: Props) {
  return (
    <View style={styles.bottomNavigation}>
      {tabs.map(({ name, label, icon, activeIcon }) => {
        const selected = activeTab === name;

        return (
          <TouchableOpacity
            key={name}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => onNavigate(name)}
            style={styles.tabButton}
          >
            <View
              style={[
                styles.iconContainer,
                selected && styles.activeIconContainer,
              ]}
            >
              <MaterialCommunityIcons
                name={selected ? activeIcon : icon}
                size={26}
                color={selected ? COLORS.orange : COLORS.brown}
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

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cream,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 8,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: COLORS.activeBackground,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: COLORS.secondaryText,
    textAlign: "center",
  },

  activeTabLabel: {
    color: COLORS.orange,
    fontWeight: "800",
  },
});
