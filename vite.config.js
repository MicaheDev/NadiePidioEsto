import { defineConfig } from "vite";
import markoRun from "@marko/run/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    markoRun(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "src/content/**/*",
          dest: "content",
        },
      ],
    }),
  ],
});
