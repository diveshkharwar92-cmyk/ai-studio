import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    setupFiles: ["./src/__tests__/setup.ts"],
    environment: "jsdom",
    globals: true,
    pool: "forks",
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 1,
      },
    },
    server: {
      deps: {
        inline: ["@caffeineai/object-storage"],
      },
    },
  },
});
