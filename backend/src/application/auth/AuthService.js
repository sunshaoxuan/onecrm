import crypto from "node:crypto";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LOCK_TTL_MS = 30 * 60 * 1000;
const MAX_FAILED_LOGIN = 5;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_PER_IP = 10;
const PASSWORD_RESET_WINDOW_MS = 60 * 60 * 1000;
const PASSWORD_RESET_LIMIT_PER_IP = 5;

function now() {
  return Date.now();
}

function maskIp(ip) {
  if (!ip) {
    return "unknown";
  }

  const parts = ip.split(".");
  if (parts.length !== 4) {
    return ip;
  }

  return `${parts[0]}.${parts[1]}.***.***`;
}

export class AuthService {
  constructor(options = {}) {
    this.users = options.users || [
      {
        id: "u_001",
        username: process.env.ONECRM_ADMIN_USERNAME || "admin",
        password: process.env.ONECRM_ADMIN_PASSWORD || "secret_password",
        email: process.env.ONECRM_ADMIN_EMAIL || "admin@onecrm.local",
        displayName: "Administrator",
        roles: ["admin"]
      }
    ];
    this.passwordResetSender =
      options.passwordResetSender ||
      (async () => ({
        accepted: true
      }));
    this.accessTokenStore = new Map();
    this.refreshTokenStore = new Map();
    this.failedLoginStore = new Map();
    this.rateLimitStore = new Map();
    this.passwordResetRateLimitStore = new Map();
    this.passwordResetTokenStore = new Map();
  }

  normalizeUsername(username) {
    return typeof username === "string" ? username.trim() : "";
  }

  validateLoginInput({ username, password }) {
    const normalizedUsername = this.normalizeUsername(username);
    if (!normalizedUsername || !password) {
      return { ok: false, code: "AUTH_MISSING_FIELD" };
    }

    if (normalizedUsername.length < 1 || normalizedUsername.length > 50) {
      return { ok: false, code: "AUTH_MISSING_FIELD" };
    }

    if (typeof password !== "string" || password.length < 6 || password.length > 100) {
      return { ok: false, code: "AUTH_MISSING_FIELD" };
    }

    return { ok: true, username: normalizedUsername, password };
  }

  checkRateLimit(clientIp) {
    const key = clientIp || "unknown";
    const record = this.rateLimitStore.get(key);
    const current = now();

    if (!record || current - record.windowStartAt > RATE_WINDOW_MS) {
      this.rateLimitStore.set(key, { count: 1, windowStartAt: current });
      return { ok: true };
    }

    if (record.count >= RATE_LIMIT_PER_IP) {
      return { ok: false, code: "AUTH_RATE_LIMITED" };
    }

    record.count += 1;
    this.rateLimitStore.set(key, record);
    return { ok: true };
  }

  isLocked(username) {
    const lock = this.failedLoginStore.get(username);
    if (!lock) {
      return false;
    }

    const current = now();
    if (lock.lockedUntil && lock.lockedUntil > current) {
      return true;
    }

    if (lock.lockedUntil && lock.lockedUntil <= current) {
      this.failedLoginStore.delete(username);
    }

    return false;
  }

  onLoginFailed(username) {
    const current = now();
    const currentRecord = this.failedLoginStore.get(username) || { failedCount: 0, lockedUntil: 0 };
    currentRecord.failedCount += 1;
    if (currentRecord.failedCount >= MAX_FAILED_LOGIN) {
      currentRecord.lockedUntil = current + LOCK_TTL_MS;
    }
    this.failedLoginStore.set(username, currentRecord);
  }

  onLoginSuccess(username) {
    this.failedLoginStore.delete(username);
  }

  logAudit({ clientIp, userAgent, loginStatus, username }) {
    const log = {
      event: "AUTH_LOGIN",
      client_ip: maskIp(clientIp),
      user_agent: userAgent || "unknown",
      login_status: loginStatus,
      timestamp: new Date().toISOString(),
      username: username || "unknown"
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(log));
  }

  normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
  }

  validateEmailInput(email) {
    const normalized = this.normalizeEmail(email);
    if (!normalized) {
      return { ok: false, code: "AUTH_EMAIL_REQUIRED" };
    }

    if (normalized.length > 255) {
      return { ok: false, code: "AUTH_EMAIL_INVALID" };
    }

    const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailPattern.test(normalized)) {
      return { ok: false, code: "AUTH_EMAIL_INVALID" };
    }

    return { ok: true, email: normalized };
  }

  hashEmail(email) {
    return crypto.createHash("sha256").update(email).digest("hex");
  }

  checkPasswordResetRateLimit(clientIp) {
    const key = clientIp || "unknown";
    const current = now();
    const record = this.passwordResetRateLimitStore.get(key);

    if (!record || current - record.windowStartAt > PASSWORD_RESET_WINDOW_MS) {
      this.passwordResetRateLimitStore.set(key, { count: 1, windowStartAt: current });
      return { ok: true };
    }

    if (record.count >= PASSWORD_RESET_LIMIT_PER_IP) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((record.windowStartAt + PASSWORD_RESET_WINDOW_MS - current) / 1000)
      );
      return { ok: false, code: "AUTH_RATE_LIMITED", retryAfterSeconds };
    }

    record.count += 1;
    this.passwordResetRateLimitStore.set(key, record);
    return { ok: true };
  }

  logPasswordResetAudit({ email, clientIp, status, errorCode }) {
    const log = {
      event: "AUTH_PASSWORD_RESET_LINK",
      email_hash: this.hashEmail(email),
      client_ip: clientIp || "unknown",
      status,
      error_code: errorCode || null,
      timestamp: new Date().toISOString()
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(log));
  }

  issuePasswordResetToken(user) {
    const token = `prk_${crypto.randomBytes(24).toString("hex")}`;
    this.passwordResetTokenStore.set(token, {
      userId: user.id,
      email: user.email,
      createdAt: now()
    });
    return token;
  }

  issueTokens(user) {
    const issuedAt = now();
    const accessToken = `atk_${crypto.randomBytes(24).toString("hex")}`;
    const refreshToken = `rtk_${crypto.randomBytes(24).toString("hex")}`;

    const accessRecord = {
      user,
      refreshToken,
      expiresAt: issuedAt + ACCESS_TOKEN_TTL_MS
    };

    const refreshRecord = {
      user,
      expiresAt: issuedAt + REFRESH_TOKEN_TTL_MS,
      revoked: false
    };

    this.accessTokenStore.set(accessToken, accessRecord);
    this.refreshTokenStore.set(refreshToken, refreshRecord);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        roles: user.roles
      }
    };
  }

  login({ username, password, clientIp, userAgent }) {
    const input = this.validateLoginInput({ username, password });
    if (!input.ok) {
      this.logAudit({ clientIp, userAgent, loginStatus: "MISSING_FIELD", username: input.username });
      return { ok: false, status: 400, code: "AUTH_MISSING_FIELD" };
    }

    const rate = this.checkRateLimit(clientIp);
    if (!rate.ok) {
      this.logAudit({ clientIp, userAgent, loginStatus: "RATE_LIMITED", username: input.username });
      return { ok: false, status: 429, code: "AUTH_RATE_LIMITED" };
    }

    if (this.isLocked(input.username)) {
      this.logAudit({ clientIp, userAgent, loginStatus: "LOCKED", username: input.username });
      return { ok: false, status: 403, code: "AUTH_LOCKED" };
    }

    const user = this.users.find((candidate) => candidate.username === input.username);
    if (!user || user.password !== input.password) {
      this.onLoginFailed(input.username);
      this.logAudit({ clientIp, userAgent, loginStatus: "INVALID_CREDENTIALS", username: input.username });
      return { ok: false, status: 401, code: "AUTH_INVALID_CREDENTIALS" };
    }

    this.onLoginSuccess(input.username);
    this.logAudit({ clientIp, userAgent, loginStatus: "SUCCESS", username: input.username });
    return { ok: true, data: this.issueTokens(user) };
  }

  parseBearerToken(authorizationHeader) {
    if (!authorizationHeader || typeof authorizationHeader !== "string") {
      return null;
    }
    if (!authorizationHeader.startsWith("Bearer ")) {
      return null;
    }
    return authorizationHeader.slice("Bearer ".length).trim();
  }

  getCurrentUser(accessToken) {
    if (!accessToken) {
      return { ok: false, status: 401, code: "AUTH_TOKEN_INVALID" };
    }

    const record = this.accessTokenStore.get(accessToken);
    if (!record) {
      return { ok: false, status: 401, code: "AUTH_TOKEN_INVALID" };
    }

    if (record.expiresAt <= now()) {
      return { ok: false, status: 401, code: "AUTH_TOKEN_EXPIRED" };
    }

    return {
      ok: true,
      data: {
        id: record.user.id,
        username: record.user.username,
        displayName: record.user.displayName,
        roles: record.user.roles
      }
    };
  }

  refresh(refreshToken) {
    if (!refreshToken || typeof refreshToken !== "string") {
      return { ok: false, status: 400, code: "AUTH_REFRESH_TOKEN_INVALID" };
    }

    const record = this.refreshTokenStore.get(refreshToken);
    if (!record) {
      return { ok: false, status: 400, code: "AUTH_REFRESH_TOKEN_INVALID" };
    }

    if (record.revoked) {
      return { ok: false, status: 403, code: "AUTH_REFRESH_TOKEN_REVOKED" };
    }

    if (record.expiresAt <= now()) {
      return { ok: false, status: 403, code: "AUTH_REFRESH_TOKEN_EXPIRED" };
    }

    this.refreshTokenStore.set(refreshToken, { ...record, revoked: true });

    return {
      ok: true,
      data: this.issueTokens(record.user)
    };
  }

  logout(refreshToken) {
    if (!refreshToken || typeof refreshToken !== "string") {
      return { ok: false, status: 400, code: "AUTH_REFRESH_TOKEN_INVALID" };
    }

    const record = this.refreshTokenStore.get(refreshToken);
    if (!record) {
      return { ok: true, data: null };
    }

    this.refreshTokenStore.set(refreshToken, { ...record, revoked: true });
    return { ok: true, data: null };
  }

  isAdmin(accessToken) {
    const user = this.getCurrentUser(accessToken);
    return user.ok && Array.isArray(user.data.roles) && user.data.roles.includes("admin");
  }

  async requestPasswordResetLink({ email, clientIp }) {
    const input = this.validateEmailInput(email);
    if (!input.ok) {
      return { ok: false, status: 400, code: input.code };
    }

    const rate = this.checkPasswordResetRateLimit(clientIp);
    if (!rate.ok) {
      this.logPasswordResetAudit({
        email: input.email,
        clientIp,
        status: "error",
        errorCode: rate.code
      });
      return {
        ok: false,
        status: 429,
        code: rate.code,
        retryAfterSeconds: rate.retryAfterSeconds
      };
    }

    const user = this.users.find((candidate) => this.normalizeEmail(candidate.email) === input.email);
    if (!user) {
      this.logPasswordResetAudit({
        email: input.email,
        clientIp,
        status: "success"
      });
      return { ok: true, data: null };
    }

    const token = this.issuePasswordResetToken(user);
    try {
      await this.passwordResetSender({
        email: input.email,
        token,
        userId: user.id
      });
    } catch {
      this.logPasswordResetAudit({
        email: input.email,
        clientIp,
        status: "error",
        errorCode: "SYS_INTERNAL_ERROR"
      });
      return { ok: false, status: 500, code: "SYS_INTERNAL_ERROR" };
    }

    this.logPasswordResetAudit({
      email: input.email,
      clientIp,
      status: "success"
    });
    return { ok: true, data: null };
  }
}
