export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}

const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

export async function submitContactForm(
  submission: Omit<ContactSubmission, "id" | "created_at">,
): Promise<void> {
  const response = await fetch(`${backendUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });

  const result = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(result.error || "Unable to submit your message.");
}
