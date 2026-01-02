/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6d0b1a', // Deep Maroon from design
                    light: '#8e1b2c',
                    dark: '#4a0510',
                },
                secondary: {
                    DEFAULT: '#f3f4f6', // Light gray background
                    dark: '#e5e7eb',
                },
                accent: {
                    DEFAULT: '#d4af37', // Gold/Bronze accent often found in school logos
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Professional, clean font
                serif: ['Merriweather', 'serif'], // For headings/Founder message
                handwriting: ['Dancing Script', 'cursive'], // For signatures
            },
        },
    },
    plugins: [],
}
