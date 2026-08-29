import next from "eslint-config-next";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = [
  ...next,
  {
    ignores: ["src/components/ui/**", "src/components/magicui/**", ".source/**"],
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "@next/next/no-img-element": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
];

export default eslintConfig;
