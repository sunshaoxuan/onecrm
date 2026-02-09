import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtemp, rm } from "node:fs/promises";
import { createApp } from "../src/app.js";

async function startServer(options = {}) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "onecrm-backend-"));
  const dataFilePath = path.join(tempDir, "i18n-store.json");
  const server = createApp({
    dataFilePath,
    setupInitialized: true,
    setupMaintenance: false,
    ...options
  });

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

async function login(baseUrl, username = "admin", password = "secret_password") {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return response;
}

test("GET /api/setup/admin returns setup state", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/setup/admin`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "success");
  assert.equal(body.data.exists, true);
  await app.close();
});

test("GET /api/setup/admin returns maintenance error", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "onecrm-backend-maintenance-"));
  const dataFilePath = path.join(tempDir, "i18n-store.json");
  const server = createApp({ dataFilePath, setupMaintenance: true });
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/setup/admin`);
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.error_code, "SYS_MAINTENANCE");
  await new Promise((resolve) => server.close(resolve));
  await rm(tempDir, { recursive: true, force: true });
});

test("POST /api/auth/login success + GET /api/auth/me success", async () => {
  const app = await startServer();
  const loginResponse = await login(app.baseUrl);
  assert.equal(loginResponse.status, 200);

  const loginBody = await loginResponse.json();
  const accessToken = loginBody.data.accessToken;
  const refreshToken = loginBody.data.refreshToken;
  assert.equal(typeof accessToken, "string");
  assert.equal(typeof refreshToken, "string");

  const meResponse = await fetch(`${app.baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  assert.equal(meResponse.status, 200);
  const meBody = await meResponse.json();
  assert.equal(meBody.data.username, "admin");
  assert.equal(Array.isArray(meBody.data.roles), true);

  await app.close();
});

test("POST /api/auth/login fails with invalid credentials", async () => {
  const app = await startServer();
  const response = await login(app.baseUrl, "admin", "wrongpass");
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.status, "error");
  assert.equal(body.error_code, "AUTH_INVALID_CREDENTIALS");
  await app.close();
});

test("POST /api/auth/login fails with missing field", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "" })
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error_code, "AUTH_MISSING_FIELD");
  await app.close();
});

test("POST /api/auth/refresh returns new tokens", async () => {
  const app = await startServer();
  const loginResponse = await login(app.baseUrl);
  const loginBody = await loginResponse.json();
  const refreshToken = loginBody.data.refreshToken;

  const refreshResponse = await fetch(`${app.baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  assert.equal(refreshResponse.status, 200);
  const refreshBody = await refreshResponse.json();
  assert.equal(refreshBody.status, "success");
  assert.notEqual(refreshBody.data.accessToken, loginBody.data.accessToken);
  assert.notEqual(refreshBody.data.refreshToken, loginBody.data.refreshToken);

  await app.close();
});

test("GET /api/auth/me returns token invalid without bearer", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/auth/me`);
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.error_code, "AUTH_TOKEN_INVALID");
  await app.close();
});

test("POST /api/auth/refresh fails with invalid token", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: "invalid" })
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error_code, "AUTH_REFRESH_TOKEN_INVALID");
  await app.close();
});

test("POST /api/auth/logout is idempotent", async () => {
  const app = await startServer();
  const loginResponse = await login(app.baseUrl);
  const loginBody = await loginResponse.json();
  const accessToken = loginBody.data.accessToken;
  const refreshToken = loginBody.data.refreshToken;

  const logout1 = await fetch(`${app.baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ refreshToken })
  });
  assert.equal(logout1.status, 200);

  const logout2 = await fetch(`${app.baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ refreshToken })
  });
  assert.equal(logout2.status, 200);
  const body = await logout2.json();
  assert.equal(body.status, "success");
  assert.equal(body.data, null);

  await app.close();
});

test("POST /api/auth/logout requires bearer", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: "xxx" })
  });
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.error_code, "AUTH_TOKEN_INVALID");
  await app.close();
});

test("POST /api/auth/password/reset-link returns success for registered email", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/auth/password/reset-link`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "admin@onecrm.local" })
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "success");
  assert.equal(body.data, null);
  await app.close();
});

