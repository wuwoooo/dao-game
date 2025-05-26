import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/daogame-admin/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Removed server.proxy configuration as baseURL now contains the full path
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:8081',
  //       changeOrigin: true,
  //     }
  //   }
  // }
});
