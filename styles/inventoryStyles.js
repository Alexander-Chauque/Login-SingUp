// Copia static/css/inventario.css de la web
import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const inventoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grisClaro,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.blanco,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  cardImage: {
    width: "100%",
    height: 170,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: "cover",
  },
  // Ícono redondo montado sobre el borde de la imagen
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.naranja,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 140,
    alignSelf: "center",
    borderWidth: 4,
    borderColor: COLORS.blanco,
  },
  cardInfo: {
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: "Oswald-Bold",
    color: "#333333",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.grisMedio,
    textAlign: "center",
    marginBottom: 20,
  },
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    minHeight: 44,
    backgroundColor: COLORS.naranja,
    borderRadius: 8,
  },
  cardButtonText: {
    fontFamily: "Oswald-Bold",
    fontSize: 14,
    color: COLORS.blanco,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
