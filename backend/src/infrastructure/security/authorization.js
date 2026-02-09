const ROLE_PERMISSIONS = {
  admin: ["i18n.read", "i18n.write", "i18n.cache.reload"],
  editor: ["i18n.read", "i18n.write"],
  viewer: ["i18n.read"]
};

export function resolveAuthContext(req, { failOpen }) {
  const userId = req.headers["x-user-id"];
  const role = (req.headers["x-role"] || "viewer").toLowerCase();
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;

  if (!userId && !failOpen) {
    return { authenticated: false, role: "anonymous", permissions: [] };
  }

  return {
    authenticated: Boolean(userId) || failOpen,
    userId: userId || "fail-open",
    role: ROLE_PERMISSIONS[role] ? role : "viewer",
    permissions
  };
}

export function hasPermission(auth, permission) {
  return auth.permissions.includes(permission);
}

