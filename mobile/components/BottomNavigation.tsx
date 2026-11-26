import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import Svg, { Circle, Rect, Path, Polygon, G } from "react-native-svg";

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

type IconProps = {
  size?: number;
};

// 🏠 Home icon — orange roof and yellow house
function HomeIcon({ size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Chimney */}
      <Rect x="31" y="7" width="9" height="17" fill="#F4511E" />

      {/* House body */}
      <Rect x="9" y="21" width="30" height="25" fill="#FFB74D" />

      {/* Roof */}
      <Polygon points="3,22 24,4 45,22 39,29 24,16 9,29" fill="#FF7043" />

      {/* Roof highlight */}
      <Polygon points="24,4 45,22 39,29 24,16" fill="#FF5722" />

      {/* Door */}
      <Rect x="20" y="30" width="9" height="16" fill="#38220B" />
    </Svg>
  );
}

// 🔍 Search icon — blue glass and orange handle
function SearchIcon({ size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Handle */}
      <Rect
        x="30"
        y="29"
        width="9"
        height="20"
        rx="4"
        fill="#FF9800"
        transform="rotate(-42 30 29)"
      />

      {/* Outer glass */}
      <Circle cx="21" cy="20" r="17" fill="#0288D1" />

      {/* Inner glass */}
      <Circle cx="21" cy="20" r="13" fill="#29B6F6" />

      {/* Glass highlight */}
      <Path
        d="M13 12 C16 8 20 7 23 8"
        stroke="#B3E5FC"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Small highlight */}
      <Circle cx="12" cy="17" r="2" fill="#E1F5FE" />
    </Svg>
  );
}

// ❤️ Favourites icon — bright pink heart
function FavouritesIcon({ size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M24 42
           L7 26
           C-1 18 5 7 14 7
           C19 7 22 10 24 14
           C27 9 31 7 36 7
           C45 7 49 18 41 26
           Z"
        fill="#EC407A"
      />

      <Path
        d="M11 15 C14 11 18 11 20 14"
        stroke="#F8BBD0"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      <Path d="M24 42 L41 26 C37 34 31 38 24 42" fill="#D81B60" />
    </Svg>
  );
}

// 📅 Planner icon — purple calendar and green check
function PlannerIcon({ size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Calendar body */}
      <Rect x="5" y="9" width="38" height="36" rx="7" fill="#F5F5F5" />

      {/* Purple header */}
      <Path
        d="M12 9 H36 A7 7 0 0 1 43 16 V20 H5 V16 A7 7 0 0 1 12 9 Z"
        fill="#8E44E8"
      />

      {/* Calendar rings */}
      <Rect x="13" y="3" width="5" height="14" rx="2.5" fill="#FFB300" />

      <Rect x="30" y="3" width="5" height="14" rx="2.5" fill="#FFB300" />

      {/* Calendar squares */}
      <Rect x="10" y="24" width="8" height="7" rx="2" fill="#B388FF" />
      <Rect x="21" y="24" width="8" height="7" rx="2" fill="#B388FF" />
      <Rect x="32" y="24" width="7" height="7" rx="2" fill="#B388FF" />

      <Rect x="10" y="34" width="8" height="7" rx="2" fill="#B388FF" />
      <Rect x="21" y="34" width="8" height="7" rx="2" fill="#B388FF" />

      {/* Completed planner task */}
      <Rect x="31" y="33" width="9" height="9" rx="2" fill="#4CAF50" />

      <Path
        d="M33 37 L35 39 L39 35"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// ⚙️ Settings icon — colorful gear

function SettingsIcon({ size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Gear teeth */}
      <G fill="#FFB300">
        <Rect x="19" y="2" width="10" height="12" rx="2" />
        <Rect x="19" y="34" width="10" height="12" rx="2" />

        <Rect x="2" y="19" width="12" height="10" rx="2" />
        <Rect x="34" y="19" width="12" height="10" rx="2" />

        <Rect
          x="19"
          y="2"
          width="10"
          height="12"
          rx="2"
          transform="rotate(45 24 24)"
        />

        <Rect
          x="19"
          y="2"
          width="10"
          height="12"
          rx="2"
          transform="rotate(135 24 24)"
        />

        <Rect
          x="19"
          y="2"
          width="10"
          height="12"
          rx="2"
          transform="rotate(225 24 24)"
        />

        <Rect
          x="19"
          y="2"
          width="10"
          height="12"
          rx="2"
          transform="rotate(315 24 24)"
        />
      </G>

      {/* Gear body */}
      <Circle cx="24" cy="24" r="15" fill="#FF9800" />

      {/* Center hole */}
      <Circle cx="24" cy="24" r="7" fill="#26372B" />
    </Svg>
  );
}

const tabs: {
  name: BottomTab;
  label: string;
  Icon: React.ComponentType<IconProps>;
}[] = [
  {
    name: "Home",
    label: "Home",
    Icon: HomeIcon,
  },
  {
    name: "Search",
    label: "Search",
    Icon: SearchIcon,
  },
  {
    name: "Favourites",
    label: "Favourites",
    Icon: FavouritesIcon,
  },
  {
    name: "Meal Planner",
    label: "Planner",
    Icon: PlannerIcon,
  },
  {
    name: "Settings",
    label: "Settings",
    Icon: SettingsIcon,
  },
];

export default function BottomNavigation({
  theme,
  activeTab,
  onNavigate,
}: Props) {
  return (
    <View
      style={[
        styles.bottomNavigation,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
      ]}
    >
      {tabs.map(({ name, label, Icon }) => {
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
                selected && {
                  backgroundColor: theme.activeTab,
                },
              ]}
            >
              <Icon size={42} />
            </View>

            <Text
              style={[
                styles.tabLabel,
                {
                  color: selected ? theme.accent : theme.secondaryText,
                  fontWeight: selected ? "700" : "500",
                },
              ]}
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
    borderTopWidth: 1,
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 10,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 54,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  tabLabel: {
    fontSize: 11,
    textAlign: "center",
  },
});
