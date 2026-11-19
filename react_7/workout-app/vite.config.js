import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pwaPrecache from "./pwa-precache-plugin.js";

export default defineConfig({
  plugins: [react(), pwaPrecache()],
});
