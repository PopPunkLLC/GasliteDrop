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
        congrats: "url('/congrats-modal-bg.svg')",
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        legacy: {
          // TODO rename this
          white: "#FAFAFA",
          "neutral-900": "#050505",
          "base-100": "#ffffff",
        },
        neutral: {
          0: "#FFFFFF",
          400: "#898896",
          700: "#27262C",
          800: "#131316",
          900: "#050505",
        },
        primary: "#FF00FE",
        black: "#000000",
        white: "#F5F5F5",
        grey: "#4C4C4C",
        critical: "#FFB1B9",
        markPink: {
          DEFAULT: "#FF33FE",
          900: "#FF00FE",
          800: "#FF1BFE",
          700: "#FF33FE",
          600: "#FF4DFE",
          500: "#FF66FE",
          400: "#FF99FF",
          300: "#FFB2FF",
          200: "#FFCCFF",
          100: "#FFE5FF",
        },
        tomPink: {
          900: "#F244AD",
          800: "#F357B5",
          700: "#F56ABD",
          600: "#F67CC6",
          500: "#F78FCE",
          400: "#FBB4DE",
          300: "#FBC7E6",
          200: "#FCDAEF",
          100: "#FEECF7",
        },
        blk: {
          // maybe dont use this?
          900: "#424242",
          800: "#555555",
          700: "#686868",
          600: "#7B7B7B",
          500: "#8E8E8E",
          400: "#B3B3B3",
          300: "#C6C6C6",
          200: "#D9D9D9",
          100: "#ECECEC",
        },
      },
      fontFamily: {
        display: ["Inter Display", "Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        alarm: ["'Alarm Clock'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
