import { contactSchema } from "../lib/contact-schema";
import { sendBrevoAutoReply, type RuntimeEnv } from "./email";

const MAX_BODY_BYTES = 32_768;

function setting(name: string, env: RuntimeEnv): string {
  const value = env[name];
  return typeof value === "string"
    ? value
    : typeof process !== "undefined"
      ? (process.env[name] ?? "")
      : "";
}

export async function handleContact(request: Request, env: RuntimeEnv): Promise<Response> {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Vary: "Origin",
  });
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers });
  const origin = request.headers.get("Origin");
  const allowedOrigins = new Set([
    new URL(request.url).origin,
    "https://itsa-pccoe.pages.dev",
    ...setting("CONTACT_ALLOWED_ORIGINS", env)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ]);
  if (origin && !allowedOrigins.has(origin)) return reply(403, { error: "Origin not allowed" });
  if (origin) headers.set("Access-Control-Allow-Origin", origin);
  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "POST") {
    headers.set("Allow", "POST, OPTIONS");
    return reply(405, { error: "Method not allowed" });
  }
  if (
    request.headers.get("Content-Type")?.split(";")[0]?.trim().toLowerCase() !== "application/json"
  ) {
    return reply(415, { error: "Expected application/json" });
  }
  if (Number(request.headers.get("Content-Length")) > MAX_BODY_BYTES)
    return reply(413, { error: "Message too large" });

  // Enforce the actual byte limit, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return reply(400, { error: "Invalid contact details" });
  let raw = "";
  let size = 0;
  const decoder = new TextDecoder();
  let body: unknown;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return reply(413, { error: "Message too large" });
      }
      raw += decoder.decode(chunk.value, { stream: true });
    }
    body = JSON.parse(raw + decoder.decode());
  } catch {
    return reply(400, { error: "Invalid JSON" });
  } finally {
    reader.releaseLock();
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success)
    return reply(400, { error: "Please check the contact fields and their lengths." });

  const supabaseUrl = setting("SUPABASE_URL", env);
  const serviceRoleKey = setting("SUPABASE_SERVICE_ROLE_KEY", env);
  if (!supabaseUrl || !serviceRoleKey)
    return reply(503, { error: "Contact service is not configured" });
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error("[Contact] Storage returned status", response.status);
      return reply(502, { error: "Unable to save your message" });
    }
    const email = await sendBrevoAutoReply(parsed.data, env);
    // Provider errors and identifiers are internal diagnostics, not public API data.
    return reply(201, { success: true, email: { success: email.success } });
  } catch {
    console.error("[Contact] Submission failed");
    return reply(502, { error: "Unable to send your message. Please try again later." });
  }
}
