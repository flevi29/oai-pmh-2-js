import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  server: { host: "127.0.0.1", port: 5173 },
  plugins: [sveltekit()],
});
