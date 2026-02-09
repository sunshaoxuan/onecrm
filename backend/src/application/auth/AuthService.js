import crypto from "node:crypto";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LOCK_TTL_MS = 30 * 60 * 1000;
const MAX_FAILED_LOGIN = 5;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_PER_IP = 10;
const PASSWORD_RESET_WINDOW_MS = 60 * 60 * 1000;
const PASSWORD_RESET_LIMIT_PER_IP = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;
const REGISTER_LIMIT_PER_IP = 10;
const SSO_INIT_WINDOW_MS = 60 * 1000;
const SSO_INIT_LIMIT_PER_IP = 20;
const SSO_STATE_TTL_MS = 10 * 60 * 1000;

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
    this.registerRateLimitStore = new Map();
    this.ssoInitRateLimitStore = new Map();
    this.ssoStateStore = new Map();
    this.allowedSsoProviders = new Set(["microsoft", "google"]);
    this.allowedSsoDomains = new Set(
      (options.allowedSsoDomains || process.env.AUTH_SSO_ALLOWED_DOMAINS || "onecrm.local,company.com")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    );
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

  checkWindowRateLimit(store, { clientIp, windowMs, limit, code }) {
    const key = clientIp || "unknown";
    const current = now();
    const record = store.get(key);

    if (!record || current - record.windowStartAt > windowMs) {
      store.set(key, { count: 1, windowStartAt: current });
      return { ok: true };
    }

    if (record.count >= limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.windowStartAt + windowMs - current) / 1000));
      return { ok: false, code, retryAfterSeconds };
    }

    record.count += 1;
    store.set(key, record);
    return { ok: true };
  }

  checkPasswordResetRateLimit(clientIp) {
    return this.checkWindowRateLimit(this.passwordResetRateLimitStore, {
      clientIp,
      windowMs: PASSWORD_RESET_WINDOW_MS,
      limit: PASSWORD_RESET_LIMIT_PER_IP,
      code: "AUTH_RATE_LIMITED"
    });
  }

  checkRegisterRateLimit(clientIp) {
    return this.checkWindowRateLimit(this.registerRateLimitStore, {
      clientIp,
      windowMs: REGISTER_WINDOW_MS,
      limit: REGISTER_LIMIT_PER_IP,
      code: "AUTH_REGISTER_RATE_LIMITED"
    });
  }

  checkSsoInitRateLimit(clientIp) {
    return this.checkWindowRateLimit(this.ssoInitRateLimitStore, {
      clientIp,
      windowMs: SSO_INIT_WINDOW_MS,
      limit: SSO_INIT_LIMIT_PER_IP,
      code: "AUTH_SSO_RATE_LIMITED"
    });
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

  validateRegisterInput({ name, email, password, confirmPassword, termsAccepted }) {
    const normalizedName = typeof name === "string" ? name.trim() : "";
    if (!normalizedName) {
      return { ok: false, code: "AUTH_MISSING_FIELD" };
    }
    if (normalizedName.length > 100) {
      return { ok: false, code: "AUTH_MISSING_FIELD" };
    }

    const emailCheck = this.validateEmailInput(email);
    if (!emailCheck.ok) {
      return { ok: false, code: "AUTH_MISSING_FIELD" };
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return { ok: false, code: "AUTH_PASSWORD_WEAK" };
    }

    if (confirmPassword !== password) {
      return { ok: false, code: "AUTH_PASSWORD_MISMATCH" };
    }

    if (termsAccepted !== true) {
      return { ok: false, code: "AUTH_TERMS_NOT_ACCEPTED" };
    }

    return {
      ok: true,
      data: {
        name: normalizedName,
        email: emailCheck.email,
        password
      }
    };
  }

  buildDefaultUsernameFromEmail(email) {
    const localPart = email.split("@")[0] || "user";
    const candidate = localPart.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 24) || "user";
    let next = candidate;
    let index = 1;
    while (this.users.some((user) => user.username === next)) {
      index += 1;
      next = `${candidate}_${index}`;
    }
    return next;
  }

  createUserFromRegister({ name, email, password }) {
    const id = `usr_${crypto.randomBytes(6).toString("hex")}`;
    return {
      id,
      username: this.buildDefaultUsernameFromEmail(email),
      password,
      email,
      displayName: name,
      roles: ["user"],
      avatar: null
    };
  }

  register({ name, email, password, confirmPassword, termsAccepted, clientIp }) {
    const input = this.validateRegisterInput({ name, email, password, confirmPassword, termsAccepted });
    if (!input.ok) {
      return { ok: false, status: 400, code: input.code };
    }

    const rate = this.checkRegisterRateLimit(clientIp);
    if (!rate.ok) {
      return {
        ok: false,
        status: 429,
        code: rate.code,
        retryAfterSeconds: rate.retryAfterSeconds
      };
    }

    const exists = this.users.some((candidate) => this.normalizeEmail(candidate.email) === input.data.email);
    if (exists) {
      return { ok: false, status: 409, code: "AUTH_EMAIL_EXISTS" };
    }

    const user = this.createUserFromRegister(input.data);
    this.users.push(user);
    return {
      ok: true,
      status: 201,
      data: {
        userId: user.id,
        email: user.email,
        requiresVerification: true
      }
    };
  }

  validateSsoInitInput({ provider, redirectUri }) {
    const normalizedProvider = typeof provider === "string" ? provider.trim().toLowerCase() : "";
    if (!normalizedProvider) {
      return { ok: false, status: 400, code: "AUTH_SSO_MISSING_PROVIDER" };
    }
    if (!this.allowedSsoProviders.has(normalizedProvider)) {
      return { ok: false, status: 400, code: "AUTH_SSO_UNSUPPORTED_PROVIDER" };
    }
    if (!redirectUri || typeof redirectUri !== "string") {
      return { ok: false, status: 400, code: "AUTH_SSO_MISSING_PROVIDER" };
    }
    return { ok: true, provider: normalizedProvider, redirectUri };
  }

  buildSsoAuthUrl({ provider, state, redirectUri }) {
    const encodedRedirect = encodeURIComponent(redirectUri);
    return `https://sso.onecrm.local/${provider}/authorize?state=${state}&redirect_uri=${encodedRedirect}`;
  }

  ssoInit({ provider, redirectUri, clientIp }) {
    const input = this.validateSsoInitInput({ provider, redirectUri });
    if (!input.ok) {
      return { ok: false, status: input.status, code: input.code };
    }

    const rate = this.checkSsoInitRateLimit(clientIp);
    if (!rate.ok) {
      return {
        ok: false,
        status: 429,
        code: rate.code,
        retryAfterSeconds: rate.retryAfterSeconds
      };
    }

    const state = `sso_${crypto.randomBytes(12).toString("hex")}`;
    this.ssoStateStore.set(state, {
      provider: input.provider,
      redirectUri: input.redirectUri,
      clientIp,
      expiresAt: now() + SSO_STATE_TTL_MS
    });

    return {
      ok: true,
      data: {
        authUrl: this.buildSsoAuthUrl({
          provider: input.provider,
          state,
          redirectUri: input.redirectUri
        }),
        state
      }
    };
  }

  parseSsoCode(code) {
    const raw = typeof code === "string" ? code.trim() : "";
    if (!raw) {
      return { ok: false, status: 400, code: "AUTH_SSO_MISSING_FIELD" };
    }
    if (raw.startsWith("expired:")) {
      return { ok: false, status: 400, code: "AUTH_SSO_CODE_EXPIRED" };
    }
    if (raw.startsWith("error:")) {
      return { ok: false, status: 500, code: "AUTH_SSO_PROVIDER_ERROR" };
    }

    if (raw.startsWith("email:")) {
      const email = this.normalizeEmail(raw.slice("email:".length));
      const emailCheck = this.validateEmailInput(email);
      if (!emailCheck.ok) {
        return { ok: false, status: 500, code: "AUTH_SSO_PROVIDER_ERROR" };
      }
      const name = emailCheck.email.split("@")[0] || "SSO User";
      return { ok: true, profile: { email: emailCheck.email, name } };
    }

    const syntheticEmail = `${raw.slice(0, 12)}@company.com`.toLowerCase();
    return {
      ok: true,
      profile: {
        email: syntheticEmail,
        name: `SSO ${raw.slice(0, 6)}`
      }
    };
  }

  ensureSsoDomainAllowed(email) {
    const domain = this.normalizeEmail(email).split("@")[1] || "";
    if (!domain) {
      return false;
    }
    return this.allowedSsoDomains.has(domain);
  }

  ssoCallback({ provider, code, state }) {
    const normalizedProvider = typeof provider === "string" ? provider.trim().toLowerCase() : "";
    const normalizedState = typeof state === "string" ? state.trim() : "";
    const normalizedCode = typeof code === "string" ? code.trim() : "";
    if (!normalizedProvider || !normalizedCode || !normalizedState) {
      return { ok: false, status: 400, code: "AUTH_SSO_MISSING_FIELD" };
    }

    const stateRecord = this.ssoStateStore.get(normalizedState);
    if (!stateRecord || stateRecord.provider !== normalizedProvider || stateRecord.expiresAt <= now()) {
      return { ok: false, status: 400, code: "AUTH_SSO_INVALID_STATE" };
    }
    this.ssoStateStore.delete(normalizedState);

    const codeResult = this.parseSsoCode(normalizedCode);
    if (!codeResult.ok) {
      return { ok: false, status: codeResult.status, code: codeResult.code };
    }

    if (!this.ensureSsoDomainAllowed(codeResult.profile.email)) {
      return { ok: false, status: 403, code: "AUTH_SSO_DOMAIN_NOT_ALLOWED" };
    }

    let user = this.users.find(
      (candidate) => this.normalizeEmail(candidate.email) === this.normalizeEmail(codeResult.profile.email)
    );
    let isNewUser = false;
    if (!user) {
      user = this.createUserFromRegister({
        name: codeResult.profile.name,
        email: codeResult.profile.email,
        password: `sso_${crypto.randomBytes(8).toString("hex")}`
      });
      this.users.push(user);
      isNewUser = true;
    }

    const issued = this.issueTokens(user);
    return {
      ok: true,
      data: {
        accessToken: issued.accessToken,
        refreshToken: issued.refreshToken,
        user: {
          id: user.id,
          name: user.displayName,
          email: user.email,
          avatar: user.avatar || null
        },
        isNewUser
      }
    };
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
