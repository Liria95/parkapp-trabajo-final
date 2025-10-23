// ============================================
// COLORES
// ============================================

const colors = {
  // ========== COLORES PRINCIPALES ==========
  primary: '#2E7BDC',       // Azul principal
  secondary: '#5CB3CC',     // Azul secundario
  
  // ========== COLORES SEMÁNTICOS ==========
  success: '#72C8A8',       // Verde (éxito, disponible)
  warning: '#FFC857',       // Amarillo (advertencia)
  danger: '#E74C3C',        // Rojo (error, peligro)
  info: '#5CB3CC',          // Azul info
  
  // ========== COLORES NEUTROS ==========
  dark: '#2C3E50',          // Gris oscuro (textos principales)
  gray: '#6C757D',          // Gris medio (textos secundarios)
  lightGray: '#F8F9FA',     // Gris claro (fondos)
  white: '#FFFFFF',         // Blanco
  black: '#000000',         // Negro
  
  // ========== ESTADOS DE ESPACIOS ==========
  // Colores de fondo para cards según estado
  estado: {
    libre: '#E8F5E8',           // Verde claro
    ocupado: '#FFEBEE',          // Rojo claro
    mantenimiento: '#FFF8E1',    // Amarillo claro
    reservado: '#E3F2FD',        // Azul claro
  },
  
  // ========== ESTADOS DE TRANSACCIONES/INFRACCIONES ==========
  transaccion: {
    pagada: '#E8F5E8',       // Verde claro
    pendiente: '#FFEBEE',     // Rojo claro
    cancelada: '#FFF8E1',     // Amarillo claro
  },
  
  // ========== COLORES DE BORDES ==========
  border: {
    light: '#E0E0E0',        // Borde claro
    medium: '#BDBDBD',       // Borde medio
    dark: '#757575',         // Borde oscuro
  },
  
  // ========== COLORES DE OVERLAY/SOMBRAS ==========
  overlay: 'rgba(0, 0, 0, 0.5)',      // Overlay oscuro para modales
  overlayLight: 'rgba(0, 0, 0, 0.3)', // Overlay claro
  shadow: 'rgba(0, 0, 0, 0.15)',      // Color de sombras
};

// ============================================
// TIPOGRAFÍA
// ============================================

const typography = {
  // ========== FAMILIAS DE FUENTES ==========
  fontFamily: {
    regular: 'System',           // Fuente por defecto
    bold: 'System',              // Fuente bold
    // Si quieres usar custom fonts:
    // regular: 'Roboto-Regular',
    // bold: 'Roboto-Bold',
  },
  
  // ========== TAMAÑOS DE FUENTE ==========
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // ========== PESOS DE FUENTE ==========
  fontWeight: {
    light: '300' as const,
    normal: 'normal' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: 'bold' as const,
  },
  
  // ========== ESTILOS PREDEFINIDOS ==========
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: colors.dark,
    lineHeight: 40,
  },
  
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.dark,
    lineHeight: 32,
  },
  
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.dark,
    lineHeight: 28,
  },
  
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.dark,
    lineHeight: 24,
  },
  
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    color: colors.dark,
    lineHeight: 24,
  },
  
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    color: colors.gray,
    lineHeight: 20,
  },
  
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    color: colors.gray,
    lineHeight: 16,
  },
  
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
    textTransform: 'uppercase' as const,
  },
};

// ============================================
// ESPACIADOS
// ============================================

const spacing = {
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 16,     // 16px (base)
  lg: 24,     // 24px
  xl: 32,     // 32px
  xxl: 48,    // 48px
  xxxl: 64,   // 64px
};

// ============================================
// BORDES
// ============================================

const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,   // Circular
};

const borderWidth = {
  thin: 1,
  medium: 2,
  thick: 3,
};

// ============================================
// SOMBRAS
// ============================================

const shadows = {
  // Sombra ligera (elevación 1)
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Sombra media (elevación 2)
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Sombra grande (elevación 3)
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  
  // Sombra extra grande (modales, drawers)
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
};

