import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 1. Paleta de Cores Base
const palette = {
  bluePrimary: '#0A84FF', // Um azul mais moderno e acessível (Apple's Blue)
  purpleSecondary: '#5E5CE6', // Roxo secundário (Apple's Indigo)

  white: '#FFFFFF',
  black: '#000000',

  lightGray1: '#F2F2F7', // Fundo principal (quase branco)
  lightGray2: '#E5E5EA', // Bordas e divisores
  lightGray3: '#D1D1D6', // Input placeholders

  darkGray1: '#1C1C1E', // Texto principal (quase preto)
  darkGray2: '#3A3A3C', // Texto secundário
  darkGray3: '#636366', // Texto terciário

  red: '#FF3B30', // Erro
  green: '#34C759', // Sucesso
  yellow: '#FFCC00', // Aviso / Destaque
  cyan: '#32ADE6', // Cor para medições
  magenta: '#FF2D55', // Cor para medições
};

// 2. Cores Semânticas (Mapeamento da paleta para uso no app)
export const colors = {
  primary: palette.bluePrimary,
  secondary: palette.purpleSecondary,

  background: palette.lightGray1,
  surface: palette.white, // Cor de "superfície" para cards, modais, etc.

  text: palette.darkGray1,
  textSecondary: palette.darkGray2,
  textMuted: palette.darkGray3,

  border: palette.lightGray2,

  error: palette.red,
  success: palette.green,

  // Cores específicas da funcionalidade
  measurementLine1: palette.cyan,
  measurementLine2: palette.red,
  measurementLine3: palette.magenta,
  calibrationLine: palette.yellow,

  blackOverlay: 'rgba(0, 0, 0, 0.65)',
};

// 3. Escala de Espaçamento
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

// 4. Hierarquia Tipográfica
export const typography = {
  h1: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  h3: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 17,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
};

// 5. Layout e Elementos Comuns
export const layout = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.l,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenWidth,
  screenHeight,
  borderRadius: 14,
  shadow: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
};

// 6. Estilos de Componentes Globais
export const components = StyleSheet.create({
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: spacing.m,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryText: {
    ...typography.button,
    color: palette.white,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: spacing.m,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonSecondaryText: {
    ...typography.button,
    color: colors.primary,
  },
});
