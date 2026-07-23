import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/*
  Unit tests for the authorization core. Node environment, no DB: the security
  rules are pure functions, so the whole policy surface is testable deterministically.
  `@` resolves to the project root to match the tsconfig path alias.
*/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
