export function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers
  });
  res.end(JSON.stringify(payload));
}

export function notFound(res) {
  fail(res, 404, "ERR_NOT_FOUND", "ERR_NOT_FOUND");
}

export async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

export function checkEtag(req, etag) {
  const ifNoneMatch = req.headers["if-none-match"];
  return ifNoneMatch && ifNoneMatch === etag;
}

export function ok(res, data, meta = undefined, headers = {}) {
  const payload = { status: "success", data };
  if (meta) {
    payload.meta = meta;
  }
  sendJson(res, 200, payload, headers);
}

export function fail(res, statusCode, errorCode, message, headers = {}) {
  sendJson(
    res,
    statusCode,
    {
      status: "error",
      error_code: errorCode,
      message
    },
    headers
  );
}

export function failWithDetails(res, statusCode, errorCode, message, details = {}, headers = {}) {
  sendJson(
    res,
    statusCode,
    {
      status: "error",
      error_code: errorCode,
      message,
      ...details
    },
    headers
  );
}
