import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^(\.\.\/)+shared\/result\.js$/,
        replacement: resolve(__dirname, "../shared/src/result.ts"),
      },
    ],
  },
});
