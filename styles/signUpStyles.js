import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from './colors';

export const signUpStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    card: {
        backgroundColor: COLORS.blanco,
        borderRadius: 24,
        padding: 24,
        width: '95%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        borderTopWidth: 4,
        borderTopColor: COLORS.naranja,
    },

    logo: {
        width: 80,
        height: 80,
        marginBottom: 15,
        resizeMode: 'contain',
        alignSelf: 'center',
    },

    title: {
        fontSize: 28,
        fontFamily: FONTS.titulo,
        color: COLORS.grisOscuro,
        marginBottom: 10,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 'bold',

    },

    subtitle: {
        fontSize: 16,
        fontFamily: FONTS.titulo,
        color: COLORS.grisMedio,
        marginBottom: 13,
        textAlign: 'left',

    },
    
    brandName: {
        color: COLORS.naranja,
        fontFamily: FONTS.titulo,
        fontWeight: 'bold',
    },

    label: {
        fontSize: 14,
        fontFamily: FONTS.titulo,
        color: COLORS.grisOscuro,
        marginTop: 12,
        marginBottom: 5,
        textTransform: 'uppercase',
        fontWeight: 'bold',

    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.bordeClaro,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
        width: '100%',
        height: 50,
        backgroundColor: COLORS.blanco,
    },

    input: {
        flex: 1,
        height: 40,
        fontFamily: FONTS.cuerpo,
        fontSize: 14,
        color: COLORS.grisOscuro,
    },

    icon: {
        marginRight: 10,
    },

    button: {
        backgroundColor: COLORS.naranja,
        borderRadius: 8,
        height: 50,
        width: '50%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },

    buttonText: {
        color: COLORS.blanco,
        fontSize: 16,
        fontFamily: FONTS.titulo,
        textTransform: 'uppercase',
    },

    signUpText: {
        fontSize: 14,
        fontFamily: FONTS.cuerpo,
        color: COLORS.grisOscuro,
        textAlign: 'center',
        marginTop: 15,
    },

    linkText: {
        color: COLORS.naranja,
        fontFamily: FONTS.titulo,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },

    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
    },

    errorText: {
        color: COLORS.rojo,
        fontSize: 12,
        fontFamily: FONTS.cuerpo,
        marginLeft: 8,
        flex: 1,
    },
    });