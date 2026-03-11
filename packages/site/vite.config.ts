import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: "github-dark-dimmed",
            keepBackground: false,
          },
        ],
      ],
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 4000,
    open: true,
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
  },
});
