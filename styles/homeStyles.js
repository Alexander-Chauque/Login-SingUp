import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from './colors';

export const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#626262',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        overflow: 'hidden',
    },

    circleTop: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#A77D48',
        top: -80,
        right: -80,
    },

    circleBottom: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#A77D48',
        bottom: -100,
        left: -90,
    },

    card: {
        backgroundColor: COLORS.blanco,
        borderRadius: 24,
        padding: 30,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        borderTopWidth: 6,
        borderTopColor: COLORS.naranja,
    },

    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
        resizeMode: 'contain',
    },

    title: {
        fontSize: 24,
        fontFamily: FONTS.titulo,
        color: COLORS.grisOscuro,
        marginBottom: 10,
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.cuerpo,
        color: COLORS.grisMedio,
        marginBottom: 30,
        textAlign: 'center',
    },

    brandName: {
        color: COLORS.naranja,
        fontFamily: FONTS.titulo,
        fontWeight: 'bold',
    },

    logoutButton: {
        backgroundColor: COLORS.rojo,
        borderRadius: 10,
        height: 50,
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },

    logoutText: {
        color: COLORS.blanco,
        fontSize: 16,
        fontFamily: FONTS.titulo,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});