import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/@core/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/@core/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'primary' : '#0057b7'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      screens: {
        "2xl": { max: "1535px" },  
        xl: { max: "1279px" },  
        lg: { max: "1023px" },  
        md: { max: "767px" },  
        sm: { max: "639px" },
      },
    },
  },
  plugins: [],
};
export default config;
