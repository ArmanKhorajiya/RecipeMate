import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../constants/api";
import { saveToken } from "../utils/storage";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

type ApiResponse = {
  message?: string;
  token?: string;
  user?: AuthUser;
};

type AuthScreenProps = {
  onAuthenticated: (token: string, user: AuthUser) => void;
  onClose: () => void;
};

export default function AuthScreen({
  onAuthenticated,
  onClose,
}: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    try {
      setLoading(true);
      setError("");

      if (!email.trim() || !password) {
        setError("Please enter your email and password.");
        return;
      }

      if (isRegistering && !name.trim()) {
        setError("Please enter your name.");
        return;
      }

      if (isRegistering) {
        const registerResponse = await fetch(
          `${API_BASE_URL}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
            }),
          },
        );

        const registerData: ApiResponse = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(registerData.message || "Registration failed.");
        }
      }

      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const loginData: ApiResponse = await loginResponse.json();

      if (!loginResponse.ok || !loginData.token || !loginData.user) {
        throw new Error(loginData.message || "Login failed.");
      }

      await saveToken("recipemate_token", loginData.token);

      onAuthenticated(loginData.token, loginData.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>RecipeMate 🍲</Text>

          <Text style={styles.subtitle}>
            {isRegistering ? "Create your account" : "Welcome back"}
          </Text>
        </View>

        <View style={styles.card}>
          {isRegistering && (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error !== "" && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegistering ? "Sign Up" : "Login"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              {isRegistering
                ? "Already have an account? Login"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F2",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  closeButton: {
    position: "absolute",
    right: 0,
    top: -15,
    padding: 10,
  },

  closeText: {
    fontSize: 22,
    color: "#555",
  },

  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },

  input: {
    backgroundColor: "#F8FAF7",
    borderWidth: 1,
    borderColor: "#D5DDD2",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
  },

  button: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  switchText: {
    color: "#2E7D32",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },

  error: {
    color: "#C62828",
    marginBottom: 12,
    textAlign: "center",
  },
});
