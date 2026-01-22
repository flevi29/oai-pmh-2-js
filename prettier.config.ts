import type { Config } from "prettier";

const plugins: Config["plugins"] = ["prettier-plugin-jsdoc"];

const config: Config = {
  overrides: [
    {
      files: "*.{html,svelte}",
      options: {
        parser: "svelte",
        plugins: ["prettier-plugin-svelte", ...plugins],
      },
    },
  ],
  plugins,
};

export default config;
