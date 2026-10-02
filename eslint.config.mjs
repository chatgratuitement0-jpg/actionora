import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { rules: {\n    "@typescript-eslint/no-explicit-any": "warn",\n    "@next/next/no-html-link-for-pages": "warn",\n    "react/no-unescaped-entities": "warn",\n    "react-hooks/set-state-in-effect": "warn",\n  } },\n  globalIgnores([
    ".next/**",
    "node_modules/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
