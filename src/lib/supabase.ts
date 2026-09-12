// Supabase integration — merged from a branch, not yet wired to any component.
// Install: npm install @supabase/supabase-js
// Then restore the createClient import when ready.

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}

export async function submitContactForm(
  _submission: Omit<ContactSubmission, "id" | "created_at">,
): Promise<void> {
  throw new Error(
    "submitContactForm: install @supabase/supabase-js and configure VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to enable this.",
  );
}
