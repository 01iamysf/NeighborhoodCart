import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api/api";

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        name,
        phone,
        password,
        role,
      });

      const { token, user } = response.data;

      // Save token and user details to AsyncStorage
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      onRegisterSuccess(user);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Phone number might already be registered.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.emoji}>📝</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start placing or managing neighborhood orders.</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Role Toggle Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "customer" && styles.activeRoleButton,
              ]}
              onPress={() => setRole("customer")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === "customer" && styles.activeRoleButtonText,
                ]}
              >
                🛍️ Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "shopkeeper" && styles.activeRoleButton,
              ]}
              onPress={() => setRole("shopkeeper")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === "shopkeeper" && styles.activeRoleButtonText,
                ]}
              >
                🏪 Shop Owner
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., John Doe"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 9876543210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password (Min 6 characters)</Text>
            <TextInput
              style={styles.input}
              placeholder="Create password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.loginLink}> Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: "center",
  },
  emoji: {
    fontSize: 54,
    marginBottom: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#059669",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  errorText: {
    color: "#ef4444",
    backgroundColor: "#fef2f2",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
    fontSize: 13,
  },
  roleContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeRoleButton: {
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  activeRoleButtonText: {
    color: "#059669",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  button: {
    width: "100%",
    backgroundColor: "#059669",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
  },
  loginLink: {
    color: "#059669",
    fontWeight: "bold",
    fontSize: 14,
  },
});
