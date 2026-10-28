import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../styles/colors";

export default function CustomHeader({ navigation, showBackButton = false }) {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => (showBackButton ? navigation.goBack() : null)}
      >
        <Ionicons
          name={showBackButton ? "arrow-back" : "menu"}
          size={30}
          color={COLORS.blanco}
        />
      </TouchableOpacity>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>TC</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333333",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  logo: {
    width: 140,
    height: 40,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#FFE0B2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "Oswald-Bold",
    color: COLORS.naranja,
    fontSize: 14,
  },
});
