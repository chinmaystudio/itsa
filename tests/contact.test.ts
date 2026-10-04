import assert from "node:assert/strict";
import { test } from "node:test";
import { handleContact } from "../frontend/src/server/contact";

const valid = {
  name: "Test Student",
  email: "test@example.com",
  subject: "Event inquiry",
  message: "Please share the event schedule.",
};
const request = (body: unknown = valid, headers: Record<string, string> = {}) =>
  new Request("https://itsa-pccoe.pages.dev/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

test("rejects malformed fields before touching a provider", async () => {
  for (const body of [
    null,
    [],
    {},
    { ...valid, name: 42 },
    { ...valid, name: "A\r\nB" },
    { ...valid, email: "not-an-email" },
    { ...valid, subject: " " },
    { ...valid, message: "x".repeat(5001) },
  ]) {
    assert.equal((await handleContact(request(body), {})).status, 400);
  }
});

test("rejects malformed JSON, non-JSON and oversized bodies", async () => {
  assert.equal(
    (
      await handleContact(
        new Request("https://itsa-pccoe.pages.dev/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{",
        }),
        {},
      )
    ).status,
    400,
  );
  assert.equal(
    (await handleContact(request(valid, { "Content-Type": "text/plain" }), {})).status,
    415,
  );
  assert.equal((await handleContact(request({ message: "x".repeat(33000) }), {})).status, 413);
  assert.equal(
    (await handleContact(request(valid, { "Content-Length": "33000" }), {})).status,
    413,
  );
});

test("restricts origins and supports explicitly configured frontend origins", async () => {
  assert.equal(
    (await handleContact(request(valid, { Origin: "https://attacker.example" }), {})).status,
    403,
  );
  const response = await handleContact(request(valid, { Origin: "https://preview.example" }), {
    CONTACT_ALLOWED_ORIGINS: "https://preview.example",
  });
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://preview.example");
  assert.equal(response.status, 503);
});

test("handles preflight and disallows other methods", async () => {
  const response = await handleContact(
    new Request("https://itsa-pccoe.pages.dev/api/contact", {
      method: "OPTIONS",
      headers: { Origin: "https://itsa-pccoe.pages.dev" },
    }),
    {},
  );
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://itsa-pccoe.pages.dev");
  assert.equal(
    (await handleContact(new Request("https://itsa-pccoe.pages.dev/api/contact"), {})).status,
    405,
  );
});

test("stores validated data, escapes email HTML, and keeps provider details private", async () => {
  const original = globalThis.fetch;
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), body: JSON.parse(String(options?.body)) });
    return String(url).includes("supabase")
      ? new Response(null, { status: 201 })
      : Response.json({ message: "PRIVATE PROVIDER DIAGNOSTIC" }, { status: 400 });
  };
  try {
    const response = await handleContact(
      request({ ...valid, name: " Test Student ", subject: "<img src=x onerror=alert(1)>" }),
      {
        SUPABASE_URL: "https://test.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "test-only",
        BREVO_API_KEY: "xkeysib-test-only",
      },
    );
    assert.equal(response.status, 201);
    assert.equal(calls[0]?.body.name, "Test Student");
    assert.match(String(calls[1]?.body.htmlContent), /&lt;img/);
    assert.deepEqual(await response.json(), { success: true, email: { success: false } });
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  } finally {
    globalThis.fetch = original;
  }
});

test("provider failure cannot leak internal errors or send confirmation", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("PRIVATE SECRET");
  };
  try {
    const response = await handleContact(request(), {
      SUPABASE_URL: "https://test.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "test-only",
    });
    assert.equal(response.status, 502);
    assert.equal(calls, 1);
    assert.doesNotMatch(await response.text(), /PRIVATE SECRET/);
  } finally {
    globalThis.fetch = original;
  }
});
