import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(new URL('.', import.meta.url)));

export default defineConfig({
  plugins: [react()],
  // root defaults to the directory of this config (client)
  publicDir: path.resolve(__dirname, "../public"),
  build: {
    outDir: path.resolve(__dirname, "../server/public"),
    emptyOutDir: true,
  },
});
