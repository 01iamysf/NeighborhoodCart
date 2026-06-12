import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import CustomerDashboard from "./src/screens/CustomerDashboard";
import ShopkeeperDashboard from "./src/screens/ShopkeeperDashboard";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login"); // login, register, dashboard

  useEffect(() => {
    checkLoginSession();
  }, []);

  const checkLoginSession = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setScreen("dashboard");
      }
    } catch (e) {
      console.error("Error reading session from storage:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setScreen("dashboard");
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setUser(null);
      setScreen("login");
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {screen === "login" && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setScreen("register")}
        />
      )}

      {screen === "register" && (
        <RegisterScreen
          onRegisterSuccess={handleLoginSuccess}
          onNavigateToLogin={() => setScreen("login")}
        />
      )}

      {screen === "dashboard" && user && (
        user.role === "shopkeeper" ? (
          <ShopkeeperDashboard user={user} onLogout={handleLogout} />
        ) : (
          <CustomerDashboard user={user} onLogout={handleLogout} />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
});
