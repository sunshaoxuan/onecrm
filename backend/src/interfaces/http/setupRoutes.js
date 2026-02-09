import { fail, ok } from "./http.js";

export function createSetupRoutes({ setupService }) {
  return async function handleSetup(req, res) {
    if (req.method === "GET" && req.url === "/api/setup/admin") {
      const result = setupService.checkAdminSetup();
      if (!result.ok) {
        fail(res, result.status, result.code, result.code);
        return true;
      }

      ok(res, result.data);
      return true;
    }

    return false;
  };
}

