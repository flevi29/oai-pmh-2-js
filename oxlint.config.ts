import { defineConfig } from "oxlint";

export default defineConfig({
  options: { typeAware: true },

  env: { browser: true },

  categories: { correctness: "error" },
});