test("POST /api/auth/password/reset-link returns success for unknown email", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/auth/password/reset-link`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "unknown@example.com" })
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "success");
  assert.equal(body.data, null);
  await app.close();
});

test("POST /api/auth/password/reset-link validates email", async () => {
  const app = await startServer();
  const emptyEmail = await fetch(`${app.baseUrl}/api/auth/password/reset-link`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "" })
  });
  assert.equal(emptyEmail.status, 400);
  const emptyBody = await emptyEmail.json();
  assert.equal(emptyBody.error_code, "AUTH_EMAIL_REQUIRED");

  const invalidEmail = await fetch(`${app.baseUrl}/api/auth/password/reset-link`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "invalid" })
  });
  assert.equal(invalidEmail.status, 400);
  const invalidBody = await invalidEmail.json();
  assert.equal(invalidBody.error_code, "AUTH_EMAIL_INVALID");

  await app.close();
});

test("POST /api/auth/password/reset-link returns 429 with retryAfterSeconds", async () => {
  const app = await startServer();
  for (let i = 0; i < 5; i += 1) {
    const okResponse = await fetch(`${app.baseUrl}/api/auth/password/reset-link`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin@onecrm.local" })
    });
    assert.equal(okResponse.status, 200);
  }

  const limited = await fetch(`${app.baseUrl}/api/auth/password/reset-link`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "admin@onecrm.local" })
  });
  assert.equal(limited.status, 429);
  const limitedBody = await limited.json();
  assert.equal(limitedBody.error_code, "AUTH_RATE_LIMITED");
  assert.equal(typeof limitedBody.retryAfterSeconds, "number");
  assert.equal(limitedBody.retryAfterSeconds > 0, true);

  await app.close();
});

test("POST /api/auth/password/reset-link returns 500 when sender fails", async () => {
  const app = await startServer({
    passwordResetSender: async () => {
      throw new Error("mail service unavailable");
    }
  });

  const response = await fetch(`${app.baseUrl}/api/auth/password/reset-link`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "admin@onecrm.local" })
  });
  assert.equal(response.status, 500);
  const body = await response.json();
  assert.equal(body.error_code, "SYS_INTERNAL_ERROR");
  await app.close();
});

test("GET /api/i18n/resources is public and supports etag", async () => {
  const app = await startServer();
  const first = await fetch(`${app.baseUrl}/api/i18n/resources?lang=ja`);
  assert.equal(first.status, 200);
  const etag = first.headers.get("etag");
  const body = await first.json();
  assert.equal(body.status, "success");
  assert.equal(typeof body.meta.version, "string");
  assert.equal(body.meta.lang, "ja");

  const second = await fetch(`${app.baseUrl}/api/i18n/resources?lang=ja`, {
    headers: { "If-None-Match": etag }
  });
  assert.equal(second.status, 304);
  await app.close();
});

test("GET /api/i18n/version returns version", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/i18n/version`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "success");
  assert.equal(typeof body.data.version, "number");
  await app.close();
});

