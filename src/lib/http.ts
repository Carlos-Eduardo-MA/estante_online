const MAX_BODY_BYTES = 10_000;

export function json(data: unknown, status = 200, headers?: HeadersInit) {
  const merged = new Headers(headers);
  // Dados autenticados nunca devem ficar em cache de navegador ou CDN.
  if (!merged.has("Cache-Control")) merged.set("Cache-Control", "no-store");
  return Response.json(data, { status, headers: merged });
}

export function fail(status: number, message: string, headers?: HeadersInit) {
  return json({ error: message }, status, headers);
}

export function tooManyRequests(retryAfterSeconds: number) {
  return fail(429, "Muitas tentativas. Aguarde alguns instantes e tente de novo.", {
    "Retry-After": String(Math.max(1, retryAfterSeconds)),
  });
}

export type ParsedBody =
  | { ok: true; value: unknown }
  | { ok: false; response: Response };

export async function readJson(request: Request): Promise<ParsedBody> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return { ok: false, response: fail(413, "Requisição grande demais.") };
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return { ok: false, response: fail(413, "Requisição grande demais.") };
  }

  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, response: fail(400, "Corpo da requisição inválido.") };
  }
}

/**
 * Verificação de origem no estilo CSRF. O cookie de sessão já é SameSite=Lax;
 * esta checagem é uma segunda barreira para requisições de escrita.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim().slice(0, 64);
  return request.headers.get("x-real-ip")?.slice(0, 64) ?? "local";
}
