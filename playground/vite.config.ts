import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  server: { host: "127.0.0.1" },
  plugins: [sveltekit()],
});
