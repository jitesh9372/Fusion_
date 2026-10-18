/**
 * FUSION Site Configuration
 * Central place for all site identity strings.
 * Update this file to rebrand — no other files need to change.
 */

export const siteConfig = {
  name: 'FUSION',
  tagline: 'Skills. Services. Stronger Communities.',
  description:
    'A cooperative service marketplace connecting customers, skilled workers, and cooperative managers.',
  version: '1.0.0',
  copyright: `© ${new Date().getFullYear()} FUSION. Skills. Services. Stronger Communities.`,
  supportEmail: 'support@fusion.app',
  urls: {
    frontend: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5173',
    api: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001',
  },
} as const;

export type SiteConfig = typeof siteConfig;
