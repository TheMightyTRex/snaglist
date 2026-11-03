// ESLint settings for tools/security-scan.sh: only the security rules, so style is never flagged.
import globals from "globals";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import security from "eslint-plugin-security";

export default [
  {
    files: ["src/**/*.js", "src/**/*.mjs"],
    languageOptions: { ecmaVersion: "latest", sourceType: "script", globals: { ...globals.browser, ...globals.node } },
    plugins: { "no-unsanitized": noUnsanitized, security },
    rules: {
      ...security.configs.recommended.rules,
      // Flags every obj[key]. All 24 places were read on 3 November 2026: each key is a fixed name in Snaglist or a
      // setting the site itself chose, never text from a visitor, so it only adds noise.
      "security/detect-object-injection": "off",
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
    },
  },
  { files: ["src/**/*.mjs", "src/github-worker.js"], languageOptions: { sourceType: "module" } },
];
