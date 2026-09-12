import { defineEventHandler, readBody, getMethod, setResponseHeaders } from "h3";
import { sendBrevoAutoReply } from "../../src/server/email";

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  const method = getMethod(event);

  if (method === "OPTIONS") {
    return null;
  }

  if (method !== "POST") {
    return { success: false, error: "Method not allowed" };
  }

  try {
    const body = await readBody(event);
    if (!body || !body.email || !body.name) {
      return { success: false, error: "Name and email are required" };
    }
    return await sendBrevoAutoReply(body);
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
});
