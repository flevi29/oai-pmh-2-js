import type { Config } from "prettier";

const config: Config = {
  overrides: [
    {
      files: "*.{html,svelte}",
      options: {
        parser: "svelte",
        plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
        tailwindStylesheet: "./app/src/app.css",
      },
    },
  ],
};

export default config;
