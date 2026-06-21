import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setupTests.ts"],
    include: ["src/**/*.test.{ts,tsx}", "src/tests/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}", "src/tests/**/*.spec.{ts,tsx}"],
    coverage: {
      provider: "c8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/tests/**", "src/**/*.d.ts"],
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
