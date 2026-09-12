import { fileURLToPath, URL as NodeURL } from "node:url";
import { loadEnv, defineConfig as defineViteConfig, mergeConfig, type UserConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";

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

  if (env.command === "build") {
    const { nitro } = await import("nitro/vite");
    viteConfig.plugins!.push(
      nitro({
        handlers: [
          {
            route: "/api/auto-reply",
            handler: "../backend/api/auto-reply.ts",
          },
        ],
      }),
    );
  }

  const loadedEnv = loadEnv(env.mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return mergeConfig(viteConfig, { define: envDefine });
});
