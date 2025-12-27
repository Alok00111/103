/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neon-green': '#39FF14',
                'hot-pink': '#FF69B4',
                'brainrot-black': '#0a0a0a',
                'brainrot-dark': '#1a1a1a',
                'brainrot-gray': '#2a2a2a',
            },
            fontFamily: {
                'brainrot': ['Comic Sans MS', 'cursive'],
            },
        },
    },
    plugins: [],
}
