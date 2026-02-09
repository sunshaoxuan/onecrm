export function normalizeLanguage(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const dash = trimmed.indexOf("-");
  return dash > 0 ? trimmed.slice(0, dash) : trimmed;
}

export function parseAcceptLanguage(headerValue) {
  if (!headerValue || typeof headerValue !== "string") {
    return null;
  }

  const parts = headerValue
    .split(",")
    .map((item) => item.split(";")[0].trim())
    .filter(Boolean);

  for (const part of parts) {
    const normalized = normalizeLanguage(part);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

