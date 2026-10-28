import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const inventoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333333",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#333333",
  },
  logoHeader: {
    width: 120,
    height: 40,
  },
  avatarHeader: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#FFE0B2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "SegoeUI",
    fontWeight: "bold",
    color: COLORS.naranja,
    fontSize: 14,
  },

  //  TARJETA BLANCA PRINCIPAL 
  mainCard: {
    flex: 1,
    backgroundColor: COLORS.blanco,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // TÍTULO DE LA SECCIÓN 
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  boltCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF3E0", 
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: "Oswald-Bold",
    color: "#3D3D3D",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "SegoeUI",
    color: COLORS.grisMedio,
    marginTop: 2,
  },

  // TARJETAS DE CATEGORÍAS
  card: {
    backgroundColor: COLORS.blanco,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: "cover",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.naranja,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 115,
    alignSelf: "center",
    borderWidth: 4,
    borderColor: COLORS.blanco,
  },
  cardInfo: {
    paddingTop: 35,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "Oswald-Bold",
    color: "#3d3d3d",
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "SegoeUI",
    color: COLORS.grisMedio,
    textAlign: "center",
  },
  arrow: {
    position: "absolute",
    right: 20,
    bottom: 25,
  },
});
