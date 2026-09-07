import { execSync, spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const routes = ["/", "/teams", "/events"];

async function run() {
  const basePath =
    process.env.BASE_PATH !== undefined
      ? process.env.BASE_PATH
      : process.env.GITHUB_ACTIONS
        ? "/ITSA-WEB"
        : "";
  process.env.BASE_PATH = basePath;
  process.env.NITRO_PRESET = "node-server";

  console.log(`=== Step 1: Building app with Nitro (BASE_PATH: "${basePath}") ===`);
  execSync("npx vite build", {
    stdio: "inherit",
    env: { ...process.env, NITRO_PRESET: "node-server", BASE_PATH: basePath },
  });

  console.log("\n=== Step 2: Prerendering routes to static HTML ===");
  const server = spawn("node", [".output/server/index.mjs"], {
    env: { ...process.env, PORT: "3456" },
    stdio: "inherit",
  });

  // Wait for server to boot
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://localhost:3456${basePath || "/"}`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  if (!ready) {
    server.kill();
    throw new Error("Server failed to start on port 3456");
  }

  const publicDir = path.resolve(".output/public");

  for (const route of routes) {
    const fetchPath = `${basePath}${route}`.replace(/\/+/g, "/");
    console.log(`Prerendering: ${fetchPath}`);
    const res = await fetch(`http://localhost:3456${fetchPath}`);
    const html = await res.text();

    const targetDir = route === "/" ? publicDir : path.join(publicDir, route.slice(1));
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, "index.html"), html, "utf-8");
  }

  // Create 404.html for GitHub Pages client router fallback
  const indexHtml = await fs.readFile(path.join(publicDir, "index.html"), "utf-8");
  await fs.writeFile(path.join(publicDir, "404.html"), indexHtml, "utf-8");

  // Create .nojekyll so GitHub Pages doesn't ignore assets or run Jekyll
  await fs.writeFile(path.join(publicDir, ".nojekyll"), "", "utf-8");

  console.log("\n=== Step 3: Finished! Static site generated in .output/public ===");
  if (process.platform === "win32") {
    try {
      execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" });
    } catch {}
    process.exit(0);
  } else {
    server.kill("SIGTERM");
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Static build failed:", err);
  process.exit(1);
});
