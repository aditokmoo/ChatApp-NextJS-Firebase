import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: '#FF6596',
        'light-primary': '#8c3c56',
        'light-dark': '#2e3042',
        dark: '#2F3245',
        green: '#21c246',
        red: '#c71818',
        'rgba-dark': 'rgba(46, 50, 69, 0.3)'
      }
    },
  },
  plugins: [],
};
export default config;