test("GET /api/i18n/resources returns unsupported language error", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/i18n/resources?lang=fr`);
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error_code, "I18N_LANG_NOT_SUPPORTED");
  await app.close();
});

test("POST /api/i18n/resources requires admin bearer and supports batch upsert", async () => {
  const app = await startServer();
  const loginResponse = await login(app.baseUrl);
  const loginBody = await loginResponse.json();
  const accessToken = loginBody.data.accessToken;

  const saveResponse = await fetch(`${app.baseUrl}/api/i18n/resources`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      lang: "zh",
      force: true,
      items: {
        AUTH_PANEL_LOGIN_BTN: "登录",
        AUTH_PANEL_TITLE: "登录"
      }
    })
  });

  assert.equal(saveResponse.status, 200);
  const saveBody = await saveResponse.json();
  assert.equal(saveBody.status, "success");
  assert.equal(saveBody.data.processed, 2);

  const resources = await fetch(`${app.baseUrl}/api/i18n/resources?lang=zh`);
  const resourcesBody = await resources.json();
  assert.equal(resourcesBody.data.auth.panel_login_btn, "登录");

  await app.close();
});

test("GET /api/i18n/resources returns forget namespace for PROD-08 keys", async () => {
  const app = await startServer();
  const loginResponse = await login(app.baseUrl);
  const loginBody = await loginResponse.json();
  const accessToken = loginBody.data.accessToken;

  const saveResponse = await fetch(`${app.baseUrl}/api/i18n/resources`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      lang: "en",
      force: false,
      module: "forget",
      items: {
        LBL_FORGET_PAGE_TITLE: "Reset Password",
        ERR_FORGET_RATE_LIMITED: "Retry in {{seconds}} seconds"
      }
    })
  });
  assert.equal(saveResponse.status, 200);

  const resources = await fetch(`${app.baseUrl}/api/i18n/resources?lang=en`);
  assert.equal(resources.status, 200);
  const body = await resources.json();
  assert.equal(body.data.forget.page_title, "Reset Password");
  assert.equal(body.data.forget.rate_limited, "Retry in {{seconds}} seconds");

  await app.close();
});

test("POST /api/i18n/resources returns 403 without admin bearer", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/i18n/resources`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      lang: "zh",
      force: true,
      items: { AUTH_PANEL_LOGIN_BTN: "登录" }
    })
  });
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.equal(body.error_code, "ERR_FORBIDDEN");
  await app.close();
});

test("POST /api/i18n/resources returns protected key conflict when force=false", async () => {
  const app = await startServer();
  const loginResponse = await login(app.baseUrl);
  const loginBody = await loginResponse.json();
  const accessToken = loginBody.data.accessToken;

  const firstInsert = await fetch(`${app.baseUrl}/api/i18n/resources`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      lang: "zh",
      force: true,
      items: {
        APP_TITLE: "OneCRM"
      }
    })
  });
  assert.equal(firstInsert.status, 200);

  const response = await fetch(`${app.baseUrl}/api/i18n/resources`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      lang: "zh",
      force: false,
      items: {
        APP_TITLE: "OneCRM 2"
      }
    })
  });
  assert.equal(response.status, 409);
  const body = await response.json();
  assert.equal(body.error_code, "I18N_KEY_PROTECTED");
  await app.close();
});

test("POST /api/i18n/resources returns 400 when lang is not supported", async () => {
  const app = await startServer();
  const loginResponse = await login(app.baseUrl);
  const loginBody = await loginResponse.json();
  const accessToken = loginBody.data.accessToken;

  const response = await fetch(`${app.baseUrl}/api/i18n/resources`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      lang: "",
      force: true,
      items: { AUTH_PANEL_LOGIN_BTN: "x" }
    })
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error_code, "I18N_LANG_NOT_SUPPORTED");
  await app.close();
});

test("POST /api/i18n/resources returns 400 when items is invalid", async () => {
  const app = await startServer();
  const loginResponse = await login(app.baseUrl);
  const loginBody = await loginResponse.json();
  const accessToken = loginBody.data.accessToken;

  const response = await fetch(`${app.baseUrl}/api/i18n/resources`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      lang: "zh",
      force: true,
      items: "invalid"
    })
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error_code, "ERR_INVALID_ARGUMENT");
  await app.close();
});

test("POST /api/i18n/cache/reload requires admin and supports reload", async () => {
  const app = await startServer();

  const denied = await fetch(`${app.baseUrl}/api/i18n/cache/reload`, {
    method: "POST"
  });
  assert.equal(denied.status, 403);

  const loginResponse = await login(app.baseUrl);
  const loginBody = await loginResponse.json();
  const accessToken = loginBody.data.accessToken;
  const okReload = await fetch(`${app.baseUrl}/api/i18n/cache/reload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  assert.equal(okReload.status, 200);
  const body = await okReload.json();
  assert.equal(body.status, "success");
  assert.equal(body.data.reloaded, true);

  await app.close();
});

test("GET unknown i18n route returns 404", async () => {
  const app = await startServer();
  const response = await fetch(`${app.baseUrl}/api/i18n/unknown-route`);
  assert.equal(response.status, 404);
  const body = await response.json();
  assert.equal(body.error_code, "ERR_NOT_FOUND");
  await app.close();
});
