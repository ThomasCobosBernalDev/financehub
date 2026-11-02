// Sends the one welcome email to people who sign up with Google. Email sign-ups already get the
// branded confirm email from Supabase; Google sign-ups arrive verified, so Supabase sends nothing.
// Called by auth.js (FHAuth.finishSignup) with the user's own session. Sends at most once per user:
// the send is recorded in app_metadata.welcome_sent_at, which only the server can write.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function email(lang: string, name: string) {
  const es = lang === "es";
  const t = es
    ? {
        subject: "Bienvenido a FinancedHub",
        h1: `¡Bienvenido a FinancedHub, ${name}!`,
        p: "Gracias por registrarte con Google. Tu cuenta ya está lista.",
        btn: "Seguir aprendiendo &rarr;",
        h2: "Tu camino, guardado",
        p2: "Tus lecciones, tu XP, tu racha y tu camino ahora te siguen a cualquier dispositivo. Aprende en la laptop en clase y sigue en el celular en el camión. Esperamos que tu camino vaya increíble, desde tu primera cuenta de banco hasta Wall Street.",
        note: "<b>No te preocupes, este es el único correo que te vamos a mandar.</b> Sin boletines y sin publicidad, nunca. (La única excepción: un enlace para cambiar tu contraseña, si algún día lo pides.)",
        foot: "¿No te registraste en FinancedHub? Escríbenos respondiendo a este correo.",
        link: "https://financedhub.com/es/home/",
      }
    : {
        subject: "Welcome to FinancedHub",
        h1: `Welcome to FinancedHub, ${name}!`,
        p: "Thanks for signing up with Google. Your account is all set.",
        btn: "Keep learning &rarr;",
        h2: "Your path, saved",
        p2: "Your lessons, XP, streak and path now follow you to any device. Learn on your laptop in class and pick up on your phone on the bus. We hope your path goes great, from your first bank account all the way to Wall Street.",
        note: "<b>Don&rsquo;t worry, this is the only email we&rsquo;ll send you.</b> No newsletters, no marketing, ever. (The one exception: a reset link, if you ever ask us to reset your password.)",
        foot: "Didn&rsquo;t sign up for FinancedHub? Reply to this email and let us know.",
        link: "https://financedhub.com/home/",
      };
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#efece6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#efece6;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:22px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<tr><td><a href="https://financedhub.com"><img src="https://financedhub.com/assets/og.png" width="600" alt="FinancedHub: learn money from zero to Wall Street" style="display:block;width:100%;height:auto;border:0;"></a></td></tr>
<tr><td style="padding:34px 40px 8px 40px;">
  <h1 style="margin:0 0 14px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:700;color:#1d1c19;">${t.h1}</h1>
  <p style="margin:0 0 26px 0;font-size:17px;line-height:1.6;color:#4a4740;">${t.p}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:999px;background:#1d1c19;">
    <a href="${t.link}" style="display:inline-block;padding:15px 30px;font-size:16px;font-weight:700;color:#f8f7f5;text-decoration:none;border-radius:999px;">${t.btn}</a>
  </td></tr></table>
</td></tr>
<tr><td style="padding:26px 40px 6px 40px;">
  <p style="margin:0 0 6px 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:19px;color:#1f6f5c;">${t.h2}</p>
  <p style="margin:0;font-size:16px;line-height:1.6;color:#4a4740;">${t.p2}</p>
</td></tr>
<tr><td style="padding:24px 40px 34px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:16px 18px;border-radius:14px;background:#e6efe8;font-size:15px;line-height:1.55;color:#1f4a3e;">${t.note}</td></tr></table>
  <p style="margin:22px 0 0 0;font-size:13px;line-height:1.5;color:#8a857b;">${t.foot}</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
  return { subject: t.subject, html };
}

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
  if (!key) return json({ error: "RESEND_API_KEY is not set" }, 500);

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
