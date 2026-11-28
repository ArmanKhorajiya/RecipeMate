import { colors } from "./colors";
import { typography } from "./typography";

export const lightTheme = {
  ...colors,

  background: colors.background,
  surface: colors.surface,
  accent: colors.primary,
  border: colors.border,
  activeTab: colors.navigationActive,
  secondaryText: colors.secondaryText,

  text: colors.text,
  typography,
};

export const darkTheme = {
  ...colors,

  background: "#1F1A16",
  surface: "#2B241E",
  accent: colors.primary,
  border: "#463A30",
  activeTab: "#49331B",
  secondaryText: "#C2B5A8",

  text: "#FFF7ED",
  typography,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export type Theme = typeof lightTheme;
