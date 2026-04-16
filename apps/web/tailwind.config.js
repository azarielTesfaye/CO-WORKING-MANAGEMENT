/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui-components/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/feature-desk-booking/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/feature-visitor-checkin/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/feature-announcements/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgb(15 23 42 / 0.06), 0 8px 24px -4px rgb(15 23 42 / 0.08)',
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 12px 40px -8px rgb(15 23 42 / 0.12)',
      },
    },
  },
  plugins: [],
};
