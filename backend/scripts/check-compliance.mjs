import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const srcDir = path.resolve(rootDir, "src");

const violations = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile() && fullPath.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

function report(filePath, message) {
  violations.push(`${path.relative(rootDir, filePath)}: ${message}`);
}

function checkNoDirectSendJson(filePath, content) {
  if (!filePath.includes(`${path.sep}interfaces${path.sep}http${path.sep}`)) {
    return;
  }
  if (filePath.endsWith(`${path.sep}http.js`)) {
    return;
  }

  if (/\bsendJson\s*\(/.test(content)) {
    report(filePath, "禁止在路由层直接调用 sendJson，请使用 ok/fail 封装");
  }
}

function checkNoHardcodedI18nText(filePath, content) {
  const allowList = [
    `${path.sep}domain${path.sep}i18n${path.sep}storeModel.js`,
    `${path.sep}infrastructure${path.sep}i18n${path.sep}FileI18nRepository.js`,
    `${path.sep}infrastructure${path.sep}i18n${path.sep}S3I18nRepository.js`
  ];
  if (allowList.some((suffix) => filePath.endsWith(suffix))) {
    return;
  }

  const cjk = /[\u3040-\u30ff\u3400-\u9fff]/;
  if (cjk.test(content)) {
    report(filePath, "发现 CJK 硬编码，请改为 I18n Key");
  }
}

function checkErrorMessageKeyFormat(filePath, content) {
  if (!filePath.includes(`${path.sep}interfaces${path.sep}http${path.sep}`)) {
    return;
  }
  if (filePath.endsWith(`${path.sep}http.js`)) {
    return;
  }

  const failCallPattern = /fail\([^)]*\)/g;
  const matches = content.match(failCallPattern) || [];
  for (const call of matches) {
    const parts = call.split(",");
    if (parts.length < 4) {
      continue;
    }
    const messagePart = parts[3]?.trim() || "";
    if (/^[a-zA-Z_][a-zA-Z0-9_.]*\)?$/.test(messagePart)) {
      continue;
    }
    if (!/^"([A-Z0-9_]+)"\)?$/.test(messagePart)) {
      report(filePath, `fail message 必须是资源键: ${call}`);
    }
  }
}

async function main() {
  const files = await walk(srcDir);
  for (const filePath of files) {
    const content = await fs.readFile(filePath, "utf8");
    checkNoDirectSendJson(filePath, content);
    checkNoHardcodedI18nText(filePath, content);
    checkErrorMessageKeyFormat(filePath, content);
  }

  if (violations.length > 0) {
    console.error("Backend compliance check failed:");
    for (const item of violations) {
      console.error(`- ${item}`);
    }
    process.exit(1);
  }

  console.log("Backend compliance check passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
