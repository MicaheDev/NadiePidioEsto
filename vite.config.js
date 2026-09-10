import { defineConfig } from "vite";
import markoRun from "@marko/run/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    markoRun(),
    tailwindcss()
  ]
});
