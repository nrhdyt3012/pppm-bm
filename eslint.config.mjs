import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: [".next/**"] },  // 👈 tambahkan ini
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

eslintConfig.push({
  rules: {
    "react-hooks/exhaustive-deps": "off",
    "react/jsx-key": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/ban-ts-comment": "off",  // 👈 opsional: matikan rule-nya sekalian
  },
});

export default eslintConfig;