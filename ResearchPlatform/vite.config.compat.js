const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");
const path = require("path");

// Use __dirname instead of import.meta.dirname (CJS compatible)
const rootDir = __dirname;

module.exports = defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "client", "src"),
      "@shared": path.resolve(rootDir, "shared"),
      "@assets": path.resolve(rootDir, "attached_assets"),
    },
  },
  root: path.resolve(rootDir, "client"),
  build: {
    outDir: path.resolve(rootDir, "dist/public"),
    emptyOutDir: true,
  },
});