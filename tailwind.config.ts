import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#12122a",
          hover: "#1e1e3f",
          active: "#2a2a5e",
          text: "#a0a0c0",
          "text-active": "#ffffff",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
        },
        agent: {
          bg: "#f3e8ff",
          border: "#d8b4fe",
        },
      },
    },
  },
  plugins: [],
};
export default config;
