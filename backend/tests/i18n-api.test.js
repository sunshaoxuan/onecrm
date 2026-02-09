import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtemp, rm } from "node:fs/promises";
import { createApp } from "../src/app.js";

async function startServer() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "onecrm-i18n-"));
  const dataFilePath = path.join(tempDir, "i18n-store.json");
  const server = createApp({ dataFilePath });

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  return {
    baseUrl,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      await rm(tempDir, { recursive: true, force: true });
    }
  };
}

test("GET /api/i18n/languages requires auth", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/i18n/languages`);
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.status, "error");
  assert.equal(body.error_code, "ERR_UNAUTHORIZED");
  await app.close();
});

test("GET /api/i18n/languages returns default languages", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/i18n/languages`, {
    headers: {
      "x-user-id": "u1",
      "x-role": "viewer"
    }
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "success");
  assert.equal(body.data.length >= 3, true);
  await app.close();
});

test("POST /api/i18n/resources updates dictionary and bumps etag", async () => {
  const app = await startServer();

  const before = await fetch(`${app.baseUrl}/api/i18n/ja`, {
    headers: {
      "x-user-id": "admin-1",
      "x-role": "admin"
    }
  });
  assert.equal(before.status, 200);
  const beforeEtag = before.headers.get("etag");

  const save = await fetch(`${app.baseUrl}/api/i18n/resources`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-user-id": "admin-1",
      "x-role": "admin"
    },
    body: JSON.stringify({
      key: "TXT_NEW",
      culture: "ja",
      value: "新しい値",
      force: true
    })
  });

  assert.equal(save.status, 200);
  const saveBody = await save.json();
  assert.equal(saveBody.status, "success");

  const after = await fetch(`${app.baseUrl}/api/i18n/ja`, {
    headers: {
      "x-user-id": "admin-1",
      "x-role": "admin"
    }
  });
  assert.equal(after.status, 200);
  const afterEtag = after.headers.get("etag");
  const dictionary = await after.json();
  assert.equal(dictionary.data.TXT_NEW, "新しい値");
  assert.notEqual(beforeEtag, afterEtag);

  await app.close();
});

test("GET /api/i18n/ja returns 304 with matching etag", async () => {
  const app = await startServer();

  const first = await fetch(`${app.baseUrl}/api/i18n/ja`, {
    headers: {
      "x-user-id": "u1",
      "x-role": "viewer"
    }
  });
  assert.equal(first.status, 200);
  const etag = first.headers.get("etag");
  assert.equal(Boolean(etag), true);

  const second = await fetch(`${app.baseUrl}/api/i18n/ja`, {
    headers: {
      "if-none-match": etag,
      "x-user-id": "u1",
      "x-role": "viewer"
    }
  });
  assert.equal(second.status, 304);

  await app.close();
});
