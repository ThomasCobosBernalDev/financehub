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
  catch (e) { console.error("welcome-email failed", e); return json({ error: "failed" }, 500); }
});

async function handle(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) { console.error("RESEND_API_KEY is not set"); return json({ error: "failed" }, 500); }

  const sk = adminKey();
  if (!sk) { console.error("No service key in env"); return json({ error: "failed" }, 500); }
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

  // Claim the send before calling Resend, so a burst of calls can't send it twice.
  const meta = u.app_metadata || {};
  const claim = await admin.auth.admin.updateUserById(u.id, { app_metadata: { ...meta, welcome_sent_at: new Date().toISOString() } });
  if (claim.error) { console.error("Could not mark welcome as sent", claim.error); return json({ error: "failed" }, 500); }

  const m = u.user_metadata || {};
  const { subject, html } = email(m.lang === "es" ? "es" : "en", esc(String(m.username || m.full_name || u.email.split("@")[0]).slice(0, 40)));
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "FinancedHub <hello@financedhub.com>", to: [u.email], subject, html }),
  });
  if (!r.ok) {
    console.error("Resend refused", r.status, await r.text());
    // Let a later call try again.
    await admin.auth.admin.updateUserById(u.id, { app_metadata: { ...meta, welcome_sent_at: null } });
    return json({ error: "send failed" }, 502);
  }
  console.log("welcome sent", u.id);
  return json({ sent: true });
}
