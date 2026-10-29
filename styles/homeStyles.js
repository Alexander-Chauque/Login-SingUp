import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  // --- HEADER ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.grisOscuro,
  },
  logoSmall: {
    width: 80,
    height: 40,
  },
  avatarCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#FFE0B2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "Oswald",
    fontWeight: "bold",
    color: COLORS.naranja,
    fontSize: 14,
  },

  // --- CONTENIDO ---
  scrollContent: {
    padding: 20,
  },
  welcomeRow: {
    flex: "flex",
    flexDirection:'row',
    alignItems: "center",
    marginBottom: "5",
  },
  welcomeText: {
    fontSize: 26,
    fontFamily: "Oswald",
    fontWeight: "bold",
    color: COLORS.grisOscuro,
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: "SegoeUI",
    color: COLORS.grisMedio,
    marginBottom: 20,
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blanco,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    fontFamily: "SegoeUI",
    color: COLORS.grisOscuro,
    marginLeft: 8,
  },

  // --- TARJETAS DE RESUMEN ---
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: COLORS.blanco,
    width: "31%",
    padding: 15,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  statNumber: {
    fontSize: 18,
    fontFamily: "Oswald-Bold",
    color: COLORS.grisOscuro,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Oswald",
    color: COLORS.grisMedio,
    marginTop: 2,
  },
  progressBarBg: {
    width: "100%",
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginTop: 8,
  },
  progressBarFill: {
    width: "90%",
    height: 4,
    backgroundColor: COLORS.naranja,
    borderRadius: 2,
  },

  // --- GRILLA DE MÓDULOS ---
  sectionTitleRow: {
    flex: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Oswald",
    fontWeight: "bold",
    color: COLORS.grisOscuro,
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    backgroundColor: COLORS.blanco,
    width: "31%",
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  gridText: {
    fontSize: 12,
    fontFamily: "Oswald",
    fontWeight: "bold",
    color: COLORS.grisOscuro,
    marginTop: 8,
    textAlign: "center",
  },

  // --- BARRA INFERIOR ---
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.blanco,
    paddingVertical: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 10,
    fontFamily: "SegoeUI",
    color: COLORS.grisMedio,
    marginTop: 4,
  },
});
