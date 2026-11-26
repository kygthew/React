import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pwaPrecache from "./pwa-precache-plugin.js";

export default defineConfig({
  plugins: [react(), pwaPrecache()],
  build: {
    rollupOptions: {
      output: {
        // Split libraries into separate files: they change rarely,
        // so browsers keep them cached when only our code is updated.
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
    // Firebase SDK alone is ~500 kB, so the default 500 kB warning is expected
    chunkSizeWarningLimit: 700,
  },
});