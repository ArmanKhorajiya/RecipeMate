import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type ProfileUser = {
  name: string;
  email: string;
  role: string;
};

type ProfileTheme = {
  surface: string;
  surfaceRaised?: string;
  text: string;
  secondaryText: string;
  accent: string;
  activeTab: string;
  border: string;
};

type ProfileScreenProps = {
  authUser: ProfileUser | null;
  theme: ProfileTheme;
  onLoginPress: () => void;
  onSettingsPress: () => void;
  onLogoutPress: () => void;
  onFavoritesPress: () => void;
  onPlannerPress: () => void;
};

type ActionRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  theme: ProfileTheme;
  onPress: () => void;
  destructive?: boolean;
};

function ActionRow({
  icon,
  title,
  subtitle,
  theme,
  onPress,
  destructive = false,
}: ActionRowProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={styles.actionRow}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.actionIcon, { backgroundColor: theme.activeTab }]}>
        <MaterialCommunityIcons name={icon} size={22} color={theme.accent} />
      </View>

      <View style={styles.actionCopy}>
        <Text
          style={[
            styles.actionTitle,
            { color: destructive ? "#C94A45" : theme.text },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[styles.actionSubtitle, { color: theme.secondaryText }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      <Text style={[styles.chevron, { color: theme.secondaryText }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({
  authUser,
  theme,
  onLoginPress,
  onSettingsPress,
  onLogoutPress,
  onFavoritesPress,
  onPlannerPress,
}: ProfileScreenProps) {
  const initials =
    authUser?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "AK";

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Profile</Text>

        <Text style={[styles.pageSubtitle, { color: theme.secondaryText }]}>
          Your account and cooking space
        </Text>
      </View>

      {!authUser ? (
        <View
          style={[
            styles.guestCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.activeTab }]}>
            <MaterialCommunityIcons
              name="account-outline"
              size={32}
              color={theme.accent}
            />
          </View>

          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Your kitchen, your recipes
          </Text>

          <Text
            style={[styles.cardDescription, { color: theme.secondaryText }]}
          >
            Sign in to save favourites and keep your cooking plans together.
          </Text>

          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}
            onPress={onLoginPress}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Login / Sign Up</Text>

            <Text style={styles.primaryArrow}>›</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.identityCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: theme.activeTab }]}>
              <Text style={[styles.avatarText, { color: theme.accent }]}>
                {initials}
              </Text>
            </View>

            <View style={styles.identityDetails}>
              <Text
                style={[styles.profileName, { color: theme.text }]}
                numberOfLines={1}
              >
                {authUser.name}
              </Text>

              <Text
                style={[styles.profileEmail, { color: theme.secondaryText }]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {authUser.email}
              </Text>

              <View
                style={[
                  styles.memberBadge,
                  { backgroundColor: theme.activeTab },
                ]}
              >
                <Text style={[styles.memberText, { color: theme.accent }]}>
                  {authUser.role === "admin" ? "ADMIN" : "MEMBER"}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>
            YOUR COOKING
          </Text>

          <View
            style={[
              styles.actionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <ActionRow
              icon="heart-outline"
              title="Saved recipes"
              subtitle="Your favourite recipes in one place"
              theme={theme}
              onPress={onFavoritesPress}
            />

            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />

            <ActionRow
              icon="calendar-month-outline"
              title="Meal planner"
              subtitle="View and organize your planned meals"
              theme={theme}
              onPress={onPlannerPress}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>
            ACCOUNT
          </Text>

          <View
            style={[
              styles.actionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            {authUser.role === "admin" && (
              <>
                <ActionRow
                  icon="shield-account-outline"
                  title="Admin tools"
                  subtitle="Administration"
                  theme={theme}
                  onPress={() =>
                    Alert.alert(
                      "Admin Dashboard",
                      "The admin dashboard will be connected here.",
                    )
                  }
                />

                <View
                  style={[styles.rowDivider, { backgroundColor: theme.border }]}
                />
              </>
            )}

            <ActionRow
              icon="cog-outline"
              title="Settings"
              subtitle="Preferences and appearance"
              theme={theme}
              onPress={onSettingsPress}
            />
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.logoutButton, { borderColor: theme.border }]}
            onPress={onLogoutPress}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutGlyph}>↪</Text>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 28,
  },

  pageHeader: {
    marginBottom: 20,
  },

  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },

  identityCard: {
    minHeight: 112,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  identityDetails: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },

  profileName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },

  profileEmail: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  memberBadge: {
    alignSelf: "flex-start",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },

  memberText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  sectionTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 9,
    marginLeft: 2,
  },

  actionCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    marginBottom: 22,
  },

  actionRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  actionCopy: {
    flex: 1,
    minWidth: 0,
  },

  actionTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },

  actionSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  chevron: {
    fontSize: 26,
    marginLeft: 8,
  },

  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 54,
  },

  logoutButton: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },

  logoutGlyph: {
    color: "#C94A45",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },

  logoutText: {
    color: "#C94A45",
    fontSize: 13,
    fontWeight: "800",
  },

  guestCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 4,
  },

  cardDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 20,
  },

  primaryButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  primaryArrow: {
    color: "#FFFFFF",
    fontSize: 23,
    marginLeft: 8,
    marginTop: -2,
  },
});
