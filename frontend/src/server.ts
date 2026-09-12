import "./server/error-capture";

import { consumeLastCapturedError } from "./server/error-capture";
import { renderErrorPage } from "./server/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import { sendBrevoAutoReply } from "./server/email";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Store contact submissions server-side so the Supabase service-role key is never exposed.
      if (url.pathname === "/api/contact" && request.method === "POST") {
        try {
          const body = (await request.json()) as {
            name?: string;
            email?: string;
            subject?: string;
            message?: string;
          };
          if (!body.name || !body.email || !body.subject || !body.message) {
            return new Response(JSON.stringify({ error: "All contact fields are required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          const supabaseUrl = process.env["SUPABASE_URL"];
          const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
          if (!supabaseUrl || !serviceRoleKey) {
            return new Response(JSON.stringify({ error: "Contact service is not configured" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            });
          }
          const response = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
            method: "POST",
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              name: body.name,
              email: body.email,
              subject: body.subject,
              message: body.message,
            }),
          });
          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Supabase Contact Error]", errorText);
            return new Response(JSON.stringify({ error: "Unable to save your message" }), {
              status: 502,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ success: true }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      }

      // Handle Brevo Auto-Reply API route
      if (url.pathname === "/api/auto-reply") {
        if (request.method === "OPTIONS") {
          return new Response(null, {
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          });
        }

        if (request.method === "POST") {
          try {
            const body = (await request.json()) as {
              name?: string;
              email?: string;
              subject?: string;
              message?: string;
            };

            if (!body.name || !body.email) {
              return new Response(
                JSON.stringify({ success: false, error: "Name and email are required" }),
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

            const result = await sendBrevoAutoReply({
              name: body.name,
              email: body.email,
              subject: body.subject,
              message: body.message,
            });

            return new Response(JSON.stringify(result), {
              status: result.success ? 200 : 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            });
          } catch (e) {
            return new Response(
              JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              },
            );
          }
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
