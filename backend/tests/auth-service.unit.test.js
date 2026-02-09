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

test("AuthService register success and duplicate email", () => {
  const service = new AuthService();
  const created = service.register({
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePass123",
    confirmPassword: "SecurePass123",
    termsAccepted: true,
    clientIp: "5.5.5.5"
  });
  assert.equal(created.ok, true);
  assert.equal(created.status, 201);
  assert.equal(created.data.requiresVerification, true);

  const duplicate = service.register({
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePass123",
    confirmPassword: "SecurePass123",
    termsAccepted: true,
    clientIp: "5.5.5.5"
  });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.code, "AUTH_EMAIL_EXISTS");
});

test("AuthService register validation and rate limit", () => {
  const service = new AuthService();
  const mismatch = service.register({
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePass123",
    confirmPassword: "SecurePass999",
    termsAccepted: true,
    clientIp: "6.6.6.6"
  });
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.code, "AUTH_PASSWORD_MISMATCH");

  const termsInvalid = service.register({
    name: "John Doe",
    email: "john2@example.com",
    password: "SecurePass123",
    confirmPassword: "SecurePass123",
    termsAccepted: false,
    clientIp: "6.6.6.7"
  });
  assert.equal(termsInvalid.ok, false);
  assert.equal(termsInvalid.code, "AUTH_TERMS_NOT_ACCEPTED");

  for (let i = 0; i < 10; i += 1) {
    const okResult = service.register({
      name: `John ${i}`,
      email: `john${i}@example.com`,
      password: "SecurePass123",
      confirmPassword: "SecurePass123",
      termsAccepted: true,
      clientIp: "6.6.6.8"
    });
    assert.equal(okResult.ok, true);
  }
  const limited = service.register({
    name: "John 99",
    email: "john99@example.com",
    password: "SecurePass123",
    confirmPassword: "SecurePass123",
    termsAccepted: true,
    clientIp: "6.6.6.8"
  });
  assert.equal(limited.ok, false);
  assert.equal(limited.code, "AUTH_REGISTER_RATE_LIMITED");
  assert.equal(typeof limited.retryAfterSeconds, "number");
});

test("AuthService sso init and callback flow", () => {
  const service = new AuthService();
  const init = service.ssoInit({
    provider: "microsoft",
    redirectUri: "https://app.onecrm.com/sso/callback",
    clientIp: "7.7.7.7"
  });
  assert.equal(init.ok, true);
  assert.equal(typeof init.data.state, "string");

  const callback = service.ssoCallback({
    provider: "microsoft",
    code: "email:new.user@company.com",
    state: init.data.state
  });
  assert.equal(callback.ok, true);
  assert.equal(callback.data.isNewUser, true);

  const secondInit = service.ssoInit({
    provider: "microsoft",
    redirectUri: "https://app.onecrm.com/sso/callback",
    clientIp: "7.7.7.8"
  });
  const secondCallback = service.ssoCallback({
    provider: "microsoft",
    code: "email:new.user@company.com",
    state: secondInit.data.state
  });
  assert.equal(secondCallback.ok, true);
  assert.equal(secondCallback.data.isNewUser, false);
});

test("AuthService sso validates state/code/provider/domain and rate limit", () => {
  const service = new AuthService();
  const missingProvider = service.ssoInit({
    provider: "",
    redirectUri: "https://app.onecrm.com/sso/callback",
    clientIp: "8.8.8.1"
  });
  assert.equal(missingProvider.ok, false);
  assert.equal(missingProvider.code, "AUTH_SSO_MISSING_PROVIDER");

  const unsupported = service.ssoInit({
    provider: "github",
    redirectUri: "https://app.onecrm.com/sso/callback",
    clientIp: "8.8.8.2"
  });
  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.code, "AUTH_SSO_UNSUPPORTED_PROVIDER");

  const init = service.ssoInit({
    provider: "google",
    redirectUri: "https://app.onecrm.com/sso/callback",
    clientIp: "8.8.8.3"
  });
  const invalidState = service.ssoCallback({
    provider: "google",
    code: "email:user@company.com",
    state: "wrong-state"
  });
  assert.equal(invalidState.ok, false);
  assert.equal(invalidState.code, "AUTH_SSO_INVALID_STATE");

  const expiredCode = service.ssoCallback({
    provider: "google",
    code: "expired:abc",
    state: init.data.state
  });
  assert.equal(expiredCode.ok, false);
  assert.equal(expiredCode.code, "AUTH_SSO_CODE_EXPIRED");

  const init2 = service.ssoInit({
    provider: "google",
    redirectUri: "https://app.onecrm.com/sso/callback",
    clientIp: "8.8.8.4"
  });
  const domainDenied = service.ssoCallback({
    provider: "google",
    code: "email:user@unknown.com",
    state: init2.data.state
  });
  assert.equal(domainDenied.ok, false);
  assert.equal(domainDenied.code, "AUTH_SSO_DOMAIN_NOT_ALLOWED");

  for (let i = 0; i < 20; i += 1) {
    const okInit = service.ssoInit({
      provider: "google",
      redirectUri: "https://app.onecrm.com/sso/callback",
      clientIp: "8.8.8.5"
    });
    assert.equal(okInit.ok, true);
  }
  const limited = service.ssoInit({
    provider: "google",
    redirectUri: "https://app.onecrm.com/sso/callback",
    clientIp: "8.8.8.5"
  });
  assert.equal(limited.ok, false);
  assert.equal(limited.code, "AUTH_SSO_RATE_LIMITED");
  assert.equal(typeof limited.retryAfterSeconds, "number");
});
