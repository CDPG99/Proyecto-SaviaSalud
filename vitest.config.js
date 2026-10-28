import { defineConfig } from "vitest/config";
export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,jsx}"],
      reporter: ["text", "html"],
      exclude: ["src/test/**", "src/__tests__/**", "src/main.jsx"],
    },
  },
});
