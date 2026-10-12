import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from './colors';

export const signUpStyles = StyleSheet.create({
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

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },

    card: {
        backgroundColor: COLORS.blanco,
        borderRadius: 24,
        padding: 20,
        paddingBottom: 50,
        width: 300,
        alignItems: 'center',
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
        marginBottom: 10,
        resizeMode: 'contain',
        alignSelf: 'center',
    },

    title: {
        fontSize: 22,
        fontFamily: FONTS.titulo,
        color: COLORS.grisOscuro,
        marginBottom: 5,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },

    subtitle: {
        fontSize: 12,
        fontFamily: FONTS.cuerpo,
        color: COLORS.grisOscuro,
        marginBottom: 15,
        textAlign: 'center',
    },

    brandName: {
        color: COLORS.naranja,
        fontFamily: FONTS.titulo,
        fontWeight: 'bold',
    },

    colorLine: {
        height: 4,
        width: 60,
        backgroundColor: COLORS.naranja,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 15,
    },

    label: {
        alignSelf: 'flex-start',
        fontSize: 13,
        fontFamily: FONTS.titulo,
        color: COLORS.grisOscuro,
        marginTop: 8,
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.bordeClaro,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        width: '100%',
        height: 45,
        backgroundColor: COLORS.blanco,
    },

    inputFocused: {
        borderColor: COLORS.naranja,
        borderWidth: 2,
    },

    icon: {
        marginRight: 10,
    },

    input: {
        flex: 1,
        height: 40,
        fontFamily: FONTS.cuerpo,
        fontSize: 13,
        color: COLORS.grisOscuro,
    },

    button: {
        backgroundColor: COLORS.naranja,
        borderRadius: 10,
        height: 50,
        width: '60%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 15,
    },

    buttonText: {
        color: COLORS.blanco,
        fontSize: 16,
        fontFamily: FONTS.titulo,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    loginText: {
        color: COLORS.naranja,
        fontFamily: FONTS.cuerpo,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
        textDecorationLine: 'underline',
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
        padding: 8,
        marginTop: 8,
        marginBottom: 8,
        width: '100%',
    },

    // Texto del mensaje de error
    errorText: {
        color: COLORS.rojo,
        fontSize: 11,
        fontFamily: FONTS.cuerpo,
        marginLeft: 8,
        flex: 1,
    },
    });