import tsconfig from "./tsconfig.json" with { type: "json" };
import { basename, extname } from "node:path";
import { defineConfig } from "vite";

const entry = "./src/index.ts";

export default defineConfig({
  build: {
    sourcemap: true,
    target: tsconfig.compilerOptions.target,
    lib: {
      entry,
      formats: ["es"],
      fileName: basename(entry, extname(entry)),
    },
  },
});
