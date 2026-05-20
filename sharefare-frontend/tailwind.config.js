/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563EB",
          accent: "#10B981",
          purple: "#7C3AED"
        }
      },
      boxShadow: {
        product: "0 18px 50px -32px rgba(15, 23, 42, 0.35)"
      },
      borderRadius: {
        product: "1rem"
      }
    }
  },
  plugins: []
};