// ============================================
// TAMAÑOS DE ICONOS
// ============================================

const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
};

// ============================================
// TAMAÑOS DE BOTONES
// ============================================

const buttonSizes = {
  sm: {
    height: 36,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  md: {
    height: 48,
    paddingHorizontal: 24,
    fontSize: 16,
  },
  lg: {
    height: 56,
    paddingHorizontal: 32,
    fontSize: 18,
  },
};

// ============================================
// TAMAÑOS DE INPUT
// ============================================

const inputSizes = {
  sm: {
    height: 36,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  md: {
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  lg: {
    height: 56,
    paddingHorizontal: 20,
    fontSize: 18,
  },
};

// ============================================
// CONFIGURACIÓN DE LAYOUT
// ============================================

const layout = {
  // Ancho máximo del contenedor
  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Padding horizontal de pantallas
  screenPadding: spacing.md,
  
  // Header heights
  headerHeight: {
    mobile: 56,
    tablet: 64,
  },
  
  // Tab bar height
  tabBarHeight: 60,
};

// ============================================
// ANIMACIONES
// ============================================

const animation = {
  // Duraciones
  duration: {
    fast: 150,      // 150ms
    normal: 300,    // 300ms
    slow: 500,      // 500ms
  },
  
  // Easing
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// ============================================
// OPACIDADES
// ============================================

const opacity = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.6,
  overlay: 0.5,
};

// ============================================
// EXPORTAR TODO COMO THEME
// ============================================

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  iconSizes,
  buttonSizes,
  inputSizes,
  layout,
  animation,
  opacity,
} as const;

// ============================================
// TIPOS DE TYPESCRIPT
// ============================================

export type Theme = typeof theme;
export type ThemeColors = typeof colors;
export type ThemeSpacing = typeof spacing;
export type ThemeShadows = typeof shadows;

// ============================================
// HELPER PARA OBTENER COLORES DE ESTADO
// ============================================

/**
 * Obtiene el color de fondo según el estado del espacio
 */
export const getEstadoColor = (estado: 'libre' | 'ocupado' | 'mantenimiento' | 'reservado') => {
  return theme.colors.estado[estado] || theme.colors.lightGray;
};

/**
 * Obtiene el color de texto según el estado del espacio
 */
export const getEstadoTextColor = (estado: 'libre' | 'ocupado' | 'mantenimiento' | 'reservado') => {
  const colorMap = {
    libre: theme.colors.success,
    ocupado: theme.colors.danger,
    mantenimiento: theme.colors.warning,
    reservado: theme.colors.info,
  };
  return colorMap[estado] || theme.colors.dark;
};

/**
 * Obtiene el color según el estado de la transacción
 */
export const getTransaccionColor = (estado: 'pagada' | 'pendiente' | 'cancelada') => {
  return theme.colors.transaccion[estado] || theme.colors.lightGray;
};

// ============================================
// EJEMPLO DE USO
// ============================================

/*
import { theme } from '@config/theme';

// En componentes
<View style={{
  backgroundColor: theme.colors.primary,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.lg,
  ...theme.shadows.md,
}}>
  <Text style={theme.typography.h1}>Título</Text>
  <Text style={theme.typography.body}>Contenido</Text>
</View>

// Con styled-components
const Container = styled.View`
  background-color: ${theme.colors.primary};
  padding: ${theme.spacing.md}px;
  border-radius: ${theme.borderRadius.lg}px;
`;

// Usando helpers
<View style={{
  backgroundColor: getEstadoColor('libre'),
}}>
  <Text style={{
    color: getEstadoTextColor('libre'),
  }}>
    Disponible
  </Text>
</View>
*/

// ============================================
// MODO OSCURO (OPCIONAL - PARA FUTURO)
// ============================================

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    // Invertir colores para modo oscuro
    dark: '#FFFFFF',
    white: '#1A1A1A',
    lightGray: '#2C2C2C',
    gray: '#B0B0B0',
    // ... resto de colores adaptados
  },
};