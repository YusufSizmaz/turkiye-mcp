import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/unit/**/*.test.ts"],
    pool: "threads",
    maxWorkers: 2,
  },
});
