import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pwaPrecache from "./pwa-precache-plugin.js";

export default defineConfig({
  plugins: [react(), pwaPrecache()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase")) {
            return "firebase";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
