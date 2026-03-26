import { defineConfig } from "oxlint";

export default defineConfig({
  options: { typeAware: true },

  env: { browser: true },

  categories: { correctness: "error" },

  // Vitest
  overrides: [
    {
      files: ["tests/**/*.test.ts"],
      plugins: ["vitest"],
    },
  ],
});
