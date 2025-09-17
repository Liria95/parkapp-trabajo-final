import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints detallados
export const breakpoints = {
  isSmallPhone: width < 360,
  isMediumPhone: width >= 360 && width < 414,
  isLargePhone: width >= 414 && width < 768,
  isTablet: width >= 768 && width < 1024,
  isLargeTablet: width >= 1024 && width < 1440,
  isDesktop: width >= 1440,
  isLandscape: width > height,
};

// Función para escala responsive inteligente
export const getResponsiveSize = (baseSize: number): number => {
  const minScale = 0.75;
  const maxScale = 1.6;
  let scale: number;
  
  if (breakpoints.isDesktop) {
    scale = Math.min(baseSize * 1.4, baseSize * maxScale);
  } else if (breakpoints.isLargeTablet) {
    scale = Math.min(baseSize * 1.3, baseSize * maxScale);
  } else if (breakpoints.isTablet) {
    scale = Math.min(baseSize * 1.2, baseSize * maxScale);
  } else if (breakpoints.isLargePhone) {
    scale = Math.min(baseSize * 1.1, baseSize * maxScale);
  } else if (breakpoints.isMediumPhone) {
    scale = baseSize;
  } else {
    scale = Math.max(baseSize * 0.9, baseSize * minScale);
  }
  
  return scale;
};

// Función para espaciado dinámico
export const getDynamicSpacing = (baseSpacing: number): number => {
  if (breakpoints.isSmallPhone) return getResponsiveSize(baseSpacing * 0.8);
  if (breakpoints.isDesktop) return getResponsiveSize(baseSpacing * 1.2);
  return getResponsiveSize(baseSpacing);
};