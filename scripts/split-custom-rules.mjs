import fs from "node:fs/promises";

const sourcePath = new URL("../custom.list", import.meta.url);
const outputDir = new URL("../generated/", import.meta.url);
const source = await fs.readFile(sourcePath, "utf8");
const groups = new Map();

for (const rawLine of source.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;

  const parts = line.split(",");
  if (parts.length < 3) {
    throw new Error(`Invalid custom rule: ${line}`);
  }

  const target = parts.at(-1);
  if (!target || /[\r\n]/.test(target)) {
    throw new Error(`Missing custom rule target: ${line}`);
  }

  if (!groups.has(target)) groups.set(target, []);
  groups.get(target).push(parts.slice(0, -1).join(","));
}

const fileNames = {
  DIRECT: "custom-direct.list",
  OPENAI: "custom-openai.list",
  "🚀 节点选择": "custom-proxy.list",
  "📲 电报消息": "custom-telegram.list",
  "📺 哔哩哔哩": "custom-bilibili.list",
  "📺 巴哈姆特": "custom-bahamut.list",
};

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const [target, rules] of groups) {
  const fileName = fileNames[target];
  if (!fileName) throw new Error(`No output filename configured for: ${target}`);
  await fs.writeFile(
    new URL(fileName, outputDir),
    `${rules.join("\n")}\n`,
    "utf8"
  );
}

console.log(
  [...groups.entries()]
    .map(([target, rules]) => `${target}: ${rules.length}`)
    .join("\n")
);
