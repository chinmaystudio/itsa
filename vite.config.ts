import { fileURLToPath, URL as NodeURL } from "node:url";
import { loadEnv, defineConfig as defineViteConfig, mergeConfig, type UserConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";

/**
 * Plain Vite config for TanStack Start (no third-party config wrapper).
 *
 * Mirrors the previous wrapper's behaviour:
 *  - tanstackStart handles file-based routes + server functions (SSR via Nitro).
 *  - nitro builds the server target (Vercel preset is set via NITRO_PRESET env;
 *    `scripts/build-static.mjs` sets `node-server` for static prerendering).
 *  - `src/server.ts` is the SSR entry that wraps the Nitro server entry.
 *  - `@/*` maps to `src/*`, matching `tsconfig.json` paths.
 */
export default defineViteConfig(async (env) => {
  const viteConfig: UserConfig = {
    base: process.env["BASE_PATH"] ? `${process.env["BASE_PATH"]}/` : "/",
    plugins: [
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tailwindcss(),
      tanstackStart({
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: {
            files: ["**/server/**"],
            specifiers: ["server-only"],
          },
        },
      }),
      react(),
    ],
    css: {
      transformer: "lightningcss",
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new NodeURL("./src", import.meta.url)),
      },
      dedupe: ["react", "react-dom", "@tanstack/react-query"],
    },
    server: {
      host: "::",
      port: 8080,
    },
  };

  // Build the deployable server bundle with Nitro (client assets + server output).
  if (env.command === "build") {
    const { nitro } = await import("nitro/vite");
    viteConfig.plugins!.push(
      nitro({
        handlers: [
          {
            route: "/api/auto-reply",
            handler: "./server/api/auto-reply.ts",
          },
        ],
      }),
    );
  }

  // Inject VITE_* env vars, matching the previous wrapper's envDefine behaviour.
  const loadedEnv = loadEnv(env.mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return mergeConfig(viteConfig, { define: envDefine });
});
