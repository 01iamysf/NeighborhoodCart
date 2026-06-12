import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Animated, Text, Image } from "react-native";

export default function SplashAnimation({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;  // Logo Opacity
  const scaleAnim = useRef(new Animated.Value(0.3)).current; // Logo Scale
  const textFadeAnim = useRef(new Animated.Value(0)).current; // Text Opacity
  const textMoveAnim = useRef(new Animated.Value(15)).current; // Text translation Y

  useEffect(() => {
    // Run hardware accelerated animations in sequence
    Animated.sequence([
      // 1. Logo fades and springs into squicle shape
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 15,
          useNativeDriver: true,
        }),
      ]),
      // 2. Title & subtitle slide up and fade in
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(textMoveAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Hold the splash screen for 2.8 seconds, then fade out and trigger complete callback
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onFinish) onFinish();
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.logoContainer, 
        { 
          opacity: fadeAnim, 
          transform: [{ scale: scaleAnim }] 
        }
      ]}>
        <Image
          source={require("../../assets/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      
      <Animated.View style={{ 
        opacity: textFadeAnim, 
        transform: [{ translateY: textMoveAnim }],
        marginTop: 24, 
        alignItems: "center" 
      }}>
        <Text style={styles.appName}>Neighborhood Cart</Text>
        <Text style={styles.appSubtitle}>Connecting you to your local store</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    backgroundColor: "#ffffff",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  logo: {
    width: 110,
    height: 110,
  },
  appName: {
    fontSize: 25,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
    fontWeight: "500",
  },
});
