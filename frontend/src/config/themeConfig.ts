/**
 * FUSION Theme Configuration
 * All design tokens in one place.
 * Update colors, typography, or spacing here — no components need to change.
 *
 * Also consumed by Tailwind config (tailwind.config.js) for class generation.
 */

export const themeConfig = {
  colors: {
    // Brand
    primary: {
      50:  '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1', // Main brand color
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
    accent: {
      400: '#e879f9',
      500: '#d946ef', // Purple accent
      600: '#c026d3',
    },

    // Surfaces (dark theme default)
    background: '#0a0a0f',
    surface: {
      900: '#0a0a0f',
      800: '#0f0f1a',
      700: '#141426',
      600: '#1a1a33',
      500: '#1f1f3d',
    },

    // Text
    text: {
      primary:   'rgba(255, 255, 255, 0.95)',
      secondary: 'rgba(255, 255, 255, 0.60)',
      muted:     'rgba(255, 255, 255, 0.35)',
      inverse:   '#0a0a0f',
    },

    // Semantic
    success: '#10b981',
    warning: '#f59e0b',
    error:   '#ef4444',
    info:    '#3b82f6',

    // Glass
    glass: {
      background: 'rgba(255, 255, 255, 0.06)',
      border:     'rgba(255, 255, 255, 0.10)',
      hover:      'rgba(255, 255, 255, 0.10)',
    },
  },

  typography: {
    fontFamily: {
      sans:    "'Inter', system-ui, sans-serif",
      display: "'Inter', system-ui, sans-serif",
      mono:    "'Fira Code', 'Cascadia Code', monospace",
    },
    fontWeight: {
      light:    300,
      normal:   400,
      medium:   500,
      semibold: 600,
      bold:     700,
      extrabold:800,
      black:    900,
    },
  },

  borderRadius: {
    sm:  '8px',
    md:  '12px',
    lg:  '16px',
    xl:  '20px',
    '2xl': '24px',
    full: '9999px',
  },

  shadows: {
    glow:       '0 0 30px rgba(99, 102, 241, 0.4)',
    glowLg:     '0 0 60px rgba(99, 102, 241, 0.5)',
    glowAccent: '0 0 30px rgba(217, 70, 239, 0.4)',
    glass:      '0 8px 32px rgba(0, 0, 0, 0.4)',
    card:       '0 20px 60px rgba(0, 0, 0, 0.5)',
  },

  // 3D visual parameters
  visual3d: {
    perspective: '1000px',
    coreSize: '120px',
    ringCount: 3,
    particleCountDesktop: 25,
    particleCountMobile:  10,
  },
} as const;

export type ThemeConfig = typeof themeConfig;
