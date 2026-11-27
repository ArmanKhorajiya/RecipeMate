import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

type ProfileTheme = {
  surface: string;
  text: string;
  secondaryText: string;
  accent: string;
  activeTab: string;
  border: string;
};

type ProfileScreenProps = {
  authUser: AuthUser | null;
  theme: ProfileTheme;
  onLoginPress: () => void;
  onSettingsPress: () => void;
  onLogoutPress: () => void;
};

export default function ProfileScreen({
  authUser,
  theme,
  onLoginPress,
  onSettingsPress,
  onLogoutPress,
}: ProfileScreenProps) {
  if (!authUser) {
    return (
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.profileTitle, { color: theme.accent }]}>
          Your Profile 👤
        </Text>

        <Text style={[styles.profileText, { color: theme.secondaryText }]}>
          Log in to access your profile and save your favourite recipes.
        </Text>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.accent }]}
          onPress={onLoginPress}
        >
          <Text style={styles.primaryButtonText}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.profileCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Text style={[styles.profileTitle, { color: theme.accent }]}>
        Your Profile 👤
      </Text>

      <View style={[styles.avatar, { backgroundColor: theme.activeTab }]}>
        <Text style={[styles.avatarText, { color: theme.accent }]}>
          {authUser.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text style={[styles.profileName, { color: theme.text }]}>
        {authUser.name}
      </Text>

      <Text style={[styles.profileText, { color: theme.secondaryText }]}>
        {authUser.email}
      </Text>

      <Text style={[styles.roleText, { color: theme.accent }]}>
        Account: {authUser.role}
      </Text>

      {authUser.role === "admin" && (
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: theme.activeTab }]}
          onPress={() =>
            Alert.alert(
              "Admin Dashboard",
              "We will connect the admin dashboard next.",
            )
          }
        >
          <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
            Admin Dashboard
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.secondaryButton, { backgroundColor: theme.activeTab }]}
        onPress={onSettingsPress}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
          ⚙️ Settings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  profileText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  primaryButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#C62828",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
