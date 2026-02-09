import { fail, ok, readJsonBody } from "./http.js";

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

export function createAuthRoutes({ authService }) {
  return async function handleAuth(req, res) {
    if (req.method === "POST" && req.url === "/api/auth/login") {
      const body = await readJsonBody(req);
      const result = authService.login({
        username: body.username,
        password: body.password,
        clientIp: getClientIp(req),
        userAgent: req.headers["user-agent"]
      });

      if (!result.ok) {
        fail(res, result.status, result.code, result.code);
        return true;
      }

      ok(res, result.data);
      return true;
    }

    if (req.method === "GET" && req.url === "/api/auth/me") {
      const token = authService.parseBearerToken(req.headers.authorization);
      const result = authService.getCurrentUser(token);
      if (!result.ok) {
        fail(res, result.status, result.code, result.code);
        return true;
      }

      ok(res, result.data);
      return true;
    }

    if (req.method === "POST" && req.url === "/api/auth/refresh") {
      const body = await readJsonBody(req);
      const result = authService.refresh(body.refreshToken);
      if (!result.ok) {
        fail(res, result.status, result.code, result.code);
        return true;
      }

      ok(res, {
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken
      });
      return true;
    }

    if (req.method === "POST" && req.url === "/api/auth/logout") {
      const token = authService.parseBearerToken(req.headers.authorization);
      const me = authService.getCurrentUser(token);
      if (!me.ok) {
        fail(res, me.status, me.code, me.code);
        return true;
      }

      const body = await readJsonBody(req);
      const result = authService.logout(body.refreshToken);
      if (!result.ok) {
        fail(res, result.status, result.code, result.code);
        return true;
      }

      ok(res, null);
      return true;
    }

    return false;
  };
}

