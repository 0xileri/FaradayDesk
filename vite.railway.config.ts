import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
export default defineConfig(({ isSsrBuild }) => ({
  root: isSsrBuild ? "." : "railway",
  publicDir: isSsrBuild ? false : path.resolve("public"),
  plugins: isSsrBuild ? [] : [react()],
  resolve: { alias: { "@": path.resolve(".") } },
  build: {
    outDir: path.resolve(
      isSsrBuild ? "railway-dist/server" : "railway-dist/client",
    ),
    emptyOutDir: true,
    copyPublicDir: !isSsrBuild,
  },
}));
