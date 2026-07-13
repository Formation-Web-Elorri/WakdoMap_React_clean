import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  // Resolves the "@/*" path alias declared in tsconfig.json
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    // Must come before viteReact()
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "./src/server.ts" },
    }),
    viteReact(),
    nitro(),
  ],
});
