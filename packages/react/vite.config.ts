/// <reference types="vitest/config" />
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
      name: "PerilReact"
    },
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: ["@peril-ai/core", "react", "react-dom"]
    }
  },
  test: {
    alias: {
      "@peril-ai/core": resolve(__dirname, "../core/src/index.ts")
    },
    include: ["test/**/*.test.ts"]
  }
});
