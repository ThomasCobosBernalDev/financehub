// Sends the one welcome email to people who sign up with Google. Email sign-ups already get the
// branded confirm email from Supabase; Google sign-ups arrive verified, so Supabase sends nothing.
// Called by auth.js (FHAuth.finishSignup) with the user's own session. Sends at most once per user:
// the send is recorded in app_metadata.welcome_sent_at, which only the server can write.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { email } from "./email.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// Projects on the new API keys get SUPABASE_SECRET_KEYS (JSON) instead of the legacy service role key.
function adminKey() {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    return keys.default || Object.values(keys)[0] as string;
  } catch { return undefined; }
}

Deno.serve(async (req) => {
  try { return await handle(req); }
  catch (e) { console.error("welcome-email failed", e); return json({ error: String(e) }, 500); }
});

async function handle(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    // Names only, never values: shows a secret saved under a slightly different name.
    console.error("RESEND_API_KEY is not set. Secret names that mention resend:", Object.keys(Deno.env.toObject()).filter((k) => /resend|api_key/i.test(k)));
    return json({ error: "RESEND_API_KEY is not set" }, 500);
  }

  const sk = adminKey();
  if (!sk) { console.error("No service key in env", Object.keys(Deno.env.toObject()).filter((k) => k.startsWith("SUPABASE"))); return json({ error: "no service key" }, 500); }
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, sk, { auth: { persistSession: false, autoRefreshToken: false } });
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: got, error } = await admin.auth.getUser(jwt);
  if (error || !got.user) { console.error("getUser failed", error); return json({ error: "Not signed in" }, 401); }
  const u = got.user;
  if (u.app_metadata?.welcome_sent_at) return json({ sent: false, reason: "already sent" });
  if (!u.email) return json({ sent: false, reason: "no email" });
  const providers: string[] = u.app_metadata?.providers || [];
  // Email-and-password sign-ups already got the confirm email, which is their welcome.
  if (!providers.includes("google") || providers.includes("email")) return json({ sent: false, reason: "not a Google sign-up" });

  const m = u.user_metadata || {};
  const { subject, html } = email(m.lang === "es" ? "es" : "en", esc(String(m.username || m.full_name || u.email.split("@")[0]).slice(0, 40)));
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "FinancedHub <hello@financedhub.com>", to: [u.email], subject, html }),
  });
  if (!r.ok) { const detail = await r.text(); console.error("Resend refused", r.status, detail); return json({ error: "Resend refused", status: r.status, detail }, 502); }
  const up = await admin.auth.admin.updateUserById(u.id, { app_metadata: { ...u.app_metadata, welcome_sent_at: new Date().toISOString() } });
  if (up.error) console.error("Could not mark welcome as sent", up.error);
  console.log("welcome sent", u.id);
  return json({ sent: true });
}
