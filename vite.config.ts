import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "client",
  publicDir: path.resolve(process.cwd(), "public"),
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@assets": path.resolve(process.cwd(), "client", "src", "assets"),
    },
  },
  build: {
    outDir: path.resolve(process.cwd(), "server", "public"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(process.cwd(), "client", "index.html"),
    },
  },
});
