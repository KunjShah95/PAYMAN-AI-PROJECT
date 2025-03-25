/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            lineClamp: {
                2: '2',
                3: '3',
                4: '4',
            },
            colors: {
                dark: {
                    primary: '#1e293b',
                    secondary: '#334155',
                    accent: '#3b82f6',
                }
            }
        },
    },
    plugins: [],
};