/**
 * Door2Door Web App Theme
 * Colors aligned with the web app white + orange brand theme
 */

// Door2Door Brand Colors - White + Orange Theme
export const colors = {
  // Base colors
  text: '#252525',
  background: '#FFFFFF',
  
  // Primary brand color - Orange
  primary: '#F57C20',
  primaryHover: '#D9681B',
  primaryLight: '#FF9A52',
  primaryForeground: '#FFFFFF',
  
  // Secondary - soft orange tint
  secondary: '#FFF4EC',
  secondaryHover: '#FFEADB',
  secondaryForeground: '#374151',
  
  // Accent
  accent: '#FFF4EC',
  accentForeground: '#F57C20',
  
  // Muted/Gray
  muted: '#F9FAFB', // Gray-50
  mutedForeground: '#9CA3AF', // Gray-400
  
  // Status colors
  success: '#10B981', // Green-500
  successLight: '#D1FAE5', // Green-100
  warning: '#F59E0B', // Amber-500
  warningLight: '#FEF3C7', // Amber-100
  destructive: '#EF4444', // Red-500
  destructiveLight: '#FEE2E2', // Red-100
  destructiveForeground: '#FFFFFF',
  info: '#3B82F6', // Blue-500
  infoLight: '#DBEAFE', // Blue-100
  
  // Border and input
  border: '#E5E7EB', // Gray-200
  borderDark: '#D1D5DB', // Gray-300
  input: '#E5E7EB',
  inputFocus: '#F57C20',
  
  // Card
  card: '#FFFFFF',
  cardBorder: '#F3F4F6', // Gray-100
  cardHover: '#FAFAFA',
  
  // Table
  tableHeader: '#F9FAFB',
  tableRowHover: '#FFF4EC',
  
  // Sidebar
  sidebarBg: '#FFFFFF',
  sidebarActive: '#F57C20',
  sidebarHover: '#FFF4EC',
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  xxl: '3rem',      // 48px
};

export const borderRadius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',
};

export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  md: '1rem',       // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  xxl: '1.5rem',    // 24px
  xxxl: '2rem',     // 32px
};

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
};

// CRM-specific theme utilities
export const crmTheme = {
  pageBackground: '#FAFAFA',
  contentBackground: '#FFFFFF',
  headerHeight: '64px',
  sidebarWidth: '240px',
  maxContentWidth: '1400px',
};
