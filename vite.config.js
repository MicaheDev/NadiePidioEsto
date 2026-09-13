import { defineConfig } from "vite";
import markoRun from "@marko/run/vite";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";

/** @type {RollupOptions} */
export default defineConfig({
  plugins: [
    markoRun(),
    tailwindcss(),
    mdx({
      /* jsxImportSource: …, otherOptions… */
    }),
  ],


});
