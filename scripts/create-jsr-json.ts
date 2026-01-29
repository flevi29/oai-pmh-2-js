import { writeFileSync } from "node:fs";
import pkg from "../package.json" with { type: "json" };

const {
  name,
  version,
  license,
  publishConfig: { exports },
  files,
} = pkg;

writeFileSync(
  new URL("../jsr.json", import.meta.url),
  JSON.stringify(
    {
      $schema: "https://jsr.io/schema/config-file.v1.json",
      name: `@fole/${name}`,
      version,
      license,
      exports: Object.fromEntries(
        Object.entries(exports).map(([key, val]) => [
          key,
          val.import.replace("dist/esm", "src").replace(/\.js$/, ".ts"),
        ]),
      ),
      publish: { include: files.filter((v) => !v.includes("dist")) },
    },
    null,
    2,
  ) + "\n",
);
