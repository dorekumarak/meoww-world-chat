/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // WhatsApp-inspired color palette
        'whatsapp-green': '#25D366',
        'whatsapp-dark-green': '#128C7E',
        'whatsapp-teal': '#00A884',
        'whatsapp-blue': '#075E54',
        'whatsapp-light-green': '#DCF8C6',
        'whatsapp-gray': '#8696A0',
        'whatsapp-dark-gray': '#2C3E50',
        'whatsapp-light-gray': '#F7F8FA',
        'whatsapp-white': '#FFFFFF',
        'whatsapp-black': '#111B21',
        'whatsapp-error': '#DC3545',
        'whatsapp-warning': '#FFC107',
        'whatsapp-success': '#28A745',
        'whatsapp-info': '#17A2B8',
        
        // Custom accent colors
        'primary': '#25D366',
        'primary-dark': '#128C7E',
        'secondary': '#075E54',
        'accent': '#00A884',
        'muted': '#8696A0',
        'muted-dark': '#2C3E50',
        'subtle': '#F7F8FA',
        'subtle-dark': '#1A1D23',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
