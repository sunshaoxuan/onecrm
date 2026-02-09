import test from "node:test";
import assert from "node:assert/strict";
import { AuthService } from "../src/application/auth/AuthService.js";

test("AuthService parseBearerToken handles invalid values", () => {
  const service = new AuthService();
  assert.equal(service.parseBearerToken(undefined), null);
  assert.equal(service.parseBearerToken("Token xxx"), null);
  assert.equal(service.parseBearerToken("Bearer abc"), "abc");
});

test("AuthService rate limit returns AUTH_RATE_LIMITED", () => {
  const service = new AuthService();
  for (let i = 0; i < 10; i += 1) {
    const result = service.checkRateLimit("1.1.1.1");
    assert.equal(result.ok, true);
  }
  const limited = service.checkRateLimit("1.1.1.1");
  assert.equal(limited.ok, false);
  assert.equal(limited.code, "AUTH_RATE_LIMITED");
});

test("AuthService lock and unlock flow", () => {
  const service = new AuthService();
  for (let i = 0; i < 5; i += 1) {
    service.onLoginFailed("admin");
  }
  assert.equal(service.isLocked("admin"), true);

  const lockRecord = service.failedLoginStore.get("admin");
  lockRecord.lockedUntil = Date.now() - 1000;
  service.failedLoginStore.set("admin", lockRecord);
  assert.equal(service.isLocked("admin"), false);
});

test("AuthService refresh handles revoked and expired token", () => {
  const service = new AuthService();
  const login = service.login({
    username: "admin",
    password: "secret_password",
    clientIp: "1.1.1.2",
    userAgent: "unit"
  });
  assert.equal(login.ok, true);
  const refreshToken = login.data.refreshToken;

  service.refreshTokenStore.set(refreshToken, {
    ...service.refreshTokenStore.get(refreshToken),
    revoked: true
  });
  const revoked = service.refresh(refreshToken);
  assert.equal(revoked.ok, false);
  assert.equal(revoked.code, "AUTH_REFRESH_TOKEN_REVOKED");

  const login2 = service.login({
    username: "admin",
    password: "secret_password",
    clientIp: "1.1.1.3",
    userAgent: "unit"
  });
  const refreshToken2 = login2.data.refreshToken;
  service.refreshTokenStore.set(refreshToken2, {
    ...service.refreshTokenStore.get(refreshToken2),
    expiresAt: Date.now() - 1000
  });
  const expired = service.refresh(refreshToken2);
  assert.equal(expired.ok, false);
  assert.equal(expired.code, "AUTH_REFRESH_TOKEN_EXPIRED");
});

test("AuthService logout handles invalid and missing tokens", () => {
  const service = new AuthService();
  const invalid = service.logout("");
  assert.equal(invalid.ok, false);
  assert.equal(invalid.code, "AUTH_REFRESH_TOKEN_INVALID");

  const missing = service.logout("rtk_missing");
  assert.equal(missing.ok, true);
  assert.equal(missing.data, null);
});

test("AuthService requestPasswordResetLink validates email input", async () => {
  const service = new AuthService();
  const missing = await service.requestPasswordResetLink({ email: "", clientIp: "1.1.1.1" });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, "AUTH_EMAIL_REQUIRED");

  const invalid = await service.requestPasswordResetLink({ email: "bad-mail", clientIp: "1.1.1.1" });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.code, "AUTH_EMAIL_INVALID");
});

test("AuthService requestPasswordResetLink uses unified success for unknown email", async () => {
  const service = new AuthService();
  const result = await service.requestPasswordResetLink({
    email: "nobody@example.com",
    clientIp: "2.2.2.2"
  });
  assert.equal(result.ok, true);
  assert.equal(result.data, null);
});

test("AuthService requestPasswordResetLink returns rate limited with retryAfterSeconds", async () => {
  const service = new AuthService();
  for (let i = 0; i < 5; i += 1) {
    const okReset = await service.requestPasswordResetLink({
      email: "admin@onecrm.local",
      clientIp: "3.3.3.3"
    });
    assert.equal(okReset.ok, true);
  }

  const limited = await service.requestPasswordResetLink({
    email: "admin@onecrm.local",
    clientIp: "3.3.3.3"
  });
  assert.equal(limited.ok, false);
  assert.equal(limited.code, "AUTH_RATE_LIMITED");
  assert.equal(typeof limited.retryAfterSeconds, "number");
  assert.equal(limited.retryAfterSeconds > 0, true);
});

test("AuthService requestPasswordResetLink returns 500 when sender throws", async () => {
  const service = new AuthService({
    passwordResetSender: async () => {
      throw new Error("failed");
    }
  });
  const result = await service.requestPasswordResetLink({
    email: "admin@onecrm.local",
    clientIp: "4.4.4.4"
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 500);
  assert.equal(result.code, "SYS_INTERNAL_ERROR");
});
