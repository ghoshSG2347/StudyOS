import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "./_generated/server": path.resolve(__dirname, "tests/mocks/server.ts"),
      "../_generated/server": path.resolve(__dirname, "tests/mocks/server.ts"),
      "./_generated/api": path.resolve(__dirname, "tests/mocks/api.ts"),
      "./_generated/dataModel": path.resolve(__dirname, "tests/mocks/dataModel.ts"),
    },
  },
});
