export default {
  plugins: {
    "@tailwindcss/postcss": {
      // Enable optimization in production to reduce CSS processing overhead
      optimize: process.env.NODE_ENV === "production",
      // Note: File exclusions handled via @source not in styles/globals.css
      // (Tailwind v4 ignores content.exclude - uses @source directive instead)
    },
  },
}
