import type { Config } from "prettier";

const config: Config = {
  overrides: [
    {
      files: "*.{html,svelte}",
      options: {
        parser: "svelte",
        plugins: ["prettier-plugin-svelte"],
      },
    },
  ],
};

export default config;
