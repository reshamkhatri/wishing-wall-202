/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                hand: ['Caveat', 'cursive'],
                sans: ['Poppins', 'sans-serif'],
            },
            colors: {
                'deep-space': '#0a0a0f',
                'card-bg': '#111827',
                'accent-green': '#10b981',
            },
        },
    },
    plugins: [],
}
