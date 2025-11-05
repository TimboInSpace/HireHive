// scripts/clean-dev.js
import { rmSync, existsSync } from "fs";
import { execSync } from "child_process";

const dirs = [".next", "node_modules/.cache"];

for (const dir of dirs) {
    if (existsSync(dir)) {
        console.log(`🧹 Removing ${dir}...`);
        rmSync(dir, { recursive: true, force: true });
    }
}

console.log("🚀 Starting Next.js with fresh cache...");
execSync("NEXT_FORCE_TURBOPACK=1 npm run dev -- --no-cache", {
    stdio: "inherit",
});

