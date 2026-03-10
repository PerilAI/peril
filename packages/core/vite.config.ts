/// <reference types="vitest/config" />
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
      name: "PerilCore"
    },
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true
  },
  test: {
    include: ["test/**/*.test.ts"]
  }
});

