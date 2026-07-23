import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Literal apostrophes/quotes in JSX prose render fine and read cleanly; requiring &apos;/&quot;
      // everywhere (349 hits, almost all in the resources/* educational copy) is pure noise with no
      // safety value. Disabling this is what lets lint be turned on as a real gate for actual bugs.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
