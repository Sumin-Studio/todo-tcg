import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const SRC_DIR = resolve(process.cwd(), "FINAL booster pack");
const OUT_DIR = resolve(process.cwd(), "public/pack-frames");
const TARGET_WIDTH = 1080;
const TARGET_HEIGHT = 1920;
const WEBP_QUALITY = 90;

if (!existsSync(SRC_DIR)) {
  console.error(`Source directory not found: ${SRC_DIR}`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

const files = (await readdir(SRC_DIR))
  .filter((f) => f.toLowerCase().endsWith(".png"))
  .sort();

if (files.length === 0) {
  console.error(`No PNG files found in ${SRC_DIR}`);
  process.exit(1);
}

console.log(`Processing ${files.length} frames → ${OUT_DIR}`);
const start = Date.now();

let totalOut = 0;
for (let i = 0; i < files.length; i++) {
  const match = files[i].match(/(\d+)\.png$/i);
  if (!match) {
    console.warn(`Skipping unrecognized filename: ${files[i]}`);
    continue;
  }
  const index = parseInt(match[1], 10);
  const outName = String(index).padStart(3, "0") + ".webp";
  const outPath = join(OUT_DIR, outName);

  const info = await sharp(join(SRC_DIR, files[i]))
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "inside" })
    .webp({ quality: WEBP_QUALITY, alphaQuality: 100 })
    .toFile(outPath);

  totalOut += info.size;
  if ((i + 1) % 20 === 0 || i === files.length - 1) {
    process.stdout.write(`  ${i + 1}/${files.length}\r`);
  }
}

const seconds = ((Date.now() - start) / 1000).toFixed(1);
const mb = (totalOut / 1024 / 1024).toFixed(2);
console.log(`\nDone in ${seconds}s. Total output: ${mb} MB`);
