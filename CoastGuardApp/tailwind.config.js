/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: This must match the path to your files
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
